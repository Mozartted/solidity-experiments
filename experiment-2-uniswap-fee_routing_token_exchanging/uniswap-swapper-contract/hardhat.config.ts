require('dotenv').config()
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-waffle"
import "@openzeppelin/hardhat-upgrades"

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  // defaultNetwork: "localhost",
  networks: {
    hardhat: {
      gas: 1800000,
      chainId: 31337,
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/EXWvkVU2OGbxpVXHRisa1Yj9JsktjrVd",
        blockNumber: 15478421,
      },
      accounts: {
        accountsBalance: "1000000000000000000000",
        mnemonic: <string>process.env.SEED,
        path: "m/44'/60'/0'/0",
        initialIndex: 0
      }
    }
  }
};

export default config;
