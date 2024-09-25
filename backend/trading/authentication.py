# trading/authentication.py

from rest_framework import authentication, exceptions
from django.contrib.auth.models import User

class CustomAuth(authentication.BaseAuthentication):
    def authenticate(self, request):
        username = request.headers.get('username')
        password = request.headers.get('password')

        if not username or not password:
            return None

        try:
            user = User.objects.get(username=username)
            if user.check_password(password):
                return (user, None)
            else:
                raise exceptions.AuthenticationFailed('Invalid password')
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('User not found')