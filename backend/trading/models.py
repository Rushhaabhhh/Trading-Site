from django.db import models
from django.contrib.auth.models import User

# Choices for Buy/Sell, Segment, and Expiry
BUY_SELL_CHOICES = [
    ('B', 'Buy'),
    ('S', 'Sell'),
]

SEGMENT_CHOICES = [
    ('EQ', 'Equity'),
    ('FO', 'Futures & Options'),
    ('CD', 'Currency Derivatives'),
    ('CO', 'Commodity Derivatives'),
]

EXPIRY_CHOICES = [
    ('current_week', 'Current Week'),
    ('next_week', 'Next Week'),
    ('monthly', 'Monthly'),
]

class Trade(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100, help_text="Name of the trade", default="")
    capital = models.DecimalField(max_digits=15, decimal_places=2, help_text="Capital allocated to this trade", default=0)
    symbol = models.CharField(max_length=10, help_text="Trading symbol, e.g., NIFTY50")
    segment = models.CharField(max_length=2, choices=SEGMENT_CHOICES, help_text="Trading segment", default='EQ')
    expiry = models.CharField(max_length=20, choices=EXPIRY_CHOICES, help_text="Expiry period of the options/futures", default='current_week')
    buy_sell = models.CharField(max_length=1, choices=BUY_SELL_CHOICES, help_text="Buy or Sell order", default='B')
    quantity = models.IntegerField(help_text="Number of lots or shares")
    entry_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price at which trade is entered", default=0)
    target_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Target price to exit", default=0)
    stop_loss = models.DecimalField(max_digits=10, decimal_places=2, help_text="Stop loss price to limit risk", default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.symbol} ({'Buy' if self.buy_sell == 'B' else 'Sell'})"

    def calculate_risk_reward_ratio(self):
        """A helper method to calculate the risk/reward ratio."""
        risk = self.entry_price - self.stop_loss if self.buy_sell == 'B' else self.stop_loss - self.entry_price
        reward = self.target_price - self.entry_price if self.buy_sell == 'B' else self.entry_price - self.target_price
        return reward / risk if risk != 0 else None