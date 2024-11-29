import React, { useState } from 'react';
import { Banknote, TrendingUp, DollarSign, ShoppingCart, List, Tag } from 'lucide-react'; // Importing icons from Lucide

function OrderForm({ token, onPlaceOrder }) {
  const [orderData, setOrderData] = useState({
    exchange: 'NSE',
    symbol: '',
    transactionType: 'BUY',
    quantity: '',
    orderType: 'MARKET',
    price: '',
  });
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' }); // State for success/error messages

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await onPlaceOrder(orderData); // Call the parent function to place the order
      if (response && response.success) {
        setStatusMessage({ type: 'success', message: 'Order placed successfully!' });
        setOrderData({
          exchange: 'NSE',
          symbol: '',
          transactionType: 'BUY',
          quantity: '',
          orderType: 'MARKET',
          price: '',
        });
      } else {
        throw new Error(response?.message || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      setStatusMessage({ type: 'error', message: error.message || 'Something went wrong!' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-blue-600 text-center mb-6">Place Your Zerodha Order</h2>
        
        {/* Status Message */}
        {statusMessage.message && (
          <div
            className={`p-4 mb-6 rounded ${
              statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {statusMessage.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exchange Selection */}
          <div>
            <label htmlFor="exchange" className="block text-gray-700 font-medium mb-2">Exchange</label>
            <div className="relative">
              <Banknote className="absolute left-3 top-3 text-blue-600" />
              <select
                id="exchange"
                name="exchange"
                value={orderData.exchange}
                onChange={handleChange}
                required
                className="w-full pl-10 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
              </select>
            </div>
          </div>

          {/* Stock Symbol */}
          <div>
            <label htmlFor="symbol" className="block text-gray-700 font-medium mb-2">Stock Symbol</label>
            <div className="relative">
              <TrendingUp className="absolute left-3 top-3 text-blue-600" />
              <input
                type="text"
                id="symbol"
                name="symbol"
                value={orderData.symbol}
                onChange={handleChange}
                required
                placeholder="e.g., INFY, TCS"
                className="w-full pl-10 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Transaction Type */}
          <div>
            <label htmlFor="transactionType" className="block text-gray-700 font-medium mb-2">Transaction Type</label>
            <div className="relative">
              <ShoppingCart className="absolute left-3 top-3 text-blue-600" />
              <select
                id="transactionType"
                name="transactionType"
                value={orderData.transactionType}
                onChange={handleChange}
                required
                className="w-full pl-10 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-gray-700 font-medium mb-2">Quantity</label>
            <div className="relative">
              <List className="absolute left-3 top-3 text-blue-600" />
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={orderData.quantity}
                onChange={handleChange}
                required
                placeholder="Enter quantity"
                className="w-full pl-10 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Order Type */}
          <div>
            <label htmlFor="orderType" className="block text-gray-700 font-medium mb-2">Order Type</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 text-blue-600" />
              <select
                id="orderType"
                name="orderType"
                value={orderData.orderType}
                onChange={handleChange}
                required
                className="w-full pl-10 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MARKET">Market</option>
                <option value="LIMIT">Limit</option>
              </select>
            </div>
          </div>

          {/* Price (only for LIMIT orders) */}
          {orderData.orderType === 'LIMIT' && (
            <div>
              <label htmlFor="price" className="block text-gray-700 font-medium mb-2">Price</label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 text-blue-600" />
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={orderData.price}
                  onChange={handleChange}
                  step="0.01"
                  required
                  placeholder="Enter price"
                  className="w-full pl-10 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
}

export default OrderForm;
