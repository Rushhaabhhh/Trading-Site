import requests
import json
from django.conf import settings
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import ZerodhaAccount
from .serializers import UserSerializer, ZerodhaAccountSerializer, OrderSerializer
from .utils import KiteApp

import logging
from kiteconnect import KiteConnect, KiteTicker

class KiteApp(KiteConnect):
    def __init__(self, userid, enctoken):
        self.user_id = userid
        self.enctoken = enctoken
        self.root2 = "https://kite.zerodha.com/oms"
        self.headers = {
            "x-kite-version": "3",
            'Authorization': f'enctoken {self.enctoken}'
        }
        super().__init__(api_key=None)  # Call the parent class constructor

    def kws(self):
        return KiteTicker(
            api_key=None,
            access_token=f"{self.enctoken}&user_id={self.user_id}",
            root='wss://ws.kite.trade'
        )

    def _request(self, route, method, url_args=None, query_params=None, params=None, is_json=False):
        uri = self._routes[route].format(**url_args) if url_args else self._routes[route]
        if not uri.endswith("instruments"):
            self.root = self.root2
        
        url = self.root + uri
        headers = self.headers
        if self.debug:
            log.debug(f"Request: {method} {url} {params} {headers}")
        try:
            r = self.reqsession.request(
                method,
                url,
                json=params if (method in ["POST", "PUT"] and is_json) else None,
                data=params if (method in ["POST", "PUT"] and not is_json) else None,
                params=params if method in ["GET", "DELETE"] else None,
                headers=headers,
                verify=not self.disable_ssl,
                allow_redirects=True,
                timeout=self.timeout,
                proxies=self.proxies
            )
        except Exception as e:
            raise e

        if self.debug:
            log.debug(f"Response: {r.status_code} {r.content}")

        if "json" in r.headers["content-type"]:
            try:
                data = json.loads(r.content.decode("utf8"))
            except ValueError:
                raise Exception(f"Couldn't parse the JSON response: {r.content}")

            if data.get("error_type"):
                exp = getattr(ex, data["error_type"], ex.GeneralException)
                raise exp(data["message"], code=r.status_code)

            return data["data"]
        else:
            raise Exception(f"Unknown response content: {r.content}")

def login_with_credentials(userid, password, twofa):
    reqsession = requests.Session()
    r = reqsession.post('https://kite.zerodha.com/api/login', data={
        "user_id": userid,
        "password": password
    })

    if r.status_code != 200:
        raise Exception("Login failed. Check your credentials.")

    r = reqsession.post('https://kite.zerodha.com/api/twofa', data={
        "request_id": r.json()['data']['request_id'],
        "twofa_value": twofa,
        "user_id": r.json()['data']['user_id']
    })

    enctoken = r.cookies.get('enctoken')
    
    return enctoken

# Auth ViewSet for handling signup and login
class AuthViewSet(viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Allow any user

    @action(detail=False, methods=['post'])
    def signup(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "user": UserSerializer(user).data,
                "message": "User created successfully",
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def signin(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            return Response({
                "user": UserSerializer(user).data,
                "message": "Login successful",
            })
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)


class ZerodhaAccountViewSet(viewsets.ModelViewSet):
    serializer_class = ZerodhaAccountSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return ZerodhaAccount.objects.filter(user=self.request.user)
        return ZerodhaAccount.objects.none()

    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                # Attempt to login and get enctoken
                enctoken = login_with_credentials(
                    serializer.validated_data['zerodha_user_id'],
                    serializer.validated_data['zerodha_password'],
                    serializer.validated_data['totp_secret']
                )

                # If user is authenticated, associate the account with the user
                if request.user.is_authenticated:
                    user = request.user
                else:
                    # If not authenticated, create or get a user based on Zerodha user ID
                    user, created = User.objects.get_or_create(
                        username=serializer.validated_data['zerodha_user_id']
                    )

                # Create or update the Zerodha account
                zerodha_account, created = ZerodhaAccount.objects.update_or_create(
                    user=user,
                    zerodha_user_id=serializer.validated_data['zerodha_user_id'],
                    defaults={
                        'zerodha_password': serializer.validated_data['zerodha_password'],
                        'totp_secret': serializer.validated_data['totp_secret'],
                        'enctoken': enctoken,
                        'last_token_update': timezone.now()
                    }
                )

                return Response({
                    "message": "Login successful",
                    "account_id": zerodha_account.id
                })
            except Exception as e:
                return Response(
                    {"error": f"Failed to login to Zerodha: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def place_order(self, request, pk=None):
        zerodha_account = self.get_object()
        order_serializer = OrderSerializer(data=request.data)
        
        if order_serializer.is_valid():
            try:
                kite = KiteApp(
                    zerodha_account.zerodha_user_id,
                    zerodha_account.enctoken
                )
                
                order_data = {
                    "tradingsymbol": order_serializer.validated_data["symbol"],
                    "quantity": order_serializer.validated_data["quantity"],
                    "order_type": order_serializer.validated_data["order_type"],
                    "price": order_serializer.validated_data.get("price", None),  
                    "transaction_type": "BUY", 
                    "product": "MIS",  
                    "variety": "amo",  
                }

                order_id = kite.place_order(**order_data)  
                
                return Response({
                    "message": "Order placed successfully",
                    "order_id": order_id
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {"error": f"Failed to place order: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(order_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def get_user_profile(self, request, pk=None):
        zerodha_account = self.get_object()
        try:
            kite = KiteApp(
                zerodha_account.zerodha_user_id,
                zerodha_account.enctoken
            )
            profile = kite.profile()
            return Response(profile)
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch user profile: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
