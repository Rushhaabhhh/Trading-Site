import logging
import requests
import os
from time import sleep
from kiteconnect import KiteConnect
import kiteconnect.exceptions as ex

# Configure logging
logging.basicConfig(level=logging.DEBUG)
log = logging.getLogger(__name__)

class AlphaVantage:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://www.alphavantage.co/query?"

    def fetch_rsi(self, symbol, interval="daily", time_period=14, series_type="close"):
        params = {
            "function": "RSI",
            "symbol": symbol,
            "interval": interval,
            "time_period": time_period,
            "series_type": series_type,
            "apikey": self.api_key.strip("+")
        }

        url = self.base_url + '&'.join([f"{key}={value}" for key, value in params.items()])
        
        response = requests.get(url)

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
    def __init__(self, api_key, userid, enctoken):
        super().__init__(api_key=api_key)  # Pass the API key here
        self.userid = userid
        self.enctoken = enctoken
        self.set_access_token(enctoken)

    def place_kite_order(self, tradingsymbol, transaction_type, quantity='1', variety="amo", exchange="NSE"):
        try:
            order_id = self.place_order(
                tradingsymbol=tradingsymbol,
                transaction_type=transaction_type,
                quantity=quantity,
                variety=variety,  # Added variety
                exchange=exchange,
                product="CNC",  # Uncomment if needed
                order_type="MARKET"  # Uncomment if needed
            )
            if order_id:
                log.info(f"Order placed successfully. Order ID: {order_id}")
            else:
                log.warning("Order placement returned None.")
            return order_id
        except ex.InputException as e:
            log.error(f"Input error during order placement: {e}")
        except ex.OrderException as e:
            log.error(f"Order error: {e}")
        except Exception as e:
            log.error(f"Failed to place order: {e}")

def login_with_credentials(userid, password):
    reqsession = requests.Session()
    
    r = reqsession.post('https://kite.zerodha.com/api/login', data={
        "user_id": userid,
        "password": password
    })

    if r.status_code != 200:
        raise Exception("Login failed. Check your credentials.")

    r = reqsession.post('https://kite.zerodha.com/api/twofa', data={
        "request_id": r.json()['data']['request_id'],
        "twofa_value": input("Enter the 2FA code: "),
        "user_id": r.json()['data']['user_id']
    })

    enctoken = r.cookies.get('enctoken')

    if not enctoken:
        raise Exception("Failed to get enctoken. Check login process.")

    os.makedirs('utils', exist_ok=True)
    with open('utils/enctoken.txt', 'w') as wr:
        wr.write(enctoken)

    return enctoken

def main():
    ALPHA_VANTAGE_API_KEY = 'W60I97T1F0G8XOW6'
    KITE_API_KEY = 'your_kite_api_key'  # Add your Kite API key here
    SYMBOL = 'AAPL'
    av = AlphaVantage(api_key=ALPHA_VANTAGE_API_KEY)

    USER_ID = 'OJF708'
    PASSWORD = 'rushabh1610'

    try:
        enctoken = login_with_credentials(USER_ID, PASSWORD)
        kite_app = KiteApp(api_key=KITE_API_KEY, userid=USER_ID, enctoken=enctoken)

        while True:
            rsi = av.fetch_rsi(symbol=SYMBOL)

            if rsi < 70:  # Example RSI threshold
                kite_app.place_kite_order(tradingsymbol='AAPL', transaction_type='BUY', quantity=1)

            log.info("Sleeping for 1 hour before next check...")
            sleep(3600)

    except Exception as e:
        log.error(f"Error in strategy: {e}")

if __name__ == "__main__":
    main()
