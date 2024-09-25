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
    api_key = settings.ALPHA_VANTAGE_API_KEY
    url = f"https://www.alphavantage.co/query"
    params = {
        'function': 'TIME_SERIES_INTRADAY',
        'symbol': symbol,
        'interval': '1min',
        'apikey': api_key
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()  # Raises an error for bad responses
        data = response.json()

        # Navigate to the latest trading data
        time_series = data.get('Time Series (1min)', {})
        if time_series:
            latest_time = sorted(time_series.keys())[0]  # Get the latest time key
            latest_data = time_series[latest_time]
            current_price = float(latest_data['1. open'])  # Use the '1. open' for the opening price
            return current_price
        else:
            return None  # No data found for the given symbol
    except requests.RequestException as e:
        print(f"Error fetching data: {e}")
        return None

# Trade ViewSet
# views.py

class TradeViewSet(viewsets.ModelViewSet):
    queryset = Trade.objects.all()
    serializer_class = TradeSerializer

    def perform_create(self, serializer):
        action = self.request.data.get('action')  # 'BUY' or 'SELL'
        symbol = self.request.data.get('symbol')
        quantity = self.request.data.get('quantity')
        capital = self.request.data.get('capital')
        entry_price = fetch_trading_data(symbol)  # Fetch real-time price

        # Save the trade
        trade = serializer.save(
            user=self.request.user,
            action=action,
            entry_price=entry_price
        )

        # Copy this trade to followers
        self.copy_trade_to_followers(trade, quantity, capital, action)

    def copy_trade_to_followers(self, trade, quantity, capital, action):
        # Assuming you have a way to get followers
        followers = User.objects.filter(following=trade.user)  # Example query
        for follower in followers:
            # Calculate how much to allocate for the copy
            allocation = capital / quantity  # This can be modified according to your logic
            CopyTradeViewSet.create_copy_trade(follower, trade, allocation, action)

# CopyTrade ViewSet
class CopyTradeViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @staticmethod
    def create_copy_trade(follower, trade, allocation, action):
        current_price = fetch_trading_data(trade.symbol) or trade.entry_price
        quantity = allocation / current_price

        new_trade = Trade.objects.create(
            user=follower,  # Linking to the follower's account
            name=trade.name,
            capital=allocation,
            symbol=trade.symbol,
            segment=trade.segment,
            expiry=trade.expiry,
            buy_sell=trade.buy_sell,
            quantity=quantity,
            entry_price=current_price,
            target_price=trade.target_price,
            stop_loss=trade.stop_loss,
            action=action
        )

        serializer = TradeSerializer(new_trade)
        return serializer.data  # Or do something else as needed



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
