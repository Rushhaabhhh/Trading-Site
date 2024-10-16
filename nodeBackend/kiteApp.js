const fetch = require('node-fetch');

class KiteApp {
  constructor(apiKey, userId, enctoken) {
    this.apiKey = apiKey;
    this.userId = userId;
    this.enctoken = enctoken;
    this.root = "https://kite.zerodha.com/oms";
    this.headers = {
      "X-Kite-Version": "3",
      'Authorization': `enctoken ${this.enctoken}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    this._routes = {
      place_order: '/orders/amo',
    };
  }

  async _request(route, method, params = null) {
    const uri = this._routes[route];
    if (!uri) throw new Error('Route not found');

    let url = this.root + uri;
    const options = {
      method,
      headers: this.headers,
    };

    if (method === 'POST' || method === 'PUT') {
      options.body = new URLSearchParams(params).toString();
    } else if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += '?' + queryString;
    }

    try {
      const response = await fetch(url, options);
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.status === 'error') throw new Error(data.message);
        return data.data;
      } else {
        const text = await response.text();
        throw new Error(`Unexpected response: ${text}`);
      }
    } catch (error) {
      throw error;
    }
  }

  async placeOrder(params) {
    return this._request('place_order', 'POST', params);
  }
}

module.exports = KiteApp;
