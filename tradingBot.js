require('dotenv').config();  // Load .env file
const axios = require('axios');
const crypto = require('crypto');

// YoBit API credentials from .env
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const PAIR = 'ucash_btc'; // Trading pair UCASH/BTC

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

// Function to get the current BTC balance
async function getBalance() {
    const balanceData = await yobitApiRequest('getInfo');
    if (balanceData && balanceData.success === 1) {
        const btcBalance = balanceData.return.funds.btc || 0;
        console.log("Current BTC Balance:", btcBalance);
        return btcBalance;
    } else {
        console.log("Error fetching balance:", balanceData.error);
        return 0;
    }
}

// Function to get the current market price from the order book
async function getMarketPrice() {
    try {
        const response = await axios.get(`https://yobit.net/api/3/depth/${PAIR}?limit=1`);
        const askPrice = response.data[PAIR].asks[0][0]; // Get the lowest ask price (market price)
        console.log("Current Market Price (ask):", askPrice);
        return askPrice;
    } catch (error) {
        console.error("Error fetching market price:", error);
        return null;
    }
}

// Function to place a market buy order for UCASH using BTC
async function placeBuyOrder(amount, rate) {
    const tradeParams = {
        pair: PAIR,        // UCASH/BTC trading pair
        type: 'buy',       // "buy" to purchase UCASH
        rate: rate,        // Market price
        amount: amount     // Amount of UCASH to buy (in BTC)
    };

    const tradeResult = await yobitApiRequest('Trade', tradeParams);

    if (tradeResult && tradeResult.success === 1) {
        console.log("Buy Order Successful:", tradeResult.return);
    } else {
        console.log("Buy Order Error:", tradeResult.error);
    }
}

// Function to periodically buy UCASH until no more BTC left
async function startTrading(periodInMinutes, btcAmountPerTrade) {
    const interval = periodInMinutes * 60 * 1000; // Convert minutes to milliseconds

    const tradeLoop = setInterval(async () => {
        const btcBalance = await getBalance();
        if (btcBalance <= 0) {
            console.log("No more BTC left to trade.");
            clearInterval(tradeLoop);  // Stop the bot if no BTC is left
            return;
        }

        const rate = await getMarketPrice();
        if (!rate) {
            console.log("Failed to fetch market price. Skipping this cycle.");
            return;
        }

        const amountToTrade = Math.min(btcAmountPerTrade, btcBalance); // Don't trade more than available balance

        await placeBuyOrder(amountToTrade, rate);  // Place a buy order

    }, interval);
}

// Start the bot to buy UCASH every X minutes, spending Y BTC per trade
const periodInMinutes = 5;  // Example: Trade every 5 minutes
const btcAmountPerTrade = 0.001;  // Example: Spend 0.001 BTC per trade

startTrading(periodInMinutes, btcAmountPerTrade);
