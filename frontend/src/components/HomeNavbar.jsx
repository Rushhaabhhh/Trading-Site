import axios from 'axios';
import { Link } from 'react-scroll';
import { User } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import logo from '../assets/AlgoLogo.png';

const HomeNavbar = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate(); 

    const toggleDropdown = (type) => {
        setOpenDropdown((prev) => (prev === type ? null : type));
    };

    const openModal = (type) => {
        setIsSignUp(type === 'signup');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetFields();
    };

    const resetFields = () => {
        setUsername('');
        setPassword('');
        setError('');
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isSignUp ? 'https://trading-site.onrender.com/auth/signup' : 'https://trading-site.onrender.com/auth/login';
        navigate('/copy-trading');

        try {
            const response = await axios.post(endpoint, { username, password });

            if (response.data.user) {
                closeModal();
                navigate('/copy-trading');
            }
        } catch (err) {
            console.error('Error details:', err);
            setError('Login failed. Please check your credentials.');
        }
    };
    

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div>
            <nav className='flex justify-between p-4 mt-1 fixed top-0 left-0 right-0 z-35'>
                <div className="flex items-center">
                    <img src={logo} alt="Logo" className="h-12 w-12 mr-2" />
                    <span className="text-4xl font-bold">TRADING SITE</span>
                </div>

                <div className="flex space-x-6 text-xl cursor-pointer mr-0 mt-2">
                    <div className="relative">
                        <button onClick={() => toggleDropdown('features')} className="text-black hover:text-blue-800 transition-colors font-semibold">
                            Features
                        </button>
                        <svg className={`inline-block ml-1 w-4 h-4 transform transition-transform ${openDropdown === 'features' ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {openDropdown === 'features' && (
                            <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md">
                                <Link to="Feature1" smooth={true} duration={500} offset={-90} className="block px-4 py-2 hover:bg-gray-100">Feature 1</Link>
                                <Link to="Feature2" smooth={true} duration={500} offset={-90} className="block px-4 py-2 hover:bg-gray-100">Feature 2</Link>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button onClick={() => toggleDropdown('useCases')} className="text-black hover:text-blue-800 transition-colors font-semibold">
                            Use Cases
                        </button>
                        <svg className={`inline-block ml-1 w-4 h-4 transform transition-transform ${openDropdown === 'useCases' ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {openDropdown === 'useCases' && (
                            <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md">
                                <Link to="UseCase1" smooth={true} duration={500} offset={-90} className="block px-4 py-2 hover:bg-gray-100">Use Case 1</Link>
                                <Link to="UseCase2" smooth={true} duration={500} offset={-90} className="block px-4 py-2 hover:bg-gray-100">Use Case 2</Link>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button onClick={() => toggleDropdown('services')} className="text-black hover:text-blue-800 transition-colors font-semibold">
                            Services
                        </button>
                        <svg className={`inline-block ml-1 w-4 h-4 transform transition-transform ${openDropdown === 'services' ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {openDropdown === 'services' && (
                            <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md">
                                <Link to="Service1" smooth={true} duration={500} offset={-90} className="block px-4 py-2 hover:bg-gray-100">Service 1</Link>
                                <Link to="Service2" smooth={true} duration={500} offset={-90} className="block px-4 py-2 hover:bg-gray-100">Service 2</Link>
                            </div>
                        )}
                    </div>

                    <Link to="Pricing" smooth={true} duration={500} offset={-90} className="text-black hover:text-blue-800 transition-colors font-semibold">Pricing</Link>
                    <Link to="Contact" smooth={true} duration={500} offset={-90} className="text-black hover:text-blue-800 transition-colors font-semibold">Contact</Link>
                </div>

                <div className="flex space-x-2">
                    <button onClick={() => openModal('signup')} className="relative flex items-center px-4 py-2 rounded-3xl text-lg hover:text-blue-800 transition-colors duration-300 font-bold after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-blue-800 after:transition-all after:duration-300 hover:after:w-full">
                        Sign Up
                    </button>
                    <button onClick={() => openModal('signin')} className="flex items-center px-4 py-2 rounded-3xl text-lg hover:text-blue-800 hover:bg-opacity-0 hover:border-blue-800 hover:border-2 transition-colors duration-300 bg-blue-500 text-white font-bold">
                        <User className="mr-2 h-6 w-6" /> Sign In
                    </button>
                </div>
            </nav>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="relative bg-white p-8 rounded-lg shadow-lg w-96">
                    <button onClick={closeModal} className="absolute top-4 right-4  text-red-600 hover:text-red-900">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                        <h2 className="text-2xl font-bold mb-4">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
                        <form onSubmit={handleSubmit}>
                            {error && <p className="text-red-500">{error}</p>}
                            <div className="relative mb-4">
                                <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-3 text-white" />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="w-full p-2 pl-10 rounded-xl bg-gray-600 text-black placeholder:text-gray-300"
                                />
                                </div>
                                <div className="relative mb-4">
                                    <FontAwesomeIcon icon={faLock} className="absolute left-3 top-3 text-white" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full p-2 pl-10 rounded-xl bg-gray-600 text-black placeholder:text-gray-300"
                                    />
                                    <FontAwesomeIcon
                                        icon={showPassword ? faEyeSlash : faEye}
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-3 cursor-pointer text-white"
                                    />
                                </div>

                            <button type="submit" className="w-full bg-[#fc6c84] text-white py-2 rounded-lg hover:bg-blue-700">
                                {isSignUp ? 'Sign Up' : 'Sign In'}
                            </button>
                        </form>
                        <p className="mt-4">
                            {isSignUp ? (
                                <span>
                                    Already have an account?{' '}
                                    <button onClick={() => openModal('signin')} className="text-blue-800 hover:underline">
                                        Sign In
                                    </button>
                                </span>
                            ) : (
                                <span>
                                    Don't have an account?{' '}
                                    <button onClick={() => openModal('signup')} className="text-blue-800 hover:underline">
                                        Sign Up
                                    </button>
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeNavbar;