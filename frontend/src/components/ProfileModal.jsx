import React, { useState } from 'react';
import Modal from 'react-modal';

// Modal styling for the transition effect
const customStyles = {
    content: {
        top: '0',
        left: 'auto',
        right: '0',
        bottom: '0',
        width: '30%',
        height: 'auto',
        margin: 'auto',
        transition: 'transform 0.3s ease-in-out',
        zIndex: '1000',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
};

const ProfileModal = ({ isOpen, onRequestClose }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');

    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [twofa, setTwofa] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
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

    const handleLogout = () => {
        setIsLoggedIn(false);
        setToken('');
        setMessage({ text: 'Logged out successfully', type: 'success' });
        onRequestClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={customStyles}
            ariaHideApp={false}
        >
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Connect Your Zerodha Account</h2>
                <p className="text-gray-600 mb-4">Please enter your Zerodha account credentials below to connect.</p>
                {message.text && (
                    <div className={`p-4 mb-4 text-center rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}
                {!isLoggedIn ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="userId" className="block text-sm font-medium text-gray-700">Zerodha User ID</label>
                            <input
                                type="text"
                                id="userId"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Enter your Zerodha User ID"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Enter your password"
                            />
                        </div>
                        <div>
                            <label htmlFor="twofa" className="block text-sm font-medium text-gray-700">Two-Factor Authentication (OTP)</label>
                            <input
                                type="text"
                                id="twofa"
                                value={twofa}
                                onChange={(e) => setTwofa(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Enter your OTP"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Connect
                        </button>
                    </form>
                ) : (
                    <div>
                        <p className="text-gray-700">Welcome! You are connected to your Zerodha account.</p>
                        <button
                            onClick={handleLogout}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Disconnect
                        </button>
                    </div>
                )}
            </div>
                <button
                    onClick={onRequestClose}
                    className="mt-4 block w-1/4 mx-auto py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition-colors"
                >
                    Close
                </button>
        </Modal>
    );
};

export default ProfileModal;
