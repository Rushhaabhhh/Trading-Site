import React, { useState } from 'react';
import { Card, Input, Button, Select, Alert } from 'antd';
import { AlertOutlined, CheckCircleOutlined } from '@ant-design/icons';

// Predefined credentials as per your Python code
const KITE_USER_ID = "Rushabh";
const KITE_API_KEY = "OJF708";
const KITE_TOKEN = "your_token_here"; // Replace with actual token

const ZerodhaOrderForm = () => {
  const { Option } = Select;

  const [orderDetails, setOrderDetails] = useState({
    symbol: 'SBIN',
    quantity: '5',
    price: '820',
    transactionType: 'BUY',
    orderType: 'LIMIT',
    exchange: 'BSE',
  });
  
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: false,
    orderId: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value, name) => {
    setOrderDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const placeOrder = async () => {
    setStatus({ loading: true, error: null, success: false, orderId: null });
    
    try {
      const formData = new URLSearchParams({
        variety: "amo",
        exchange: orderDetails.exchange,
        tradingsymbol: orderDetails.symbol,
        transaction_type: orderDetails.transactionType,
        quantity: orderDetails.quantity,
        product: 'CNC',
        order_type: orderDetails.orderType,
        price: orderDetails.price,
        validity: "DAY"
      });

      const response = await fetch('https://api.kite.trade/orders/amo', {
        method: 'POST',
        headers: {
          'X-Kite-Version': '3',
          'Authorization': `token ${KITE_API_KEY}:${KITE_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Order placement failed');
      }

      setStatus({
        loading: false,
        error: null,
        success: true,
        orderId: data.data.order_id,
      });
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message,
        success: false,
        orderId: null,
      });
    }
  };

  return (
    <Card title="Place Zerodha Order (AMO)" style={{ width: 400 }}>
      <p>Using account: {KITE_USER_ID}</p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Symbol</label>
            <Input
              name="symbol"
              value={orderDetails.symbol}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Exchange</label>
            <Select 
              value={orderDetails.exchange}
              onChange={(value) => handleSelectChange(value, 'exchange')}
            >
              <Option value="BSE">BSE</Option>
              <Option value="NSE">NSE</Option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity</label>
            <Input
              name="quantity"
              type="number"
              value={orderDetails.quantity}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Price</label>
            <Input
              name="price"
              type="number"
              value={orderDetails.price}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Transaction Type</label>
            <Select 
              value={orderDetails.transactionType}
              onChange={(value) => handleSelectChange(value, 'transactionType')}
            >
              <Option value="BUY">Buy</Option>
              <Option value="SELL">Sell</Option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Order Type</label>
            <Select 
              value={orderDetails.orderType}
              onChange={(value) => handleSelectChange(value, 'orderType')}
            >
              <Option value="MARKET">Market</Option>
              <Option value="LIMIT">Limit</Option>
            </Select>
          </div>
        </div>
      </div>
      <Button 
        type="primary"
        onClick={placeOrder} 
        loading={status.loading}
        block
      >
        {status.loading ? 'Placing Order...' : 'Place After Market Order'}
      </Button>
      
      {status.error && (
        <Alert
          message="Error"
          description={status.error}
          type="error"
          showIcon
          icon={<AlertOutlined />}
          style={{ marginTop: 16 }}
        />
      )}
      
      {status.success && (
        <Alert
          message="Success"
          description={`Order placed successfully! Order ID: ${status.orderId}`}
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
};

export default ZerodhaOrderForm;
