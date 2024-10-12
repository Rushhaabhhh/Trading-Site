from django.db import models
from django.contrib.auth.models import User


class UserFollower(models.Model):
    master_trader = models.ForeignKey(User, related_name='master_traders', on_delete=models.CASCADE)
    follower_user = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)

class ZerodhaAccount(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    zerodha_user_id = models.CharField(max_length=50)
    api_key = models.CharField(max_length=100)
    enctoken = models.TextField()