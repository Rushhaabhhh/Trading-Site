from django.urls import path, include
from rest_framework.routers import DefaultRouter
from trading.views import TradeViewSet, CopyTradeViewSet, AuthViewSet

# Setting up the routers for viewsets
router = DefaultRouter()
router.register(r'trades', TradeViewSet)  # For managing trades
router.register(r'copytrades', CopyTradeViewSet, basename='copytrade')  # For copying trades
router.register(r'auth', AuthViewSet, basename='auth')  # For authentication (signup/login)

urlpatterns = [
    path('', include(router.urls)),  # Include all viewset routes
]
