const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const KITE_API_KEY = process.env.KITE_API_KEY || 'iulrmlbouikhv7x7';
let kiteApp;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ success: false, message: 'No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
    req.userId = decoded.id;
    next();
  });
};

class KiteApp {
  constructor(apiKey, userId, enctoken) {
    this.apiKey = apiKey;
    this.userId = userId;
    this.enctoken = enctoken;
    this.root = "https://api.kite.trade";
    this.root2 = "https://kite.zerodha.com/oms";
    this.headers = {
      "X-Kite-Version": "3",
      'Authorization': `enctoken ${this.enctoken}`
    };
    this._routes = {
      place_order: "/orders/regular",
      // Add other routes as needed
    };
  }

  async _request(route, method, params = null, isJson = false) {
    let uri = this._routes[route];
    let url = uri.endsWith("instruments") ? this.root + uri : this.root2 + uri;

    const options = {
      method,
      headers: this.headers,
    };

    if (method === 'POST' || method === 'PUT') {
      options.body = isJson ? JSON.stringify(params) : new URLSearchParams(params);
    } else if (method === 'GET' || method === 'DELETE') {
      url += '?' + new URLSearchParams(params);
    }

    try {
      const response = await fetch(url, options);
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('json')) {
        const data = await response.json();
        if (data.error_type) {
          throw new Error(data.message);
        }
        return data.data;
      } else if (contentType && contentType.includes('csv')) {
        return await response.text();
      } else {
        throw new Error(`Unknown Content-Type (${contentType}) with response: ${await response.text()}`);
      }
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // kws() {
  //   // This method would need to be implemented separately, as it requires a WebSocket connection
  //   // which is not directly translatable from the Python KiteTicker
  //   throw new Error("WebSocket functionality not implemented in this version");
  // }
}

async function loginWithCredentials(userId, password, twofa) {
  try {
    const loginResponse = await fetch('https://kite.zerodha.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ user_id: userId, password })
    });

    if (!loginResponse.ok) {
      throw new Error("Login failed. Check your credentials.");
    }

    const loginData = await loginResponse.json();

    const twoFaResponse = await fetch('https://kite.zerodha.com/api/twofa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        request_id: loginData.data.request_id,
        twofa_value: twofa,
        user_id: loginData.data.user_id
      })
    });

    if (!twoFaResponse.ok) {
      throw new Error("2FA failed.");
    }

    const cookies = twoFaResponse.headers.raw()['set-cookie'];
    const enctokenCookie = cookies.find(cookie => cookie.startsWith('enctoken='));

    if (!enctokenCookie) {
      throw new Error("enctoken not found in cookies");
    }

    const enctoken = enctokenCookie.split(';')[0].split('=')[1];

    await fs.mkdir('utils', { recursive: true });
    await fs.writeFile('utils/enctoken.txt', enctoken);

    return enctoken;
  } catch (error) {
    console.error('Login error:', error.message);
    throw error;
  }
}

app.post('/api/login', async (req, res) => {
  try {
    const { userId, password, twofa } = req.body;
    const enctoken = await loginWithCredentials(userId, password, twofa);
    
    kiteApp = new KiteApp(KITE_API_KEY, userId, enctoken);

    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ success: true, message: 'Logged in successfully', token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/place-order', verifyToken, async (req, res) => {
  try {
    if (!kiteApp) {
      throw new Error('Not logged in. Please login first.');
    }

    const orderResponse = await kiteApp._request('place_order', 'POST', req.body);

    res.json({ success: true, data: orderResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});