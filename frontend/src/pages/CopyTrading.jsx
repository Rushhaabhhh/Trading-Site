import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const CopyTradingPage = () => {
    const [masterTrades, setMasterTrades] = useState([]);
    const [userTrades, setUserTrades] = useState([]);
    const [error, setError] = useState('');
    const [selectedTrade, setSelectedTrade] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Fetch trades from the backend on component mount
    useEffect(() => {
        const fetchTrades = async () => {
            try {
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
    const copyTrade = async () => {
        if (!selectedTrade) return;
        try {
            await axios.post(`http://127.0.0.1:8000/copytrades/copy/`, {
                trade_id: selectedTrade.id
            }, {
                headers: {
                    'X-CSRFToken': Cookies.get('csrftoken')
                }
            });
            alert('Trade copied successfully!');
            const userResponse = await axios.get(`http://127.0.0.1:8000/trades/${selectedTrade.id}/`);
            setUserTrades(prev => [...prev, userResponse.data]);
            setModalOpen(false); // Close modal after copying
            setSelectedTrade(null); // Reset selected trade
        } catch (err) {
            alert('Error copying trade');
            console.error(err);
        }
    };

    return (
        <div>
            <nav>

            </nav>
            


        </div>
    );
};

export default CopyTradingPage;
