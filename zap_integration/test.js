const axios = require('axios');

const apiKey = "8d19d18c-21b4-493f-8540-58c97eaeb68d";
const address = "0x3c5c884d512a4513c9c7440be3c2533175178a09";
const Authorization = `Basic ${Buffer.from(`${apiKey}:`, "binary").toString(
  "base64"
)}`;

//used axios library to make the API calls. Make sure to install it via npm before running the code
async function getBalances() {
  try {
    const getResponse = await axios.get(
        `https://api.zapper.xyz/v2/balances/apps?addresses%5B%5D=${address}`,
        {
            headers: {
                accept: "*/*",
                Authorization,
            },
        }
    )
    console.log(getResponse.data)
    console.log(getResponse.data[0].products[0].assets)
    return getResponse.data;
  } catch (error) {
    console.error(error);
  }
}

getBalances()