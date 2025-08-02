// send_donation.js
const { ethers } = require("ethers");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY || !RPC_URL) {
  console.error("Please set PRIVATE_KEY and RPC_URL in your .env file");
  process.exit(1);
}

// Ganti dengan address & ABI masing-masing contract
const CONTRACTS = [
  {
    name: "Original",
    address: "0x...", // address contract original
    abi: require("./abi/original.json"),
    donateMethod: "donateToCampaign"
  },
  {
    name: "Optimized",
    address: "0x...", // address contract optimized
    abi: require("./abi/optimized.json"),
    donateMethod: "donateToCampaign"
  },
  {
    name: "Variable Packing",
    address: "0x...", // address contract variable packing
    abi: require("./abi/variablePacking.json"),
    donateMethod: "donateToCampaign"
  },
  {
    name: "Batch Processing",
    address: "0x...", // address contract batch-processing
    abi: require("./abi/batchProcessing.json"),
    donateMethod: "batchDonate"
  }
];

const DONATION_AMOUNT = ethers.utils.parseEther("0.01"); // 0.01 ETH

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  for (const contractInfo of CONTRACTS) {
    const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, wallet);

    // Ambil campaign aktif
    let campaigns;
    try {
      campaigns = await contract.getCampaigns();
    } catch (e) {
      console.error(`[${contractInfo.name}] Error fetching campaigns:`, e.message);
      continue;
    }
    const now = Math.floor(Date.now() / 1000);
    const active = campaigns.find(c => Number(c.deadline) > now);
    if (!active) {
      console.log(`[${contractInfo.name}] No active campaign found, skip.`);
      continue;
    }
    const campaignId = active.pId || active.id || 0;

    try {
      let tx;
      if (contractInfo.donateMethod === "batchDonate") {
        // Batch donate: array of 1 campaign
        tx = await contract.batchDonate([campaignId], [DONATION_AMOUNT], { value: DONATION_AMOUNT });
      } else {
        tx = await contract.donateToCampaign(campaignId, { value: DONATION_AMOUNT });
      }
      console.log(`[${contractInfo.name}] Sent tx: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`[${contractInfo.name}] Gas used: ${receipt.gasUsed.toString()}`);
    } catch (e) {
      console.error(`[${contractInfo.name}] Error sending donation:`, e.message);
    }
  }
}

main();