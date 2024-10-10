import json
import logging
import requests
from kiteconnect import KiteConnect
import pyotp

class KiteApp(KiteConnect):
    def __init__(self, userid, enctoken):
        self.api_key = "your_dummy_api_key"  # Dummy API key, not actually used
        self.user_id = userid
        self.enctoken = enctoken
        self.root2 = "https://kite.zerodha.com/oms"
        self.headers = {
            "x-kite-version": "3",
            'Authorization': f'enctoken {self.enctoken}'
        }
        super().__init__(api_key=self.api_key)

    def _request(self, route, method, url_args=None, params=None, is_json=False):
        uri = self._routes[route].format(**url_args) if url_args else self._routes[route]
        if not uri.endswith("instruments"):
            self.root = self.root2
        
        url = self.root + uri
        
        try:
            r = self.reqsession.request(
                method,
                url,
                json=params if (method in ["POST", "PUT"] and is_json) else None,
                data=params if (method in ["POST", "PUT"] and not is_json) else None,
                params=params if method in ["GET", "DELETE"] else None,
                headers=self.headers,
                verify=not self.disable_ssl
            )
            return self._parse_response(r)
        except Exception as e:
            logging.error(f"Request failed: {e}")
            raise

def login_with_credentials(userid, password, totp_key):
    try:
        # Generate TOTP
        totp = pyotp.TOTP(totp_key)
        twofa = totp.now()
        
        # Login request
        session = requests.Session()
        response = session.post('https://kite.zerodha.com/api/login', data={
            "user_id": userid,
            "password": password
        })
        response.raise_for_status()
        
        # Two-factor authentication
        twofa_response = session.post('https://kite.zerodha.com/api/twofa', data={
            "request_id": response.json()['data']['request_id'],
            "twofa_value": twofa,
            "user_id": response.json()['data']['user_id']
        })
        twofa_response.raise_for_status()
        
        enctoken = twofa_response.cookies.get('enctoken')
        if not enctoken:
            raise ValueError("Failed to obtain enctoken")
        
        return enctoken
    except requests.exceptions.RequestException as e:
        logging.error(f"Login failed: {e}")
        raise