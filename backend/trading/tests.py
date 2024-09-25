from django.test import TestCase
from .models import Trade, UserFollower, User

class TradeModelTests(TestCase):
    def setUp(self):
        self.master_user = User.objects.create_user(username='master_trader', password='password123')
        self.follower_user = User.objects.create_user(username='follower_user', password='password123')

        # Create a UserFollower relationship
        UserFollower.objects.create(master_trader=self.master_user, follower_user=self.follower_user)

    def test_get_followers(self):
        followers = get_followers(self.master_user)
        self.assertIn(self.follower_user, followers)

    def test_copy_trade_to_followers(self):
        master_trade = Trade.objects.create(
            user=self.master_user,
            name="Sample Trade",
            capital=1000,
            symbol="NIFTY50",
            segment="EQ",
            expiry="current_week",
            buy_sell="B",
            quantity=1,
            entry_price=150,
            target_price=200,
            stop_loss=140,
            action="OPEN",
        )
        master_trade.copy_trade_to_followers()
        
        # Check if the copy trade was created for the follower
        copied_trade = Trade.objects.filter(user=self.follower_user).first()
        self.assertIsNotNone(copied_trade)
        self.assertEqual(copied_trade.symbol, master_trade.symbol)
        self.assertEqual(copied_trade.quantity, master_trade.quantity)  # Check if the quantity is correct
