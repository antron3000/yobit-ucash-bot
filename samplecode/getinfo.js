require('dotenv').config(); // Load .env variables
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

// Function to get account balance
async function getBalance() {
    const balanceInfo = await yobitApiRequest('getInfo');
    
    if (balanceInfo && balanceInfo.success === 1) {
        console.log("Balance Info:", balanceInfo.return.funds);
    } else {
        console.log("Error:", balanceInfo.error);
    }
}

// Call the getBalance function
getBalance();
