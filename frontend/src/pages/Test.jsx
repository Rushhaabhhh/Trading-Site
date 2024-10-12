import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import OrderForm from '../components/OrderForm';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleLogin = async (credentials) => {
    try {
      // Encode Base64 credentials
      const base64Credentials = btoa(`${credentials.userId}:${credentials.password}`);
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${base64Credentials}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (response.ok) { // Successful login
        setIsLoggedIn(true);
        setToken(data.token); // Store token for further requests
        setMessage({ text: 'Logged in successfully', type: 'success' });
      } else { // Handle login error
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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include the token in Bearer format
        },
        body: JSON.stringify(orderData),
      });
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Kite Connect Test</h1>
      {message.text && (
        <div className={`p-4 mb-4 rounded ${
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
  );
}

export default App;
