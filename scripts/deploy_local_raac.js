// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  // get contracts
  const RaacNFT = await hre.ethers.getContractFactory("RAAC");
  const RaacVault = await hre.ethers.getContractFactory("RAACVault");

  const nft = await RaacNFT.deploy();
  const vault = await RaacVault.deploy(nft.address);

  await nft.deployed()
  await vault.deployed()


  console.log(
    `RAAC NFT contract deployed to ${nft.address}`
  );

  console.log(
    `RAAC Vault contract deployed to ${vault.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});