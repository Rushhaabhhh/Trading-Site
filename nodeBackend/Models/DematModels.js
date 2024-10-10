const mongoose = require('mongoose');

const dematSchema = new mongoose.Schema({
    userId : {
        type: String,
        required: true,
        unique: true,
    },
    password : {
        type: String,
        required: true,
    },
    twoFA : {
        type: String,
        required: true,
    },
    enctoken : {
        type: String,
        required: true,
    },
});