import json
import logging
import os

from django.conf import settings
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from kiteconnect import KiteConnect, KiteTicker

from .models import ZerodhaAccount
from .serializers import UserSerializer, OrderSerializer
from .utils import KiteApp

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
    queryset = ZerodhaAccount.objects.all()
    serializer_class = OrderSerializer

    @action(detail=True, methods=['post'], url_path='place_order')
    def place_order(self, request, pk=None):
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            try:
                zerodha_account = self.get_object()
                kite = KiteApp(
                    zerodha_account.api_key,
                    zerodha_account.zerodha_user_id,
                    zerodha_account.enctoken
                )

                order_id = kite.place_order(
                    variety=serializer.validated_data['variety'],
                    exchange=serializer.validated_data['exchange'],
                    tradingsymbol=serializer.validated_data['tradingsymbol'],
                    transaction_type=serializer.validated_data['transaction_type'],
                    quantity=serializer.validated_data['quantity'],
                    product=serializer.validated_data['product'],
                    order_type=serializer.validated_data['order_type'],
                    price=serializer.validated_data['price'],
                    validity=serializer.validated_data['validity']
                )

                return Response({"message": "Order placed successfully", "order_id": order_id}, status=status.HTTP_200_OK)
            except ZerodhaAccount.DoesNotExist:
                return Response({"error": "Zerodha account not found"}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)