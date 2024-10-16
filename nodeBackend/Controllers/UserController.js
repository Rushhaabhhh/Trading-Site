const express = require('express');
const fs = require('fs').promises;
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const KiteApp = require('../kiteApp');

dotenv.config();

const router = express.Router();
const KITE_API_KEY = process.env.KITE_API_KEY; 
let kiteApp;

async function loginWithCredentials(userId, password, twofa) {
  try {
    let response = await fetch('https://kite.zerodha.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ user_id: userId, password })
    });

    if (!response.ok) throw new Error("Login failed. Check your credentials.");

    const loginData = await response.json();
    response = await fetch('https://kite.zerodha.com/api/twofa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        request_id: loginData.data.request_id,
        twofa_value: twofa,
        user_id: loginData.data.user_id
      })
    });

    const cookies = response.headers.raw()['set-cookie'];
    const tokenValue = cookies.find(cookie => cookie.startsWith('enctoken='));

    if (tokenValue) {
      const enctoken = tokenValue.replace('enctoken=', '').split(';')[0];
      await fs.mkdir('utils', { recursive: true });
      await fs.writeFile('utils/enctoken.txt', enctoken);
      return enctoken;
    } else {
      throw new Error('enctoken not found in cookies');
    }
  } catch (error) {
    throw error;
  }
}

router.post('/login', async (req, res) => {
  try {
    const { userId, password, twofa } = req.body;
    const enctoken = await loginWithCredentials(userId, password, twofa);
    kiteApp = new KiteApp(KITE_API_KEY, userId, enctoken);
    res.json({ success: true, message: 'Logged in successfully', enctoken });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
