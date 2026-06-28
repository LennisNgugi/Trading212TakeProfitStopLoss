import "dotenv/config";
//Live or Demo Base_URL
const BASE_URL = `${process.env.BASE_URL}/equity`;
//Take profit when total stock value reaches target price
const TAKE_PROFIT = Number(process.env.TAKE_PROFIT);
//Stop loss before the total stock value drops below tolerance 
const STOP_LOSS = Number(process.env.STOP_LOSS);
//INTERVAL used to for the sleep time before script loops
const INTERVAL = Number(process.env.INTERVAL);
//TEST_Mode if you want to run the script without selling any stocks
// false for active take profit or stop loss and true for testing configuration 
const TEST_MODE = true;

// List of stocks you want controlled
const STOCKS = [
  "STOCK_TICKET_1",
  "STOCK_TICKET_2", 
  "STOCK_TICKET_3", 
  "STOCK_TICKET_4",
  "STOCK_TICKET_5"  
];

let alreadysold = false;
let running = false;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function headers() {
  return {
    Authorization:
      "Basic " +
      Buffer.from(
        `${process.env.API_KEY}:${process.env.API_SECRET}`
      ).toString("base64"),

    "Content-Type": "application/json"
  };
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: headers()
  });

  const text = await response.text();

  let data = text;

  try {
    if (text) data = JSON.parse(text);
  } catch {}

  if (response.status === 429) {
    console.log("Trading 212 rate limit reached.");
    throw new Error("RATE_LIMIT");
  }

  if (!response.ok) {
    throw new Error(
      `${response.status}: ${JSON.stringify(data)}`
    );
  }

  return data;
}

//  Use positions endpoint 
async function getPortfolio() {
  return api(`${BASE_URL}/positions`);
}

function findStock(portfolio, ticker) {
  return portfolio.find(x => x.instrument?.ticker === ticker);
}

function calculateValue(portfolio) {
  let total = 0;

  console.log("\n========== PORTFOLIO ==========");

  for (const ticker of STOCKS) {
    const stock = findStock(portfolio, ticker);

    if (!stock) {
      console.log(`${ticker}: not found`);
      continue;
    }

    const qty = Number(stock.quantity ?? 0);
    const price = Number(stock.currentPrice ?? 0);

    const value =
      Number(stock.walletImpact?.currentValue) ||
      // Quantity X price for true stock value
      (qty * price); 

    total += value;

    const currency =
      stock.walletImpact?.currency ??
      stock.instrument?.currency ??
      "GBP";

    const symbol = {
      GBP: "£",
      USD: "$",
      EUR: "€"
    }[currency] ?? currency;
    //Average current price
    //const avgPrice = qty !== 0 ? value / qty : 0;
    let avgPrice = Number(stock.averagePricePaid ?? 0);

    // UK shares are quoted in pence
    if (stock.instrument?.currency === "GBX") {
      avgPrice /= 100;
    }

    console.log(`
    ${ticker}
      Quantity: ${qty}
      Avg Price: ${symbol}${avgPrice.toFixed(3)}
      Value: ${symbol}${value.toFixed(2)}
    `);
  }

  console.log("===============================");

  return total;
}

async function sellStock(stock) {
  const qty = Number(stock.quantity ?? 0);

  if (qty <= 0) {
    console.log(`${stock.instrument?.ticker} no shares`);
    return true;
  }

  // Print once so you can inspect Trading212's fields
  console.log("\nPOSITION DATA");
  console.dir(stock, { depth: null });

  // Look for a precision field 
  const precision =
    stock.instrument?.quantityPrecision ??
    stock.instrument?.quantityDecimals ??
    stock.quantityPrecision ??
    stock.quantityDecimals ??
    stock.instrument?.maxOpenQuantityDecimals ??
    null;

  // Build a list of quantities to try
  const attempts = [];

  if (precision !== null) {
    attempts.push(Number(qty.toFixed(precision)));
  } else {
    // Fallback: progressively reduce precision
    for (let decimals = 8; decimals >= 0; decimals--) {
      attempts.push(Number(qty.toFixed(decimals)));
    }
  }

  for (const sellQty of attempts) {
    const payload = {
      ticker: stock.instrument.ticker,
      quantity: -sellQty
    };

    console.log("\nSELL ORDER");
    console.log(payload);

    if (TEST_MODE) {
      console.log("[TEST MODE]");
      return true;
    }

    try {
      await api(`${BASE_URL}/orders/market`, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      console.log(`SOLD ${stock.instrument.ticker}`);
      return true;

    } catch (err) {

      console.log(`Attempt failed (${sellQty})`);
      console.log(err.message);

      // Stop retrying if the error isn't about precision
      if (!err.message.includes("quantity-precision")) {
        return false;
      }
    }
  }

  console.log(`FAILED ${stock.instrument.ticker}`);
  return false;
}

async function sellEverything(portfolio) {
  console.log("\n SELLING ALL STOCKS");

  let ok = true;

  for (const ticker of STOCKS) {
    const stock = findStock(portfolio, ticker);

    if (stock) {
      const result = await sellStock(stock);

      if (!result) ok = false;

      await sleep(5000);
    }
  }

  return ok;
}

async function monitor() {
  if (running) return;

  if (alreadysold) {
    console.log("Already sold");
    return;
  }

  running = true;

  try {
    const portfolio = await getPortfolio();

    const total = calculateValue(portfolio);

    console.log(`TOTAL VALUE £${total.toFixed(2)}`);

    if (total >= TAKE_PROFIT || total <= STOP_LOSS) {
      console.log(
        total >= TAKE_PROFIT
          ? "TAKE PROFIT HIT"
          : "STOP LOSS HIT"
      );

      const sold = await sellEverything(portfolio);

      if (sold) {
  alreadysold = true;

  console.log("");
  console.log("======================================");
  console.log(`TAKE PROFIT ACHIEVED (£${total.toFixed(2)})`);
  console.log("ALL STOCKS SOLD");
  console.log("Monitoring stopped.");
  console.log("======================================");
 
}
    } else {
      console.log("Monitoring");
    }

  } catch (err) {

    if (err.message === "RATE_LIMIT") {
      console.log(" Waiting 30 seconds before retry...");
      await sleep(30000);
    } else {
      console.log("ERROR");
      console.log(err.message);
    }
  
  } finally {
    running = false;
  }
} 
// This closes async function monitor()
console.log("Trading 212 Stock Auto Seller Started");
console.log(`Stocks: ${STOCKS.join(", ")}`);
console.log(`TP: £${TAKE_PROFIT}`);
console.log(`SL: £${STOP_LOSS}`);

async function startMonitoring() {
  while (!alreadysold) {
    await monitor();

    if (!alreadysold) {
      await sleep(INTERVAL);
    }
  }
}

startMonitoring();
