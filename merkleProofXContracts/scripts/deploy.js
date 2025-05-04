const hre = require("hardhat");

async function main() {
  console.log("Deploying MerkleProofX contract...");

  const [deployer] = await hre.ethers.getSigners();
  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;
  
  console.log("Deploying with treasury address:", treasuryAddress);

  const MerkleProofX = await hre.ethers.getContractFactory("MerkleProofX");
  const merkleProofX = await MerkleProofX.deploy(treasuryAddress);

  await merkleProofX.waitForDeployment();

  const contractAddress = await merkleProofX.getAddress();

  console.log("✅ MerkleProofX deployed to:", contractAddress);
  console.log("Treasury address set to:", treasuryAddress);
  console.log("Platform fee set to:", await merkleProofX.getPlatformFee());

  console.log("\n⏳ Waiting for a few confirmations before verification...");
  await merkleProofX.deploymentTransaction().wait(3); // Wait for 3 confirmations (important!)

  console.log("🔎 Verifying on Etherscan...");
  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: [treasuryAddress],
  });

  console.log("✅ Verification complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment or verification failed:", error);
    process.exit(1);
  });
