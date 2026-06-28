import "dotenv/config";
import axios from "axios";

async function listStocks() {
  try {
    const response = await axios.get(
      //Live or Demo Base_URL
      `${process.env.BASE_URL}/equity/positions`, 
      {
        auth: {
          //API_KEY
          username: process.env.API_KEY,
          //API_SECRET
          password: process.env.API_SECRET,
        },
      }
    );

    const positions = response.data;

    // Sort alphabetically by company name
    const sortedPositions = [...positions].sort((a, b) => {
      const companyA = (a.instrument?.name ?? "").toUpperCase();
      const companyB = (b.instrument?.name ?? "").toUpperCase();

      return companyA.localeCompare(companyB);
    });

    console.log("\n========== YOUR STOCKS ==========\n");

    for (const stock of sortedPositions) {

      const companyName =
        stock.instrument?.name ?? "Unknown Company";

      const ticker =
        stock.instrument?.ticker ?? "UNKNOWN";

      const quantity =
        Number(stock.quantity ?? 0);

      const currency =
        stock.walletImpact?.currency ?? "GBP";

      const symbol = {
        GBP: "£",
        USD: "$",
        EUR: "€"
      }[currency] ?? currency;

      // Current portfolio value
      const value =
        Number(stock.walletImpact?.currentValue ?? 0);

      // Average purchase price
      let avgPrice =
        Number(stock.averagePricePaid ?? 0);

      // UK shares are quoted in pence (GBX)
      if (stock.instrument?.currency === "GBX") {
        avgPrice /= 100;
      }

      console.log(`
        Company:   ${companyName}
        Ticker:    ${ticker}
        Quantity:  ${quantity}
        Avg Price: ${symbol}${avgPrice.toFixed(3)}
        Value:     ${symbol}${value.toFixed(2)}
        `);
    }
 
    console.log("\nTickets for STOCKS List in app.js\n");

    const tickers = sortedPositions
      .map(stock => `"${stock.instrument?.ticker}"`)
      .join(",");

    console.log(tickers);

  } catch (error) {
    console.log("ERROR");
    console.log(error.response?.status);
    console.log(error.response?.data || error.message);
  }
}

listStocks();
