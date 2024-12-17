import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_SEPOLIA_URL,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY!]
    },
    ganache: {
      url: "http://127.0.0.1:8545",
      accounts: [process.env.GANACHE_ACCOUNT_PRIVATE_KEY!],
      chainId: 1337,
      gasPrice: 20000000000,
    },
    hardhat: {
      chainId: 31337,  
    },
  },
};

export default config;