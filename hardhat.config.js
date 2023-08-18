require("@nomicfoundation/hardhat-toolbox");

const dotenv = require("dotenv");
dotenv.config();

const { CANTO_PRIVATE_KEY, CANTO_TESTNET_RPC } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    canto: {
      url: CANTO_TESTNET_RPC,
      accounts: [CANTO_PRIVATE_KEY],
    },
  },
};
