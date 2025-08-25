import optimizedABI from "./CrowdFunding.json";
import packingOnlyABI from "./packingonly.json";
import batchOnlyABI from "./batchonly.json";
import unoptimizedABI from "./unoptimized.json";

//Crowdfunding Marketplace (Localhost)
// export const CrowdFundingAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

//Polygon Amoy
// export const CrowdFundingAddress = "0x1bcFb4013c5fc00638a3Ba8c6CEF555ae24e632A";
// export const CrowdFundingABI = crowdFunding.abi;


export const CONTRACTS = {
    "original": {
      address: "0xF464099bdf7F9006Ea23eF0Ec3251461c56Ef869",
      abi: unoptimizedABI,
      name: "Original"
    },
    "variable-packing": {
      address: "0xCc9d302c84a6c16dE17Adb3e234AbA1095562f51",
      abi: packingOnlyABI,
      name: "Variable Packing"
    },
    "batch-processing": {
      address: "0x558fAa5b8409259bd529eeF1C5eC04c5610B264F",
      abi: batchOnlyABI,
      name: "Batch Processing"
    },
    "optimized": {
      address: "0xbF1A86A123B9387AB944648B59a870F0178E3dC0",
      abi: optimizedABI,
      name: "Optimized"
    }
  };

// optimized 0xb74f2fd48f0f07057e341f247750c9998acd35bf