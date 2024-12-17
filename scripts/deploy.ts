import { ethers } from "hardhat";

async function main() {
  const ReverseAuctionFactory = await ethers.getContractFactory("ReverseAuctionFactory");
  const network = await ethers.provider.getNetwork();

  let reverseAuction;

  if (network.chainId === 1337) {
    console.log("Network is Ganache");
    reverseAuction = await ReverseAuctionFactory.deploy({
      gasLimit: 5000000,
    });
  } else if (network.chainId === 11155111) {
    console.log("Network is Sepolia");
    reverseAuction = await ReverseAuctionFactory.deploy({
      gasPrice: ethers.utils.parseUnits("20", "gwei"),
      gasLimit: 5000000,
    });
  } else if (network.chainId === 31337) {
    console.log("Network is Hardhat");
    reverseAuction = await ReverseAuctionFactory.deploy({
      gasLimit: 5000000,
    });
  } else {
    throw new Error(`Unsupported network with chainId: ${network.chainId}`);
  }

  await reverseAuction.deployed();

  console.log("Contract deployed to:", reverseAuction.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
