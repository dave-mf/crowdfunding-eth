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
      address: "0x27832a624c29dfbe6e9be78bedfe9ad38714b596",
      abi: unoptimizedABI,
      name: "Original"
    },
    "variable-packing": {
      address: "0xd497DE106Bb8878A8E079F3b99F05Da55f16Ce57",
      abi: packingOnlyABI,
      name: "Variable Packing"
    },
    "batch-processing": {
      address: "0xbD76b9fe30E2E0A786367CF5f9b49F6E38396176",
      abi: batchOnlyABI,
      name: "Batch Processing"
    },
    "optimized": {
      address: "0xb74f2fd48f0f07057e341f247750c9998acd35bf",
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
