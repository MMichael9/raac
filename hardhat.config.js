/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
const { GOERLI_RPC_URL, PRIVATE_KEY, MAINNET_RPC_URL } = process.env;

module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      chainId: 1,
      forking: {
        url: MAINNET_RPC_URL
      }
    },
    goerli: {
      chainId: 5,
      url: GOERLI_RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    }
  }
};
