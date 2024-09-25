import requests
from django.conf import settings
from .models import Trade
from .serializers import TradeSerializer, UserSerializer
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User

from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response

# Fetch trading data function
def fetch_trading_data(symbol):
    dummy_data = {
        "AAPL": 150.00,
        "MSFT": 280.00,
        "GOOGL": 2700.00,
        "TSLA": 800.00
    }
    return dummy_data.get(symbol, None)


# Trade ViewSet
class TradeViewSet(viewsets.ModelViewSet):
    queryset = Trade.objects.all()
    serializer_class = TradeSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# CopyTrade ViewSet
class CopyTradeViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def copy(self, request):
        trade_id = request.data.get('trade_id')
        if not trade_id:
            return Response({"error": "Trade ID not provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            trade_to_copy = Trade.objects.get(id=trade_id)
            current_price = fetch_trading_data(trade_to_copy.symbol) or trade_to_copy.entry_price

            new_trade = Trade.objects.create(
                name=trade_to_copy.name,
                capital=trade_to_copy.capital,
                symbol=trade_to_copy.symbol,
                segment=trade_to_copy.segment,
                expiry=trade_to_copy.expiry,
                buy_sell=trade_to_copy.buy_sell,
                quantity=trade_to_copy.quantity,
                entry_price=current_price,
                target_price=trade_to_copy.target_price,
                stop_loss=trade_to_copy.stop_loss,
            )

            serializer = TradeSerializer(new_trade)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Trade.DoesNotExist:
            return Response({"error": "Trade not found"}, status=status.HTTP_404_NOT_FOUND)


# Auth ViewSet for handling signup and login
class AuthViewSet(viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

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
