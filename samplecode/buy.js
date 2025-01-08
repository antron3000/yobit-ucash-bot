require('dotenv').config();  // Load .env file
const axios = require('axios');
const crypto = require('crypto');

// YoBit API credentials from .env
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

// Function to make YoBit API requests
async function yobitApiRequest(method, params = {}) {
    const nonce = Math.floor(Date.now() / 1000); // Generate a nonce based on current time
    params.method = method;
    params.nonce = nonce;

    // Prepare the post data
    const postData = new URLSearchParams(params).toString();

    // Create the HMAC SHA512 signature
    const sign = crypto.createHmac('sha512', API_SECRET)
        .update(postData)
        .digest('hex');

    // Make the request
    try {
        const response = await axios.post('https://yobit.net/tapi/', postData, {
            headers: {
                'Key': API_KEY,
                'Sign': sign
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error making API request:', error);
    }
}

// Function to place a trade
async function placeTrade(pair, type, rate, amount) {
    const tradeParams = {
        pair: pair,         // UCASH/USD trading pair
        type: type,         // "buy" or "sell"
        rate: rate,         // Price at which to buy UCASH in USD
        amount: amount      // Amount of USD to trade
    };

    const tradeResult = await yobitApiRequest('Trade', tradeParams);

    if (tradeResult && tradeResult.success === 1) {
        console.log("Trade Successful:", tradeResult.return);
    } else {
        console.log("Trade Error:", tradeResult.error);
    }
}

// Place a buy order for 1 USD on UCASH/USD at a given rate
const pair = 'ucash_usd';
const type = 'buy';
const rate = '0.001';  // Example rate, replace with the current rate you want to buy UCASH at
const amount = '2000';   // You want to spend 1 USD

placeTrade(pair, type, rate, amount);
