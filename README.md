# yobit-ucash-bot

Trading bot that can buy UCASH on Yobit.net on this trading pair **UCASH/BTC**
```
https://yobit.net/en/trade/UCASH/BTC

```
### How it works
User creates account on Yobit, funds account with BTC

Asks bot to buy X UCASH every Y period from the orderbook (market orders)

Bot buys UCASH until no more BTC left.

## Run Locally

Clone the project

```bash
  git clone https://github.com/NithinNitz12/yobit-ucash-bot.git
```

Go to the project directory

```bash
  cd yobit-ucash-bot
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  node tradingBot.js
```

