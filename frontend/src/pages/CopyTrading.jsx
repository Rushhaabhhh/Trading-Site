import React, { useEffect, useState } from 'react';
import { Link } from 'react-scroll';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faCopy, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';

import logo from '../assets/AlgoLogo.png';
import ProfileModal from '../components/ProfileModal';

const CopyTradingPage = () => {
    const [masterTrades, setMasterTrades] = useState([
        { id: 1, name: 'Strategy A' },
        { id: 2, name: 'Strategy B' },
        { id: 3, name: 'Strategy C' },
    ]);
    const [userTrades, setUserTrades] = useState([]);
    const [selectedTrade, setSelectedTrade] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState('');

    const navigate = useNavigate();

    // Fix the react-modal error by using a valid selector
    useEffect(() => {
        Modal.setAppElement(document.body); // Set app element to body or #root
    }, []);

    // Copy an existing trade
    const copyTrade = () => {
        if (!selectedTrade) return;

        const existingTrade = userTrades.find((trade) => trade.id === selectedTrade.id);
        const newTrade = {
            ...selectedTrade,
            strategy: 'New Strategy'
        };

        if (existingTrade) {
            const updatedTrades = userTrades.filter((trade) => trade.id !== selectedTrade.id);
            setUserTrades([...updatedTrades, newTrade]);
        } else {
            setUserTrades([...userTrades, selectedTrade]);
        }
        setModalOpen(false);
        setSelectedTrade(null);
    };

    const handleLogin = (enctoken) => {
        setIsLoggedIn(true);
        setToken(enctoken);
        localStorage.setItem('token', enctoken);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setToken('');
        localStorage.removeItem('token');
        navigate('/');
    };

    const toggleProfileModal = () => {
        setProfileModalOpen(!isProfileModalOpen);
    };

    const TradeCard = ({ trade, isMasterTrade = false }) => (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition duration-300">
            <div className="flex justify-between items-center">
                <h4 className="text-2xl font-semibold text-gray-800">{trade.name}</h4>
                <FontAwesomeIcon 
                    icon={isMasterTrade ? faChartLine : faCopy} 
                    className={isMasterTrade ? "text-[#e16477]" : "text-[#fa957e]"} 
                />
            </div>
            {isMasterTrade && (
                <button 
                    className="mt-4 w-1/2 ml-40 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-full hover:from-gray-600 hover:to-gray-800 hover:scale-105 transition duration-300 ease-in-out"
                    onClick={() => {
                        setSelectedTrade(trade);
                        setModalOpen(true);
                    }}
                >
                    View Details
                </button>
            )}
        </div>
    );

    return (
        <div>
            <svg className='rotate-180' width="100%" height="120" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path d="M0,60 Q20,0 50,30 Q80,60 100,30 Q120,0 150,30 Q180,60 200,30 L200,100 L0,100 Z" fill="#ff6a88" />
            </svg>

            <nav className='flex justify-between p-4 mt-1 fixed top-0 left-0 right-0 z-35'>
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

                <button 
                    onClick={toggleProfileModal} 
                    className="flex items-center px-4 py-2 rounded-3xl text-lg hover:text-gray-800 hover:bg-opacity-30 hover:border-gray-800 hover:border-2 transition-colors duration-300 bg-black bg-opacity-0 border-2 border-black text-black font-bold"
                >
                    <FontAwesomeIcon icon={faArrowRightFromBracket} className='mr-2' /> 
                    {isLoggedIn ? 'Profile' : 'Connect'}
                </button>
            </nav>

            <ProfileModal 
                isOpen={isProfileModalOpen} 
                onRequestClose={toggleProfileModal} 
                onLogin={handleLogin}
                onLogout={handleLogout}
            />

            <div className="container mx-auto px-4 pt-2 pb-12">
                <header className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-800 mb-4">Copy Trading</h1>
                    <h2 className="text-3xl text-gray-600 italic">Select and replicate winning strategies!</h2>
                </header>
                <div className="flex flex-wrap -mx-4">
                    {/* Master Trades */}
                    <div className="w-full md:w-1/2 px-4 mb-8">
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-800 via-gray-600 to-gray-700 p-4">
                                <h3 className="text-3xl font-semibold text-white text-center">Pre Build Strategies</h3>
                            </div>
                            <div className="p-4">
                                {masterTrades.map((trade) => (
                                    <TradeCard key={trade.id} trade={trade} isMasterTrade={true} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* User Trades */}
                    <div className="w-full md:w-1/2 px-4 mb-8">
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-800 via-gray-600 to-gray-700 p-4">
                                <h3 className="text-3xl font-semibold text-white text-center">My Strategy</h3>
                            </div>
                            <div className="p-4">
                                {userTrades.map((trade) => (
                                    <TradeCard key={trade.id} trade={trade} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CopyTradingPage;
