from django.db import models
from django.contrib.auth.models import User
from .models import ZerodhaAccount, Order
from rest_framework import serializers
from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

# UserSerializer for managing user data and authentication
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        user = User(username=validated_data['username'])
        user.set_password(validated_data['password'])
        user.save()
        return user


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

    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
    
class ZerodhaAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZerodhaAccount
        fields = ['id', 'zerodha_user_id', 'zerodha_password', 'totp_secret']
        extra_kwargs = {
            'zerodha_password': {'write_only': True},
            'totp_secret': {'write_only': True},
        }

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order  # Replace with your actual Order model
        fields = ['id', 'symbol', 'quantity', 'order_type', 'price']
