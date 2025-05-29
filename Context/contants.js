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
      address: "0x76779258bc70f0ec54763b42e74b26c9c175ed32",
      abi: unoptimizedABI,
      name: "Original"
    },
    "variable-packing": {
      address: "0x46b5C01774f223b1249A06788B101c7B6eE77bc5",
      abi: packingOnlyABI,
      name: "Variable Packing"
    },
    "batch-processing": {
      address: "0xbD76b9fe30E2E0A786367CF5f9b49F6E38396176",
      abi: batchOnlyABI,
      name: "Batch Processing"
    },
    "optimized": {
      address: "0x8FA5fD1381877C6A3F24B181ADbdD579865e7585",
      abi: optimizedABI,
      name: "Optimized"
    }
  };


//Optimized ✅
// export const CrowdFundingAddress = "0x8FA5fD1381877C6A3F24B181ADbdD579865e7585";
// export { default as CrowdFundingABI } from "./CrowdFunding.json";

//Not-Optimized ✅
// export const CrowdFundingAddress = "0x205EC3cc793Ff3290B0B8507972a5B5532AbE208";
// export const CrowdFundingABI = crowdFunding.abi;

//PackingOnly ✅
// export const CrowdFundingAddress = "0x46b5C01774f223b1249A06788B101c7B6eE77bc5";
// export { default as CrowdFundingABI } from "./CrowdFunding.json";

//BatchOnly ✅
// export const CrowdFundingAddress = "0xbD76b9fe30E2E0A786367CF5f9b49F6E38396176";
// export const CrowdFundingABI = crowdFunding.abi;



//PackingOnly Dpsk


//Optimized Dpsk
