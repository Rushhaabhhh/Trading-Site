from django.urls import path, include
from rest_framework.routers import DefaultRouter
from trading.views import AuthViewSet, ZerodhaAccountViewSet


# Setting up the routers for viewsets
router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth') 
router.register(r'demat', ZerodhaAccountViewSet, basename='demat')

urlpatterns = [
    path('', include(router.urls)),  # Include all viewset routes
]
