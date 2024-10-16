const express = require('express');
const KiteApp = require('../kiteApp');

const router = express.Router();
let kiteApp;

router.post('/place-order', async (req, res) => {
  try {
    if (!kiteApp) throw new Error('Not logged in. Please login first.');

    const orderParams = {
      exchange: req.body.exchange,
      tradingsymbol: req.body.symbol,
      transaction_type: req.body.transactionType,
      quantity: req.body.quantity,
      product: 'CNC',
      order_type: req.body.orderType,
      validity: 'DAY',
    };

    if (req.body.orderType === 'LIMIT' && req.body.price) {
      orderParams.price = req.body.price;
    }

    const orderResponse = await kiteApp.placeOrder(orderParams);
    res.json({ success: true, data: orderResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
