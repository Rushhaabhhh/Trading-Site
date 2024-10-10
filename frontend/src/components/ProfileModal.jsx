import React, { useState } from 'react';
import axios from 'axios';

const DematLogin = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [twoFa, setTwoFa] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8080/demat/login', {
                userId,
                password,
                twoFa,
            });

            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-6">Demat Account Login</h2>
            <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">User ID</label>
                    <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="border rounded-md p-2 w-full"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border rounded-md p-2 w-full"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Two-Factor Authentication Code</label>
                    <input
                        type="text"
                        value={twoFa}
                        onChange={(e) => setTwoFa(e.target.value)}
                        className="border rounded-md p-2 w-full"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Login
                </button>
            </form>
            {message && <p className="mt-4 text-center text-red-600">{message}</p>}
        </div>
    );
};

export default DematLogin;
