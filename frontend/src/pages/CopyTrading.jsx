import axios from 'axios';
import Modal from 'react-modal';
import { Link } from 'react-scroll';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faCopy } from "@fortawesome/free-solid-svg-icons";
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';

import Chart from '../components/Chart';
import logo from '../assets/AlgoLogo.png';
import ProfileModal from '../components/ProfileModal';

const CopyTradingPage = () => {
    const [masterTrades, setMasterTrades] = useState([]);
    const [userTrades, setUserTrades] = useState([]);
    const [error, setError] = useState('');
    const [selectedTrade, setSelectedTrade] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);

    const toggleProfileModal = () => {
        setProfileModalOpen(!isProfileModalOpen);
    }


    const navigate = useNavigate();

    useEffect(() => {
        Modal.setAppElement('#ProfileModal'); // Ensure this is the correct ID for your app element
    }, []);

    // Fetch trades from the backend on component mount
    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const masterResponse = await axios.get('http://127.0.0.1:8000/trades/');
                setMasterTrades(masterResponse.data);
                
                // Fetch user trades from local storage
                const storedUserTrades = JSON.parse(localStorage.getItem('userTrades') || '[]');
                setUserTrades(storedUserTrades);
            } catch (err) {
                setError(err.message);
                console.error(err);
            }
        };
        fetchTrades();
    }, []);

    // Copy an existing trade
    const copyTrade = async () => {
        if (!selectedTrade) return;
        try {
            // Check if the selected trade already exists in userTrades
            const existingTrade = userTrades.find((trade) => trade.id === selectedTrade.id);

            if (existingTrade) {
                const updatedTrades = userTrades.filter((trade) => trade.id !== selectedTrade.id);
                const newTrade = {
                    ...selectedTrade,
                    strategy: 'New Strategy'
                };
                setUserTrades([...updatedTrades, newTrade]);
                localStorage.setItem('userTrades', JSON.stringify([...updatedTrades, newTrade]));
            } else {
                await axios.post(`http://127.0.0.1:8000/copytrades/copy/`, {
                    trade_id: selectedTrade.id
                });
                const newUserTrades = [...userTrades, selectedTrade];
                setUserTrades(newUserTrades);
                localStorage.setItem('userTrades', JSON.stringify(newUserTrades));
            }
            setModalOpen(false);
            setSelectedTrade(null);
        } catch (err) {
            console.error(err);
            alert('Error copying trade');
        }
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
                    className="mt-4 w-1/2 ml-40 px-4 py-2 bg-gradient-to-r from-gray-700  to-gray-600 text-white rounded-full hover:from-gray-600 hover:to-gray-800  hover:scale-105 transition duration-300 ease-in-out"
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

    const toggleDropdown = (type) => {
        setOpenDropdown((prev) => (prev === type ? null : type));
    };

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div>
            <svg className='rotate-180' width="100%" height="120" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path d="M0,60 Q20,0 50,30 Q80,60 100,30 Q120,0 150,30 Q180,60 200,30 L200,100 L0,100 Z" fill="#ff6a88"/>
            </svg>

            <nav className='flex justify-between p-4 mt-1 fixed top-0 left-0 right-0 z-35 '>
                <div className="flex items-center">
                    <img src={logo} alt="Logo" className="h-10 w-10 mr-2" />
                    <span className="text-2xl font-bold">THE ALGOMATIC</span>
                </div>

                <div className="flex space-x-6 text-xl cursor-pointer mr-0 mt-2">
                    <div className="relative">
                        <button className="text-black hover:text-blue-800 transition-colors font-semibold">
                            Dashboard
                        </button>
                        
                    </div>

                    <div className="relative">
                        <button onClick={() => toggleDropdown('Create')} className="text-black hover:text-blue-800 transition-colors font-semibold">
                            Create
                        </button>
                        <svg className={`inline-block ml-1 w-4 h-4 transform transition-transform ${openDropdown === 'Create' ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {openDropdown === 'Create' && (
                            <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md">
                                <Link to="UseCase1" smooth={true} duration={500} offset={-90} className="block px-4 py-2 hover:bg-gray-100 text-sm font-semibold">Advanced</Link>
                                <Link to="UseCase2" smooth={true} duration={500} offset={-90} className="block px-4 py-2 hover:bg-gray-100 text-sm font-semibold">Use Stock Bag</Link>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button onClick={() => toggleDropdown('strategies')} className="text-black hover:text-blue-800 transition-colors font-semibold">
                            Strategies
                        </button>
                        <svg className={`inline-block ml-1 w-4 h-4 transform transition-transform ${openDropdown === 'strategies' ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {openDropdown === 'strategies' && (
                            <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md">
                                <Link to="Strategy1" smooth={true} duration={500} offset={-90} className="block px-4 py-2 hover:bg-gray-100 text-sm font-semibold">Marketplace</Link>
                                <Link to="Strategy2" smooth={true} duration={500} offset={-90} className="block px-4 py-2 hover:bg-gray-100 text-sm font-semibold">Top Creators</Link>
                                <Link to="Strategy3" smooth={true} duration={500} offset={-90} className="block px-4 py-2 hover:bg-gray-100 text-sm font-semibold">Top My Strategies</Link>
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
                                <Link to="Service1" smooth={true} duration={500} offset={-90} className="block px-4 py-2 hover:bg-gray-100 text-sm font-semibold">TT UNI</Link>
                                <Link to="Service2" smooth={true} duration={500} offset={-90} className="block px-4 py-2 hover:bg-gray-100 text-sm font-semibold">TT QUANTS</Link>
                                <Link to="Service2" smooth={true} duration={500} offset={-90} className="block px-4 py-2 hover:bg-gray-100 text-sm font-semibold">TT ASSISTANT</Link>
                                <Link to="Service2" smooth={true} duration={500} offset={-90} className="block px-4 py-2 hover:bg-gray-100 text-sm font-semibold">TT WHITELABEL</Link>
                            </div>
                        )}
                    </div>

                    <Link to="Pricing" smooth={true} duration={500} offset={-90} className="text-black hover:text-blue-800 transition-colors font-semibold">Reports</Link>
                </div>

                <button 
                    onClick={toggleProfileModal} 
                    className="flex items-center px-4 py-2 rounded-3xl text-lg hover:text-gray-800 hover:bg-opacity-30 hover:border-gray-800 hover:border-2 transition-colors duration-300 bg-black bg-opacity-0 border-2 border-black text-black font-bold"
                >
                    <FontAwesomeIcon icon={faArrowRightFromBracket} className='mr-2' /> Profile
                </button>
                
            </nav>
            <div id="ProfileModal">
            {/* Profile Modal */}
            <ProfileModal 
                isOpen={isProfileModalOpen} 
                onRequestClose={toggleProfileModal} 
                logout={logout} 
            />
            </div>

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
                            <div className="grid grid-cols-2 gap-4 mb-6 mt-4 p-6">
                            {selectedTrade &&  Object.entries(selectedTrade).map(([key, value]) => (
                                key !== 'id' && key !== 'name' && (
                                    <div key={key}>
                                        <p className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</p>
                                        <p className="text-xl font-semibold text-gray-800">{value}</p>
                                    </div>
                                )
                            ))}
                            </div>
                        </div>
                    {/* <Chart /> */}
                    </div>

                </div>
            </div>


            {/* Modal for Selected Trade */}
            <Modal 
                isOpen={modalOpen} 
                onRequestClose={() => setModalOpen(false)} 
                className="modal fixed inset-0 flex items-center justify-center"
                overlayClassName="overlay fixed inset-0 bg-black bg-opacity-50"
            >
                {selectedTrade && (
                    <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full max-h-90vh overflow-y-auto">
                        <h2 className="text-3xl font-bold mb-4 text-gray-800">{selectedTrade.name}</h2>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {selectedTrade &&  Object.entries(selectedTrade).map(([key, value]) => (
                                key !== 'id' && key !== 'name' && (
                                    <div key={key}>
                                        <p className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</p>
                                        <p className="text-xl font-semibold text-gray-800">{value}</p>
                                    </div>
                                )
                            ))}
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button 
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition duration-150 ease-in-out"
                                onClick={() => setModalOpen(false)}
                            >
                                Close
                            </button>
                            <button 
                                className="px-6 py-2 bg-gradient-to-r from-[#e16477] to-[#fa957e] text-white rounded-full hover:from-[#d15467] hover:to-[#e9846e] transition duration-150 ease-in-out"
                                onClick={copyTrade}
                            >
                                Copy Strategy
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CopyTradingPage;