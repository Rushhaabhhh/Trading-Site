import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const CopyTradingPage = () => {
    const [masterTrades, setMasterTrades] = useState([]);
    const [userTrades, setUserTrades] = useState([]);
    const [error, setError] = useState('');

    // Fetch trades from the backend on component mount
    useEffect(() => {
        const fetchTrades = async () => {
            try {
                // Fetch master trader trades
                const masterResponse = await axios.get('http://127.0.0.1:8000/trades/');
                setMasterTrades(masterResponse.data);
            } catch (err) {
                setError(err.message);
                console.error(err);
            }
        };
        fetchTrades();
    }, []);

    // Copy an existing trade using the trade ID
    const copyTrade = async (tradeId) => {
        try {
            const response = await axios.post(`http://127.0.0.1:8000/copytrades/copy/`, {
                trade_id: tradeId
            }, {
                headers: {
                    'X-CSRFToken': Cookies.get('csrftoken')
                }
            });
            alert('Trade copied successfully!');
            // Optionally, refresh user trades after copying
            const userResponse = await axios.get(`http://127.0.0.1:8000/trades/${tradeId}/`);
            setUserTrades(userResponse.data);
        } catch (err) {
            alert('Error copying trade');
            console.error(err);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">Copy Trading Page</h1>
            {error && <p className="text-red-500">{error}</p>}

            {/* Trades Section with two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Master Trader Trades Column */}
                <div>
                    <h2 className="text-xl font-bold mt-8">Master Trader Trades</h2>
                    <div className="grid grid-cols-1 gap-6">
                        {masterTrades.length > 0 ? (
                            masterTrades.map((trade) => (
                                <div key={trade.id} className="border rounded-md p-4 shadow-lg bg-white">
                                    <p><strong>Symbol:</strong> {trade.symbol}</p>
                                    <p><strong>Buy/Sell:</strong> {trade.buy_sell}</p>
                                    <p><strong>Price:</strong> {trade.entry_price}</p>
                                    <p><strong>Quantity:</strong> {trade.quantity}</p>
                                    <p><strong>Stop Loss:</strong> {trade.stop_loss}</p>
                                    <p><strong>Target Price:</strong> {trade.target_price}</p>
                                    <p><strong>Expiry:</strong> {new Date(trade.expiry).toLocaleDateString()}</p>
                                    <p><strong>Capital:</strong> {trade.capital}</p>
                                    <p><strong>Segment:</strong> {trade.segment}</p>
                                    <p><strong>Timestamp:</strong> {new Date(trade.timestamp).toLocaleString()}</p>
                                    <button
                                        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={() => copyTrade(trade.id)}
                                    >
                                        Copy Trade
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>No master trades available to copy</p>
                        )}
                    </div>
                </div>

                {/* User Trades Column */}
                <div>
                    <h2 className="text-xl font-bold mt-8">Your Trades</h2>
                    <div className="grid grid-cols-1 gap-6">
                        {userTrades.length > 0 ? (
                            userTrades.map((trade) => (
                                <div key={trade.id} className="border rounded-md p-4 shadow-lg bg-white">
                                    <h3 className="text-lg font-bold mb-2">{trade.user.username}'s Trade</h3>
                                    <p><strong>Symbol:</strong> {trade.symbol}</p>
                                    <p><strong>Buy/Sell:</strong> {trade.buy_sell}</p>
                                    <p><strong>Price:</strong> {trade.entry_price}</p>
                                    <p><strong>Quantity:</strong> {trade.quantity}</p>
                                    <p><strong>Stop Loss:</strong> {trade.stop_loss}</p>
                                    <p><strong>Target Price:</strong> {trade.target_price}</p>
                                    <p><strong>Expiry:</strong> {new Date(trade.expiry).toLocaleDateString()}</p>
                                    <p><strong>Capital:</strong> {trade.capital}</p>
                                    <p><strong>Segment:</strong> {trade.segment}</p>
                                    <p><strong>Timestamp:</strong> {new Date(trade.timestamp).toLocaleString()}</p>
                                </div>
                            ))
                        ) : (
                            <p>No trades available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CopyTradingPage;
