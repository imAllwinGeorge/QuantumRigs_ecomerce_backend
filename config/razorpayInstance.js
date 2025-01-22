const Razorpay = require("razorpay");
require('dotenv').config()

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, // Use environment variables for security
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpayInstance;