import json
import kiteconnect.exceptions as ex
import logging, requests
from six.moves.urllib.parse import urljoin
from kiteconnect import KiteConnect, KiteTicker
import os

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

class KiteApp(KiteConnect):
    def __init__(self, api_key, userid, enctoken):
        self.api_key = api_key
        self.user_id = userid
        self.enctoken = enctoken
        self.root2 = "https://kite.zerodha.com/oms"
        self.headers = {
            "x-kite-version": "3",
            'Authorization': 'enctoken {}'.format(self.enctoken)
        }
        KiteConnect.__init__(self, api_key=api_key)

    def kws(self):
        # Use instance's API key instead of hardcoding
        return KiteTicker(api_key=self.api_key, access_token=self.enctoken+"&user_id="+self.user_id, root='wss://ws.kite.trade')

    def _request(self, route, method, url_args=None, query_params=None, params=None, is_json=False):
        """Make an HTTP request."""
        # Form a restful URL
        uri = self._routes[route].format(**url_args) if url_args else self._routes[route]
        if not uri.endswith("instruments"):
            self.root = self.root2
        
        url = self.root + uri
        headers = self.headers
        if self.debug:
            log.debug(f"Request: {method} {url} {params} {headers}")
        try:
            r = self.reqsession.request(
                method,
                url,
                json=params if (method in ["POST", "PUT"] and is_json) else None,
                data=params if (method in ["POST", "PUT"] and not is_json) else None,
                params=params if method in ["GET", "DELETE"] else None,
                headers=headers,
                verify=not self.disable_ssl,
                allow_redirects=True,
                timeout=self.timeout,
                proxies=self.proxies
            )
        except Exception as e:
            raise e

        if self.debug:
            log.debug(f"Response: {r.status_code} {r.content}")

        # Validate the content type.
        if "json" in r.headers["content-type"]:
            try:
                data = json.loads(r.content.decode("utf8"))
            except ValueError:
                raise ex.DataException(f"Couldn't parse the JSON response received from the server: {r.content}")

            # API error
            if data.get("error_type"):
                if self.session_expiry_hook and r.status_code == 403 and data["error_type"] == "TokenException":
                    self.session_expiry_hook()

                exp = getattr(ex, data["error_type"], ex.GeneralException)
                raise exp(data["message"], code=r.status_code)

            return data["data"]
        elif "csv" in r.headers["content-type"]:
            return r.content
        else:
            raise ex.DataException(f"Unknown Content-Type ({r.headers['content-type']}) with response: {r.content}")

def login_with_credentials(userid, password, twofa):
    reqsession = requests.Session()
    r = reqsession.post('https://kite.zerodha.com/api/login', data={
        "user_id": userid,
        "password": password
    })

    if r.status_code != 200:
        raise Exception("Login failed. Check your credentials.")

    r = reqsession.post('https://kite.zerodha.com/api/twofa', data={
        "request_id": r.json()['data']['request_id'],
        "twofa_value": twofa,
        "user_id": r.json()['data']['user_id']
    })

    enctoken = r.cookies.get('enctoken')
    
    os.makedirs('utils', exist_ok=True)
    with open('utils/enctoken.txt', 'w') as wr:
        wr.write(enctoken)

    return enctoken
