const hre = require("hardhat");

async function main() {
  console.log("Deploying MerkleProofX contract...");

  // Get the treasury address from environment or use deployer's address
  const [deployer] = await hre.ethers.getSigners();
  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;
  
  console.log("Deploying with treasury address:", treasuryAddress);

  const MerkleProofX = await hre.ethers.getContractFactory("MerkleProofX");
  const merkleProofX = await MerkleProofX.deploy(treasuryAddress);

  await merkleProofX.waitForDeployment();

  console.log("MerkleProofX deployed to:", await merkleProofX.getAddress());
  console.log("Treasury address set to:", treasuryAddress);
  console.log("Platform fee set to:", await merkleProofX.getPlatformFee());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 