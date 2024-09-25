from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Trade

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


# TradeSerializer for handling trade creation and displaying trade data
class TradeSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username') 

    class Meta:
        model = Trade
        fields = [
            'id', 'user', 'name', 'capital', 'symbol', 'segment', 'expiry',
            'buy_sell', 'quantity', 'entry_price', 'target_price', 'stop_loss',
            'created_at'
        ]

    def create(self, validated_data):
        validated_data.pop('user', None)  
        trade = Trade.objects.create(**validated_data)
        return trade


# Serializer for copying a trade
class CopyTradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = [
            'id', 'name', 'capital', 'symbol', 'segment', 'expiry',
            'buy_sell', 'quantity', 'entry_price', 'target_price', 'stop_loss'
        ]

    def create(self, validated_data):
        original_trade = self.context.get('original_trade')
        if not original_trade:
            raise serializers.ValidationError("Original trade must be provided in context.")

        new_trade = Trade.objects.create(
            user=self.context['request'].user,
            name=original_trade.name,
            capital=original_trade.capital,
            symbol=original_trade.symbol,
            segment=original_trade.segment,
            expiry=original_trade.expiry,
            buy_sell=original_trade.buy_sell,
            quantity=original_trade.quantity,
            entry_price=original_trade.entry_price,
            target_price=original_trade.target_price,
            stop_loss=original_trade.stop_loss
        )
        return new_trade
