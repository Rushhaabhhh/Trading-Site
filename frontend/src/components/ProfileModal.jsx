import React, { useState } from 'react';
import axios from 'axios';

const PlaceOrder = () => {
    const [orderDetails, setOrderDetails] = useState({
        symbol: "AAPL",
        quantity: 10,
        order_type: "buy",
        price: 150.00
    });
    const [message, setMessage] = useState('');

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        const zerodhaAccountId = 1; // Dummy ID for testing
        const token = "2zkd1Pv95cXVDyiHtIHV4kFmmzNVLEay1w67x3zl9LPX3nlNXpKh463MQcJiPSV5nQBkLGUKttVm++JOD+XN30A/nntxgi3Bh0LTN3cTa4aQO7w0s2AeUA=="; // Replace with a valid auth token

        try {
            const response = await axios.post(
                `http://127.0.0.1:8000/demat/${zerodhaAccountId}/place_order/`,
                orderDetails,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setMessage(`Order placed successfully! Order ID: ${response.data.order_id}`);
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error placing order');
        }
    };

    return (
        <div>
            <h2>Place Order</h2>
            <form onSubmit={handlePlaceOrder}>
                <input
                    type="text"
                    name="symbol"
                    value={orderDetails.symbol}
                    onChange={(e) => setOrderDetails({ ...orderDetails, symbol: e.target.value })}
                    placeholder="Symbol"
                    required
                />
                <input
                    type="number"
                    name="quantity"
                    value={orderDetails.quantity}
                    onChange={(e) => setOrderDetails({ ...orderDetails, quantity: Number(e.target.value) })}
                    placeholder="Quantity"
                    required
                />
                <input
                    type="text"
                    name="order_type"
                    value={orderDetails.order_type}
                    onChange={(e) => setOrderDetails({ ...orderDetails, order_type: e.target.value })}
                    placeholder="Order Type"
                    required
                />
                <input
                    type="number"
                    name="price"
                    value={orderDetails.price}
                    onChange={(e) => setOrderDetails({ ...orderDetails, price: Number(e.target.value) })}
                    placeholder="Price"
                    required
                />
                <button type="submit">Place Order</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default PlaceOrder;
