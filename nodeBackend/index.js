const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const UserController = require('./Controllers/UserController');
const OrderController = require('./Controllers/OrderController');
const AuthController = require('./Controllers/AuthController');

const app = express();
const PORT = 5000; 

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB database connection established successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB database connection error:', err);
  });

app.use('/api', UserController);
app.use('/api', OrderController);
app.use('/auth', AuthController);

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
