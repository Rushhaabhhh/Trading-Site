import logging
import requests
import json
import os
from time import sleep
from kiteconnect import KiteConnect, KiteTicker
import kiteconnect.exceptions as ex

# Configure logging
log = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

class AlphaVantage:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://www.alphavantage.co/query?"

    def fetch_rsi(self, symbol, interval="daily", time_period=14, series_type="close"):
        """Fetch RSI from Alpha Vantage"""
        params = {
            "function": "RSI",
            "symbol": symbol,
            "interval": interval,
            "time_period": time_period,
            "series_type": series_type,
            "apikey": self.api_key.strip("+")
        }

        url = self.base_url + '&'.join([f"{key}={value}" for key, value in params.items()])
        log.debug(f"Full Alpha Vantage URL: {url}")

        response = requests.get(url)
        log.debug(f"Alpha Vantage response: {response.text}")

        data = response.json()

        if "Technical Analysis: RSI" in data:
            latest_date = list(data["Technical Analysis: RSI"].keys())[0]
            latest_rsi = data["Technical Analysis: RSI"][latest_date]["RSI"]
            log.info(f"RSI for {symbol} on {latest_date}: {latest_rsi}")
            return float(latest_rsi)
        else:
            log.error(f"Failed to fetch RSI data: {data}")
            raise Exception(f"Error fetching RSI for {symbol}")

class KiteApp(KiteConnect):
    def __init__(self, userid, enctoken):
        self.userid = userid
        self.enctoken = enctoken
        self.root2 = "https://kite.zerodha.com/oms"
        self.headers = {
            "x-kite-version": "3",
            'Authorization': 'enctoken {}'.format(self.enctoken)
        }
        super().__init__(api_key=None)  # No API key needed

    def place_order(self, symbol, transaction_type, quantity):
        """Place an order using the Kite API."""
        try:
            order_id = super().place_order(
                variety="regular",  # Specify the order variety
                exchange="BSE",
                tradingsymbol=symbol,
                transaction_type=transaction_type,
                quantity=quantity,
                product="MIS",
                order_type="MARKET"
            )
            log.info(f"Order placed successfully. Order ID: {order_id}")
        except Exception as e:
            log.error(f"Failed to place order: {e}")

def login_with_credentials(userid, password):
    """Login to Zerodha using credentials and return enctoken"""
    reqsession = requests.Session()
    
    r = reqsession.post('https://kite.zerodha.com/api/login', data={
        "user_id": userid,
        "password": password
    })

    if r.status_code != 200:
        raise Exception("Login failed. Check your credentials.")

    r = reqsession.post('https://kite.zerodha.com/api/twofa', data={
        "request_id": r.json()['data']['request_id'],
        "twofa_value": input("Enter the 2FA code: "),  # Ask for 2FA code input
        "user_id": r.json()['data']['user_id']
    })

    enctoken = r.cookies.get('enctoken')

    os.makedirs('utils', exist_ok=True)
    with open('utils/enctoken.txt', 'w') as wr:
        wr.write(enctoken)

    return enctoken

def main():
    # Alpha Vantage API details
    ALPHA_VANTAGE_API_KEY = 'W60I97T1F0G8XOW6'
    SYMBOL = 'SBIN.BSE'
    av = AlphaVantage(api_key=ALPHA_VANTAGE_API_KEY)

    # Zerodha login credentials
    USER_ID = 'OJF708'
    PASSWORD = 'rushabh1610'

    try:
        # Login to Zerodha and get enctoken
        enctoken = login_with_credentials(USER_ID, PASSWORD)
        kite_app = KiteApp(userid=USER_ID, enctoken=enctoken)

        # Fetch RSI from Alpha Vantage
        rsi = av.fetch_rsi(symbol=SYMBOL)

        # Place trade if RSI conditions meet
        if rsi < 45:  # Example threshold
            kite_app.place_order(symbol='SBIN', transaction_type='BUY', quantity=1)

    except Exception as e:
        log.error(f"Error in strategy: {e}")

    log.info("Sleeping for 1 hour before next check...")
    sleep(3600)

if __name__ == "__main__":
    while True:
        main()
