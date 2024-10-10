from celery import shared_task
from .models import TradingStrategy, ZerodhaAccount, Trade
from .utils import fetch_strategy_signals, execute_trade

@shared_task
def process_trading_strategies():
    active_strategies = TradingStrategy.objects.filter(is_active=True)
    accounts = ZerodhaAccount.objects.all()
    
    for strategy in active_strategies:
        signals = fetch_strategy_signals(strategy.url)
        
        for signal in signals:
            for account in accounts:
                order = execute_trade(account, signal)
                
                if order:
                    Trade.objects.create(
                        strategy=strategy,
                        symbol=signal['symbol'],
                        quantity=signal['quantity'],
                        price=signal['price'],
                        order_type=signal['order_type'],
                        transaction_type=signal['transaction_type'],
                        status='COMPLETE'
                    )