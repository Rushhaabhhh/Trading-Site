import React, { useState } from 'react';

function OrderForm({ token, onPlaceOrder }) {
  const [orderData, setOrderData] = useState({
    exchange: 'NSE',
    symbol: '',
    transactionType: 'BUY',
    quantity: '',
    orderType: 'MARKET',
    price: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPlaceOrder(orderData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="exchange" className="block mb-1">Exchange:</label>
        <select
          id="exchange"
          name="exchange"
          value={orderData.exchange}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="NSE">NSE</option>
          <option value="BSE">BSE</option>
        </select>
      </div>
      <div>
        <label htmlFor="symbol" className="block mb-1">Symbol:</label>
        <input
          type="text"
          id="symbol"
          name="symbol"
          value={orderData.symbol}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label htmlFor="transactionType" className="block mb-1">Transaction Type:</label>
        <select
          id="transactionType"
          name="transactionType"
          value={orderData.transactionType}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </select>
      </div>
      <div>
        <label htmlFor="quantity" className="block mb-1">Quantity:</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={orderData.quantity}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label htmlFor="orderType" className="block mb-1">Order Type:</label>
        <select
          id="orderType"
          name="orderType"
          value={orderData.orderType}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="MARKET">Market</option>
          <option value="LIMIT">Limit</option>
        </select>
      </div>
      {orderData.orderType === 'LIMIT' && (
        <div>
          <label htmlFor="price" className="block mb-1">Price:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={orderData.price}
            onChange={handleChange}
            step="0.01"
            required
            className="w-full p-2 border rounded"
          />
        </div>
      )}
      <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
        Place Order
      </button>
    </form>
  );
}

export default OrderForm;
