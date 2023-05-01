async function main() {
    const NFT = await ethers.getContractFactory("RAAC");
    // Start deployment, returning a promise that resolves to a contract object
    const contract = await NFT.deploy();
    await contract.deployed();
    console.log("Contract deployed to address:", contract.address);
  }
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });