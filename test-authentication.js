import "dotenv/config";
import axios from "axios";

async function testauthentication() {
  try {
    const res = await axios.get(

      `${process.env.BASE_URL}/equity/account/info`,  
      {
        auth: {
          username: process.env.TRADING212_API_KEY,
          password: process.env.TRADING212_API_SECRET
        }
      }
    );

    console.log(res.data);
  } catch (err) {
    console.log("Status:", err.response?.status);
    console.log("Data:", err.response?.data);
  }
}

testauthentication();
