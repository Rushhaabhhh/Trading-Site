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
from kiteapp import KiteApp

# Fetch trading data function
def fetch_trading_data(symbol):
    # This is a placeholder for real trading data
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

    @action(detail=True, methods=['post'])
    def place_order(self, request, pk=None):
        trade = self.get_object()
        
        # Initialize Kite App
        token_path = 'utils/enctoken.txt'  # Ensure the path to your token file is correct
        try:
            with open(token_path, 'r') as rd:
                token = rd.read().strip()
            kite = KiteApp(api_key=settings.KITE_API_KEY, userid=request.user.username, enctoken=token)
            
            # Place Order
            order_id = kite.place_order(
                variety="amo",
                exchange='NSE',
                tradingsymbol=trade.symbol,
                transaction_type=trade.buy_sell,
                quantity=trade.quantity,
                product='CNC',
                order_type="LIMIT",
                price=trade.entry_price,
                validity="DAY"
            )
            return Response({"order_id": order_id}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
                user=request.user,
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

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"id": user.id, "username": user.username}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
