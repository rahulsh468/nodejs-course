const hre = require("hardhat");

const royaltyRecipient = "0xDeff82CF2288071d037Ec29C7E0cAB3fA099be4D";
const royaltyRate = 5;
const tokenContractAddress = "0x03F734Bd9847575fDbE9bEaDDf9C166F880B5E5f";

async function main() {
  const Staking = await hre.ethers.getContractFactory("Staking");
  const game = await Staking.deploy(
    royaltyRecipient,
    royaltyRate,
    tokenContractAddress
  );

  await game.deployed();

  console.log(`Contract deployed at ${game.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
