const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

// Middleware to parse JSON requests
router.use(bodyParser.json());

// Initialize the KiteApp instance
let kiteInstance = null;

// Route to login and create a KiteApp instance
router.post('/login', async (req, res) => {
    const { userid, password, twofa } = req.body;

    try {
        // Assuming you have a login_with_credentials function to handle the login
        const enctoken = await login_with_credentials(userid, password, twofa);
        kiteInstance = new KiteApp('YourAPIKey', userid, enctoken); // Replace with your actual API key
        res.status(200).json({ message: 'Login successful', enctoken });
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ message: 'Login failed', error: error.message });
    }
});

// Route to place an order
router.post('/orders', async (req, res) => {
    if (!kiteInstance) {
        return res.status(401).json({ message: 'Unauthorized: Please login first.' });
    }

    const { variety, exchange, tradingsymbol, transaction_type, quantity, product, order_type, price, validity } = req.body;

    try {
        const orderId = await kiteInstance.place_order(
            variety, exchange, tradingsymbol, transaction_type, quantity, product, order_type, price, validity
        );
        res.status(200).json({ message: 'Order placed successfully', orderId });
    } catch (error) {
        console.error('Order placement error:', error);
        res.status(400).json({ message: 'Order placement failed', error: error.message });
    }
});

// Route to fetch user details (optional)
router.get('/user', (req, res) => {
    if (!kiteInstance) {
        return res.status(401).json({ message: 'Unauthorized: Please login first.' });
    }
    // Fetch user data logic here
    // For example: const userData = await kiteInstance.get_profile(); // Make sure this function is defined in KiteApp
    res.status(200).json({ message: 'User data fetched successfully', userData: {} });
});

// Export the router
module.exports = router;
