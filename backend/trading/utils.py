import json
import logging, requests
from kiteconnect import KiteConnect, KiteTicker

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

class KiteApp(KiteConnect):
    def __init__(self, userid, enctoken):
        self.user_id = userid
        self.enctoken = enctoken
        self.root2 = "https://kite.zerodha.com/oms"
        self.headers = {
            "x-kite-version": "3",
            'Authorization': 'enctoken {}'.format(self.enctoken)
        }
        KiteConnect.__init__(self, api_key=None)  

    def kws(self):
        return KiteTicker(
            api_key=None,  
            access_token=self.enctoken+"&user_id="+self.user_id, 
            root='wss://ws.kite.trade'
        )

    def _request(self, route, method, url_args=None, query_params=None, params=None, is_json=False):
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

        if "json" in r.headers["content-type"]:
            try:
                data = json.loads(r.content.decode("utf8"))
            except ValueError:
                raise Exception(f"Couldn't parse the JSON response: {r.content}")

            if data.get("error_type"):
                exp = getattr(ex, data["error_type"], ex.GeneralException)
                raise exp(data["message"], code=r.status_code)

            return data["data"]
        else:
            raise Exception(f"Unknown response content: {r.content}")

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
    
    return enctoken
