import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/HomePage';
import CopyTrading from './pages/CopyTrading';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/copy-trading" element={<CopyTrading />} />
\            </Routes>
        </Router>
    );
};

export default App;
