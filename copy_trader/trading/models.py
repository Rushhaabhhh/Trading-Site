from django.db import models
from django.contrib.auth.models import User

class ZerodhaCredentials(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    zerodha_user_id = models.CharField(max_length=100)
    zerodha_password = models.CharField(max_length=100)  # In production, use proper encryption
    zerodha_totp_key = models.CharField(max_length=100)  # For generating TOTP
    enctoken = models.TextField(null=True, blank=True)
    last_login = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Zerodha Account"

class Trade(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    symbol = models.CharField(max_length=20)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    order_type = models.CharField(max_length=20)
    transaction_type = models.CharField(max_length=10)
    status = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.transaction_type} {self.symbol} at {self.price}"