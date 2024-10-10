from django.db import models
from django.contrib.auth.models import User


class UserFollower(models.Model):
    master_trader = models.ForeignKey(User, related_name='master_traders', on_delete=models.CASCADE)
    follower_user = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)

class ZerodhaAccount(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    zerodha_user_id = models.CharField(max_length=50)
    zerodha_password = models.CharField(max_length=100)
    totp_secret = models.CharField(max_length=32)
    enctoken = models.TextField(null=True, blank=True)
    last_token_update = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'zerodha_user_id')

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    symbol = models.CharField(max_length=10)
    quantity = models.IntegerField()
    order_type = models.CharField(max_length=10)  # e.g., 'buy' or 'sell'
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.order_type} {self.quantity} of {self.symbol} at {self.price}"