import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import OrderForm from '../components/OrderForm';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (credentials) => {
    try {
      const { userId, password, twofa } = credentials; 

      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, password, twofa }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsLoggedIn(true);
        setToken(data.enctoken);
        setMessage({ text: 'Logged in successfully', type: 'success' });
      } else {
        setMessage({ text: data.message || 'Login failed', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
    }
  };

  const handlePlaceOrder = async (orderData) => {
    try {
      const response = await fetch('http://localhost:5000/api/place-order', {
        method: 'POST',
        headers: {
          'X-Kite-Version': '3',
          'Content-Type': 'application/json',
          'Authorization': `enctoken ${token}`, 
        },
        body: JSON.stringify(orderData),
      });

      console.log("token, ", token);

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: 'Order placed successfully', type: 'success' });
      } else {
        setMessage({ text: data.message || 'Failed to place order', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Kite Connect</h1>
        {message.text && (
          <div className={`p-4 mb-4 text-center rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
        {!isLoggedIn ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <OrderForm onPlaceOrder={handlePlaceOrder} />
        )}
      </div>
    </div>
  );
}

export default App;
