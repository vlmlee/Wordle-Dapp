require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-waffle");

require("./tasks/faucet");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      chainId: 1337 // We set 1337 to make interacting with MetaMask simpler
    },
    sepolia: {
      url: `${process.env.INFURA_URL + process.env.INFURA_API_KEY}`,
      accounts: {
        mnemonic: `${process.env.MNEMONIC}`
      }
    }
  }
};
