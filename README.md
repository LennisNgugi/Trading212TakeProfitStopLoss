
#  Trading212 Take Profit / Stop Loss Server

A Node.js automation tool that monitors your Trading 212 portfolio and automatically sells selected stocks when either a **take profit** or **stop loss** threshold is reached.

This project uses the Trading 212 API to track portfolio value in real time and send market sell orders when conditions are met.


##  Disclaimer

This project is for educational purposes only:

- Use at your own risk.
- Automated trading can result in financial loss.
- Always test using `TEST_MODE = true` before enabling live trading.
- The author is not responsible for any trading losses.


##  Features

-  Monitors live Trading 212 portfolio value
-  Take profit automation (sells when target reached)
-  Stop loss protection (sells when value drops below threshold)
-  Tracks multiple stocks simultaneously
-  Continuous monitoring with configurable interval
-  Secure API authentication via environment variables
-  Test mode for safe orders
-  Portfolio inspection tools included


##  Project Structure

```text
Trading212TakeProfitStopLoss/
│
├── app.js                     
├── list-tickers-stocks.js    
├── test-authentication.js     
├── ReadMe.md                  
├── .env                       
└── package.json
```


## Installation

```bash
npm install
```


##  Environment Variables

Create a `.env` file in the root directory:

```env
BASE_URL=https://demo.trading212.com/api/v0
API_KEY=your_api_key_here
API_SECRET=your_api_secret_here

TAKE_PROFIT=100
STOP_LOSS=80
INTERVAL=60000
```

### Variable explanation:

| Variable | Description |
|----------|-------------|
| BASE_URL | Trading 212 API base URL (live or demo) |
| API_KEY | Your Trading 212 API key |
| API_SECRET | Your Trading 212 API secret |
| TAKE_PROFIT | Portfolio value at which to sell all stocks |
| STOP_LOSS | Portfolio value at which to exit positions |
| INTERVAL | Time between checks (milliseconds) |



##  API Permissions Required
- Account Data
- Metadata
- Orders - Execute
- Portfolio

##  Testing Authentication

Verify your API credentials:

```bash
node test-authentication.js
```

If successful then account information will be returned.
 

##  View Current Stocks

List all holdings and tickers:

```bash
node list-tickers-stocks.js
```

This will:
- Display all portfolio positions
- Show quantities, prices and values
- Output formatted tickers for use in `app.js`
 

##  Running the Server

Start monitoring your portfolio:

```bash
node app.js
```
 

##  How It Works

1. Fetches portfolio positions from Trading 212 API
2. Calculates total portfolio value
3. Compares value against:
   - Take Profit threshold
   - Stop Loss threshold
4. If triggered:
   - Iterates through selected stocks
   - Sends market sell orders
5. Stops application after selling all positions
 

##  Trading Logic

### Take Profit
When:

```text
Portfolio Value >= TAKE_PROFIT
```

All selected stocks are sold.
 

### Stop Loss
When:

```text
Portfolio Value <= STOP_LOSS
```

All selected stocks are sold.
 

##  Test Mode

Inside `app.js`:

```js
const TEST_MODE = true;
```

### Behaviour:
- Orders are NOT sent to Trading 212
- Logs simulated sell orders only

### To enable live trading:

```js
const TEST_MODE = false;
```
 

##  Core Files Explained

### `app.js`
- Main trading Server
- Portfolio monitoring loop
- Take profit / stop loss logic
- Order sell

### `list-tickers-stocks.js`
- Fetches and sorts portfolio positions
- Outputs tickers for configuration
- Helps populate STOCKS array

### `test-authentication.js`
- Confirms API credentials work
- Simple account info fetch
 

##  Configuration

### Stock Selection

Edit inside `app.js`:

```js
const STOCKS = [
  "STOCK_TICKET_1",
  "STOCK_TICKET_2"
];
```

Only these tickers will be monitored and sold.
 

### Interval Control

```js
// 60 seconds
INTERVAL = 60000; 
```

Lower = faster updates  
Higher = fewer API calls
 

##  Technical Highlights

- Node.js + ES Modules
- REST API integration (Trading 212)
- Base64 authentication
- Async/await polling system
- Retry handling for rate limits (429)
- Safe precision handling for order quantities
- Portfolio aggregation logic
 

##  Risk Notes

- Market orders execute instantly at current price
- Slippage may occur
- Stop loss is not guaranteed at exact price
- API delays may affect timing
- Always test in demo mode first
 

##  Future Improvements

- Per-stock take profit / stop loss
- Trailing stop loss system
- Partial sell support
- Web dashboard UI
- SMS / email alerts
- Historical trade logging
- Database persistence
- Docker deployment
- Backtesting mode
 

##  License

MIT License — free to use and modify for personal or educational use.
 

##  Notes for reader

Built as a personal trading automation project using the Trading 212 API.
