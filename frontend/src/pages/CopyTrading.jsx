import React, { useEffect, useState } from 'react';
import { Link } from 'react-scroll';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt, faKey, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

import logo from '../assets/AlgoLogo.png';
import OrderForm from '../components/OrderForm'; 

const CopyTradingPage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState('');

    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [twofa, setTwofa] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');
        if (storedToken) {
            setIsLoggedIn(true);
            setToken(storedToken);
            setUserId(storedUserId || '');
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://trading-site.onrender.com/api/login', {
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
                localStorage.setItem('token', data.enctoken);
                localStorage.setItem('userId', userId);
            } else {
                setMessage({ text: data.message || 'Login failed', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: `Error: ${error.message}`, type: 'error' });
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setToken('');
        setUserId('');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/');
    };

    const handlePlaceOrder = async (orderData) => {
        try {
            const response = await fetch('https://trading-site.onrender.com/api/place-order', {
                method: 'POST',
                headers: {
                    'X-Kite-Version': '3',
                    'Content-Type': 'application/json',
                    'Authorization': `enctoken ${token}`,
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <svg className='rotate-180' width="100%" height="120" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path d="M0,60 Q20,0 50,30 Q80,60 100,30 Q120,0 150,30 Q180,60 200,30 L200,100 L0,100 Z" fill="#ff6a88" />
            </svg>

            <nav className='flex justify-between p-4 mt-1 fixed top-0 left-0 right-0 z-50'>
                <div className="flex items-center">
                    <img src={logo} alt="Logo" className="h-10 w-10 mr-2" />
                    <span className="text-2xl font-bold">THE ALGOMATIC</span>
                </div>

                <div className="flex space-x-6 text-xl cursor-pointer mr-0 mt-2">
                    <Link to="Dashboard" smooth={true} duration={500} offset={-90} className="text-black hover:text-blue-800 transition-colors font-semibold">Dashboard</Link>
                    <Link to="Create" smooth={true} duration={500} offset={-90} className="text-black hover:text-blue-800 transition-colors font-semibold">Create</Link>
                    <Link to="Strategies" smooth={true} duration={500} offset={-90} className="text-black hover:text-blue-800 transition-colors font-semibold">Strategies</Link>
                    <Link to="Services" smooth={true} duration={500} offset={-90} className="text-black hover:text-blue-800 transition-colors font-semibold">Services</Link>
                    <Link to="Reports" smooth={true} duration={500} offset={-90} className="text-black hover:text-blue-800 transition-colors font-semibold">Reports</Link>
                </div>

                <div className="flex items-center">
                    {isLoggedIn && (
                        <button 
                            onClick={handleLogout}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                            Logout
                        </button>
                    )}
                </div>
            </nav>

            <div className="container mx-auto mt-24 px-4">
                {!isLoggedIn ? (
                    <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden flex">
                        <div className="w-1/2 bg-blue-700 text-white p-12 flex flex-col justify-center">
                            <h3 className="text-4xl font-bold mb-6">Welcome Back</h3>
                            <p className="text-blue-100 text-lg mb-8">Connect your Zerodha account to unlock powerful trading tools and strategies</p>
                            <div className="space-y-4">
                                <div className="flex items-center text-lg">
                                    <FontAwesomeIcon icon={faUser} className="mr-4 text-2xl text-blue-200" />
                                    <span>Secure User Authentication</span>
                                </div>
                                <div className="flex items-center text-lg">
                                    <FontAwesomeIcon icon={faKey} className="mr-4 text-2xl text-blue-200" />
                                    <span>Two-Factor Protection</span>
                                </div>
                                <div className="flex items-center text-lg">
                                    <FontAwesomeIcon icon={faShieldAlt} className="mr-4 text-2xl text-blue-200" />
                                    <span>Bank-Grade Security Measures</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-1/2 p-12">
                            <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">Connect Account</h2>
                            <form onSubmit={handleLogin} className="space-y-6">
                                {message.text && (
                                    <div className={`p-4 text-center rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {message.text}
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="userId" className="block text-md font-medium text-gray-700 mb-2">Zerodha User ID</label>
                                    <input
                                        type="text"
                                        id="userId"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-md"
                                        placeholder="Enter your Zerodha User ID"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-md font-medium text-gray-700 mb-2">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-md"
                                        placeholder="Enter your password"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="twofa" className="block text-md font-medium text-gray-700 mb-2">Two-Factor Authentication (OTP)</label>
                                    <input
                                        type="text"
                                        id="twofa"
                                        value={twofa}
                                        onChange={(e) => setTwofa(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-md"
                                        placeholder="Enter your OTP"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                                >
                                    Connect Account
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <OrderForm token={token} onPlaceOrder={handlePlaceOrder} />
                )}
            </div>
        </div>
    );
};

export default CopyTradingPage;