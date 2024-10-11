const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const BASE_URL = "https://yobit.net/tapi/";

async function sendRequest(method, params) {
  const nonce = Date.now(); // Create a new nonce for each request
  params.nonce = nonce;

  const signature = createSignature({ method, ...params });

  // Debugging information
  console.log("Nonce:", nonce);
  console.log("Request Method:", method);
  console.log("Request Params:", params);
  console.log("Signature:", signature);

  try {
    const response = await axios.post(BASE_URL, null, {
      headers: {
        Key: API_KEY,
        Sign: signature,
      },
      params: {
        method: method,
        ...params,
      },
    });

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error("API Error: " + JSON.stringify(response.data));
    }
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
}

function createSignature(params) {
  // Create a string that will be signed
  const queryString = new URLSearchParams(params).toString();
  console.log("String to Sign:", queryString); // Log the string to sign
  return crypto.createHmac("sha512", API_SECRET).update(queryString).digest("hex");
}

async function getBalance() {
  const response = await sendRequest("getInfo", {});
  return response.return.funds; // Returns available balances
}

async function buyUCASH(amount) {
  const response = await sendRequest("Trade", {
    pair: "ucash_btc",
    type: "buy",
    amount: amount,
    price: 0, // Market order
  });
  return response.return;
}

async function tradeUCASH(period, amountToBuy) {
  try {
    let balances = await getBalance();
    let btcBalance = balances.btc || 0;

    while (btcBalance > 0) {
      const amountToTrade = Math.min(amountToBuy, btcBalance);
      const result = await buyUCASH(amountToTrade);
      console.log("Trade Result:", result);

      // Update balance
      balances = await getBalance();
      btcBalance = balances.btc || 0;

      // Wait for the specified period
      await new Promise((resolve) => setTimeout(resolve, period * 1000));
    }
  } catch (error) {
    console.error("Trading error:", error);
  }
}

const PERIOD = 60; // Time in seconds
const AMOUNT_TO_BUY = 0.0001; // Amount of UCASH to buy each period

tradeUCASH(PERIOD, AMOUNT_TO_BUY).catch(console.error);
