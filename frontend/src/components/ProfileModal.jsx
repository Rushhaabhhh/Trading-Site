import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';

// Modal styling for the transition effect
const customStyles = {
    content: {
        top: '0',
        left: 'auto',
        right: '0',
        bottom: '0',
        width: '23%',
        height: '100%',
        transition: 'transform 0.3s ease-in-out',
        transform: 'translateX(100%)',
        zIndex: '1000',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
};

const ProfileModal = ({ isOpen, onRequestClose, logout }) => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        accountType: '',
        accountNumber: '',
        balance: '',
        stocks: '',
        strategy: '',
    });

    useEffect(() => {
        // Load user data from local storage on component mount
        const storedData = JSON.parse(localStorage.getItem('userData'));
        if (storedData) {
            setUserData(storedData);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        localStorage.setItem('userData', JSON.stringify({ ...userData, [name]: value }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={customStyles}
            ariaHideApp={false}
            onAfterOpen={() => {
                document.querySelector('.ReactModal__Content').style.transform = 'translateX(0)'; // Slide in
            }}
            onRequestClose={() => {
                document.querySelector('.ReactModal__Content').style.transform = 'translateX(100%)'; // Slide out
                setTimeout(onRequestClose, 300); // Delay closing the modal
            }}
        >
            <div className="bg-white p-6 rounded-lg shadow-lg h-full">
                <h2 className="text-xl font-bold mb-4">User Profile</h2>
                <div className="mb-4">
                    <label className="block text-sm font-semibold">Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleChange}
                        className="border rounded-md p-2 w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-semibold">Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                        className="border rounded-md p-2 w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-semibold">Account Type:</label>
                    <input
                        type="text"
                        name="accountType"
                        value={userData.accountType}
                        onChange={handleChange}
                        className="border rounded-md p-2 w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-semibold">Account Number:</label>
                    <p className="text-gray-700">{userData.accountNumber}</p>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-semibold">Balance:</label>
                    <p className="text-gray-700">{userData.balance}</p>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-semibold">Stocks:</label>
                    <input
                        type="text"
                        name="stocks"
                        value={userData.stocks}
                        onChange={handleChange}
                        className="border rounded-md p-2 w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-semibold">Strategy:</label>
                    <input
                        type="text"
                        name="strategy"
                        value={userData.strategy}
                        onChange={handleChange}
                        className="border rounded-md p-2 w-full"
                    />
                </div>
                <button
                    onClick={logout}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                    Logout
                </button>
                <button
                    onClick={onRequestClose}
                    className="mt-2 px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition-colors"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};

export default ProfileModal;
