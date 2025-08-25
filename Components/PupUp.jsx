import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import GasFeeService from "../services/gasFeeService";
import { getEthPrice } from "../utils/ethPrice";

const PupUp = ({ setOpenModel, donate, donateFunction, getDonations, getCampaigns, getCurrentContract, getEthPrice }) => {
  const [amount, setAmount] = useState("");
  const [allDonationData, setAllDonationData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);
  const [gasDetails, setGasDetails] = useState(null);
  const [maxFee, setMaxFee] = useState(null);
  const [activeContract, setActiveContract] = useState(null);
  const [idrRate, setIdrRate] = useState(null);
  const [transactionAlerts, setTransactionAlerts] = useState([]); // { id, level, message }

  const AMOUNT_TEMPLATES = [0.1, 0.01, 0.001, 0.0001];

  // Calculate funding limits
  const calculateFundingLimits = () => {
    const target = parseFloat(donate.target) || 0;
    const raised = parseFloat(donate.amountCollected) || 0;
    const remainingNeeded = Math.max(target - raised, 0);
    const progressPercentage = target > 0 ? (raised / target) * 100 : 0;
    const isFullyFunded = progressPercentage >= 100;

    return {
      target,
      raised,
      remainingNeeded,
      progressPercentage: Math.min(progressPercentage, 100),
      isFullyFunded
    };
  };

  const fundingData = calculateFundingLimits();

  // Validation for amount input
  const validateAmount = (inputAmount) => {
    const numAmount = parseFloat(inputAmount);
    if (isNaN(numAmount) || numAmount <= 0) return { isValid: false, message: "" };
    
    if (fundingData.isFullyFunded) {
      return { isValid: false, message: "This campaign is already fully funded!" };
    }
    
    if (numAmount > fundingData.remainingNeeded) {
      return { 
        isValid: false, 
        message: `Amount exceeds remaining needed: ${fundingData.remainingNeeded.toFixed(4)} ETH` 
      };
    }
    
    return { isValid: true, message: "" };
  };

  const amountValidation = validateAmount(amount);

  // Generate smart amount templates based on remaining funding
  const generateSmartTemplates = () => {
    if (fundingData.isFullyFunded) return [];
    
    const remaining = fundingData.remainingNeeded;
    const templates = [];
    // Misal kamu ingin semua preset di atas disableThreshold dinonaktifkan:
    const disableThreshold = 0.01; // ganti sesuai keinginan
    
    // Tambahkan preset exact remaining (selalu aktif)
    templates.push({
      amount: remaining,
      isValid: true,
      isExact: true,
      source: "exact_remaining"
    });
    
    // Fraction amounts dengan tambahan validasi custom
    if (remaining > 0.001) {
      const halfAmount = remaining * 0.5;
      if (halfAmount >= 0.0001 && halfAmount <= remaining) {
        templates.push({
          amount: halfAmount,
          isValid: halfAmount <= disableThreshold, // disable jika melebihi threshold
          isExact: false,
          source: "half_remaining"
        });
      }
    }
    
    if (remaining > 0.01) {
      const quarterAmount = remaining * 0.25;
      if (quarterAmount >= 0.0001 && quarterAmount <= remaining) {
        templates.push({
          amount: quarterAmount,
          isValid: quarterAmount <= disableThreshold,
          isExact: false,
          source: "quarter_remaining"
        });
      }
    }
    
    if (remaining > 0.1) {
      const tenthAmount = remaining * 0.1;
      if (tenthAmount >= 0.0001 && tenthAmount <= remaining) {
        templates.push({
          amount: tenthAmount,
          isValid: tenthAmount <= disableThreshold,
          isExact: false,
          source: "tenth_remaining"
        });
      }
    }
    
    // Standard amounts, tambahkan validasi tambahan
    const standardAmounts = [0.0001, 0.001, 0.01, 0.1];
    standardAmounts.forEach(amt => {
      const isValid = amt <= remaining && amt <= disableThreshold;
      const alreadyExists = templates.find(t => Math.abs(t.amount - amt) < 0.0001);
      
      
      if (!alreadyExists) {
        templates.push({
          amount: amt,
          isValid: isValid,
          isExact: false,
          source: `standard_${amt}`
        });
      }
    });
    
    
    // Filter keluar preset yang tidak valid
    const validTemplates = templates.filter(template => template.isValid);
    
    // Sorting dan limit
    const result = validTemplates
      .sort((a, b) => a.amount - b.amount)
      .slice(0, 4)
      .map(template => ({
        amount: parseFloat(template.amount.toFixed(4)),
        isValid: template.isValid,
        isExact: template.isExact,
        source: template.source
      }));
      
    
    return result;
  };

  const smartTemplates = generateSmartTemplates();

  // Fetch ETH price
  const fetchEthPrice = async () => {
    try {
      const price = await getEthPrice();
      setEthPrice(price);
    } catch (error) {
      console.error("Error fetching ETH price:", error);
      setEthPrice(2500); // Fallback price
    }
  };

  // Get gas details from MetaMask
  const getGasDetails = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const gasPrice = await provider.getGasPrice();
      const gasPriceInEth = ethers.utils.formatEther(gasPrice);
      
      if (ethPrice) {
        const gasPriceInUsd = (parseFloat(gasPriceInEth) * ethPrice).toFixed(2);
        setGasDetails({
          eth: gasPriceInEth,
          usd: `$${gasPriceInUsd}`
        });
      }
    } catch (error) {
      console.error("Error getting gas details:", error);
    }
  };

  // Update gas details when ETH price changes
  useEffect(() => {
    getGasDetails();
  }, [ethPrice]);

  // Fetch ETH price on component mount and every 5 minutes
  useEffect(() => {
    fetchEthPrice();
    const interval = setInterval(fetchEthPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const estimateGas = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setEstimatedGas(null);
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = getCurrentContract().contract || getCurrentContract();

      let gasEstimate;
      if (donate.contractVersion === 'batch-processing' || donate.contractVersion === 'variable-packing') {
        // For batch donation contracts
        gasEstimate = await contract.estimateGas.batchDonate([donate.pId], [ethers.utils.parseEther(amount)]);
      } else {
        // For single donation contracts
        gasEstimate = await contract.estimateGas.donate(donate.pId, ethers.utils.parseEther(amount));
      }

      const gasPrice = await provider.getGasPrice();
      const gasCostInWei = gasEstimate.mul(gasPrice);
      const gasCostInEth = ethers.utils.formatEther(gasCostInWei);

      if (ethPrice) {
        const gasCostInUsd = (parseFloat(gasCostInEth) * ethPrice).toFixed(2);
        setEstimatedGas({
          eth: gasCostInEth,
          usd: `$${gasCostInUsd}`
        });
      }
    } catch (error) {
      console.error("Error estimating gas:", error);
      setEstimatedGas(null);
    }
  };

  // Update gas estimate when amount or gas details change
  useEffect(() => {
    estimateGas();
  }, [amount, gasDetails, ethPrice]);

  // Fetch IDR conversion rate from USD using freeforexapi.com
  const fetchIdrRate = async () => {
    try {
      console.log("🔍 Fetching IDR rate...");
      
      // API alternatif yang support CORS
      const response = await fetch("https://api.fxratesapi.com/latest?base=USD&symbols=IDR");
      console.log("🔍 IDR API Response status:", response.status);
      
      const data = await response.json();
      console.log("🔍 IDR API Response data:", data);
      
      if (data && data.rates && data.rates.IDR) {
        setIdrRate(data.rates.IDR);
        console.log("✅ IDR rate set successfully:", data.rates.IDR);
      } else {
        console.log("❌ No IDR rate found, using fallback");
        setIdrRate(16000); // Fallback rate
      }
    } catch (error) {
      console.error("❌ Error fetching IDR rate:", error);
      console.log("Using fallback IDR rate: 16000");
      setIdrRate(16000); // Fallback rate
    }
  };

  useEffect(() => {
    fetchIdrRate();
  }, []);

  // Fetch donation history from database
  const fetchDonationHistory = async () => {
    try {
      if (!donate || !donate.pId) {
        console.log("No donate or pId:", donate);
        setAllDonationData([]);
        return;
      }

      // Validate campaign data
      console.log("DEBUG - Campaign Validation:", {
        currentCampaignId: donate.pId,
        currentCampaignTitle: donate.title,
        currentOwner: donate.owner,
        currentContractVersion: donate.contractVersion,
        fullDonateObject: donate
      });

      // Normalize contract version
      let contractVersion = donate.contractVersion;
      if (contractVersion === 'variablePacking') {
        contractVersion = 'variable-packing';
      } else if (contractVersion === 'batchProcessing') {
        contractVersion = 'batch-processing';
      }

      // Get transactions from database filtered by campaign ID and contract version
      const response = await fetch(`/api/gas-fee?campaignId=${donate.pId}&contractVersion=${contractVersion}`);
      const result = await response.json();
      
      console.log("DEBUG - API Response:", {
        url: `/api/gas-fee?campaignId=${donate.pId}&contractVersion=${contractVersion}`,
        response: result
      });

      // Validate that we got transactions for the correct campaign
      if (result.transactions && result.transactions.length > 0) {
        const firstTx = result.transactions[0];
        if (firstTx.campaign_id !== donate.pId) {
          console.error("Mismatched campaign ID:", {
            expected: donate.pId,
            received: firstTx.campaign_id,
            campaignTitle: firstTx.campaign_title
          });
          setAllDonationData([]);
          return;
        }
      }

      // Check if result has transactions array
      if (!result || !result.transactions || !Array.isArray(result.transactions)) {
        console.log("No transactions found or invalid format:", result);
        setAllDonationData([]);
        return;
      }

      // Format the data for display
      const formattedDonations = result.transactions.map(tx => {
        // Convert gas fee to USD if we have ETH price
        let gasFeeUsd = '0';
        if (ethPrice && tx.gas_fee) {
          try {
            const gasFeeInEth = typeof tx.gas_fee === 'string' && tx.gas_fee.includes('.')
              ? tx.gas_fee
              : ethers.utils.formatEther(tx.gas_fee.toString());
            
            gasFeeUsd = (parseFloat(gasFeeInEth) * ethPrice).toFixed(2);
            console.log("🔍 Gas fee USD calculated:", gasFeeUsd);
          } catch (error) {
            console.error("Error converting gas fee to USD:", error);
          }
        }

        // Konversi USD ke IDR jika idrRate tersedia
        let gasFeeIdr = "";
        console.log("🔍 IDR conversion check:", {
          idrRate: idrRate,
          gasFeeUsd: gasFeeUsd,
          hasIdrRate: !!idrRate
        });
        
        if (idrRate && parseFloat(gasFeeUsd) > 0) {
          const idrValue = parseFloat(gasFeeUsd) * idrRate;
          gasFeeIdr = "Rp." + idrValue.toFixed(0);
          console.log("✅ IDR conversion successful:", {
            usd: gasFeeUsd,
            rate: idrRate,
            idr: gasFeeIdr
          });
        } else {
          console.log("❌ IDR conversion failed:", {
            hasIdrRate: !!idrRate,
            usdValue: gasFeeUsd
          });
        }
        
        return {
          donator: tx.donator_address,
          amount: tx.donation_amount,
          gasFee: {
            eth: tx.gas_fee,
            usd: `$${gasFeeUsd}`,
            idr: gasFeeIdr ? ` / ${gasFeeIdr}` : ""
          },
          timestamp: tx.timestamp
        };
      });

      console.log("DEBUG - Formatted donations:", {
        campaignId: donate.pId,
        campaignTitle: donate.title,
        transactionCount: formattedDonations.length,
        transactions: formattedDonations
      });
      
      setAllDonationData(formattedDonations);
    } catch (error) {
      console.error("Error fetching donation history:", error);
      setAllDonationData([]);
    }
  };

  // Update donation history when ETH price, donate, or idrRate changes
  useEffect(() => {
    console.log("Donate changed:", donate);
    if (donate && donate.pId) {
      fetchDonationHistory();
    }
  }, [ethPrice, donate, idrRate]);

  // Clear donations when modal is closed
  const handleCloseModal = () => {
    setAllDonationData([]);
    setOpenModel(false);
  };

  // Helper: add alert with auto-dismiss
  const addAlert = (message, level = "error", ttl = 5000) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 7);
    const alert = { id, level, message };
    setTransactionAlerts((s) => [...s, alert]);
    setTimeout(() => {
      setTransactionAlerts((s) => s.filter(a => a.id !== id));
    }, ttl);
  };

  // Convert raw error -> friendly message + level
  const parseError = (error) => {
    if (!error) return { message: "Unknown error", level: "error" };
    // MetaMask user cancel
    if (error.code === "ACTION_REJECTED" || error.code === 4001) {
      return { message: "Transaction cancelled by user", level: "warning" };
    }
    const msg = (error.message || "").toLowerCase();
    if (msg.includes("insufficient funds") || msg.includes("insufficient balance")) {
      return { message: "Insufficient funds for gas fee. Please top up and try again.", level: "error" };
    }
    if (msg.includes("already funded") || msg.includes("fully funded")) {
      return { message: "Transaksi gagal: campaign sudah fully funded atau donasi melebihi target. Silakan cek status campaign.", level: "error" };
    }
    if (msg.includes("exceeds target")) {
      return { message: "Transaksi gagal: donasi melebihi sisa target campaign.", level: "error" };
    }
    if (
      msg.includes("call_exception") ||
      msg.includes("transaction failed") ||
      msg.includes("status 0") ||
      msg.includes("execution reverted")
    ) {
      return { message: "Transaksi gagal di blockchain. Kemungkinan campaign sudah fully funded, expired, atau donasi melebihi target. Silakan cek status campaign dan coba lagi.", level: "error" };
    }
    if (msg.includes("gas") || msg.includes("replacement transaction underpriced")) {
      return { message: error.message || "Transaction failed due to gas / network issue", level: "error" };
    }
    // Fallback
    return { message: error.message || String(error), level: "error" };
  };

  const createDonation = async () => {
    try {
      setIsLoading(true);
      // reset alerts for new attempt
      setTransactionAlerts([]);
      const transaction = await donateFunction(donate.pId, amount);
      
      // Wait for transaction to be mined
      const receipt = await transaction.wait();
      
      const methodName = donate.contractVersion === 'batch-processing' || donate.contractVersion === 'variable-packing'
        ? 'batchDonate'
        : 'donateToCampaign';
      
      await logTransaction(
        transaction.hash,
        donate.pId,
        amount,
        methodName
      );
      
      setOpenModel(false);
    } catch (error) {
      console.error("Donation error:", error);
      const parsed = parseError(error);
      addAlert(parsed.message, parsed.level, 7000);

      // Jika error fully funded, auto reload setelah 2 detik
      if (
        parsed.message.includes("fully funded") ||
        parsed.message.includes("melebihi target") ||
        parsed.message.includes("gagal di blockchain")
      ) {
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      }
    } finally {
      setIsLoading(false);
    }
   };

  // Rename the logging function to avoid confusion
  const logTransaction = async (txHash, campaignId, amount, method) => {
    try {
      console.log("Starting logTransaction with:", {
        txHash,
        campaignId,
        amount,
        method,
        donate: donate
      });

      // Get transaction data from MetaMask
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tx = await provider.getTransaction(txHash);
      const receipt = await provider.getTransactionReceipt(txHash);
      
      console.log("Transaction data:", {
        tx,
        receipt
      });

      // Get method name from transaction data
      let methodName = method;
      if (!methodName && tx.data) {
        // Decode transaction data to get method name
        const iface = new ethers.utils.Interface(getCurrentContract().abi);
        try {
          const decodedData = iface.parseTransaction({ data: tx.data });
          methodName = decodedData.name;
        } catch (error) {
          console.error("Error decoding transaction data:", error);
          methodName = "unknown";
        }
      }

      // Map method names to standardized format
      const methodMap = {
        'donateToCampaign': 'Single Donation',
        'donate': 'Single Donation',           // Add this for variable-packing
        'batchDonate': 'Batch Donation',
        'donateBatch': 'Batch Donation',
        'unknown': 'Unknown Method'
      };

      let standardizedMethod = methodMap[methodName] || methodName;

      // Get campaign title and contract version
      const campaigns = await getCampaigns();
      const campaign = campaigns.find(c => c.pId === campaignId);
      const campaignTitle = campaign ? campaign.title : 'Unknown Campaign';
      const contractVersion = donate.contractVersion || 'optimized';

      // Override method for variable-packing contract
      if (contractVersion === 'variable-packing') {
        standardizedMethod = 'Single Donation';
      }

      console.log("Campaign data:", {
        campaign,
        campaignTitle,
        contractVersion,
        methodName,
        standardizedMethod
      });

      // Calculate gas fee
      const gasUsed = receipt.gasUsed;
      const gasPrice = receipt.effectiveGasPrice || tx.gasPrice;
      const gasFeeInWei = gasUsed.mul(gasPrice);
      const gasFeeInEth = ethers.utils.formatEther(gasFeeInWei);

      // Get ETH price in USD
      const currentEthPrice = await getEthPrice();
      const gasFeeInUsd = (parseFloat(gasFeeInEth) * currentEthPrice).toFixed(2);

      // Get current account as donator address
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const donatorAddress = accounts[0];

      // Prepare batch data if this is a batch transaction
      let batchData = {};
      if (standardizedMethod === 'Batch Donation') {
        // For batch transactions, use transaction hash as batch_id
        batchData = {
          batch_id: txHash,
          batch_index: 0, // This will be updated by the API if needed
          batch_size: 1   // This will be updated by the API if needed
        };

        // If this is a batch transaction, we need to get the total number of donations in the batch
        try {
          const iface = new ethers.utils.Interface(getCurrentContract().abi);
          const decodedData = iface.parseTransaction({ data: tx.data });
          
          console.log("Decoded batch transaction data:", {
            decodedData,
            args: decodedData.args,
            campaignId,
            txHash
          });
          
          // For batch transactions, the first argument is an array of campaign IDs
          if (decodedData.args && Array.isArray(decodedData.args[0])) {
            batchData.batch_size = decodedData.args[0].length;
            
            // Find the index of the current campaign in the batch
            const campaignIndex = decodedData.args[0].findIndex(id => id.toString() === campaignId.toString());
            if (campaignIndex !== -1) {
              batchData.batch_index = campaignIndex;
            }
          }
        } catch (error) {
          console.error("Error decoding batch transaction data:", error);
        }
      }

      console.log("Logging transaction with batch data:", {
        campaignId,
        donatorAddress,
        amount,
        gasFeeInEth,
        contractVersion,
        campaignTitle,
        methodName: standardizedMethod,
        batchData,
        txHash
      });

      const response = await fetch('/api/gas-fee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: campaignId,
          donatorAddress: donatorAddress,
          donationAmount: amount,
          gasFee: gasFeeInEth,
          maxFee: '0',
          gasPrice: gasPrice.toString(),
          gasLimit: gasUsed.toString(),
          contractVersion: contractVersion,
          isSuccess: true,
          campaignTitle: campaignTitle,
          methodName: standardizedMethod,
          ...batchData // Include batch data if this is a batch transaction
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from API:", errorData);
        throw new Error(errorData.error || 'Failed to log transaction');
      }

      const responseData = await response.json();
      console.log("Transaction logged successfully:", responseData);
      
      // Refresh donation history after successful logging
      await fetchDonationHistory();
    } catch (error) {
      console.error("Error logging transaction:", error);
      throw error;
    }
  };

  const selectedCampaigns = donate.selectedCampaigns || [];

  // Misal snippet ini ditambahkan di bagian render komponen BatchDonate,
  // tepat setelah daftar campaign atau sebelum tombol submit.
  const totalEth = selectedCampaigns.reduce((sum, campaignId) => {
    const amt = parseFloat(amounts[campaignId] || "0");
    return sum + amt;
  }, 0);

  const totalUsd = ethPrice ? (totalEth * ethPrice).toFixed(2) : "0.00";
  const totalIdr = (ethPrice && idrRate) ? (totalEth * ethPrice * idrRate).toFixed(0) : "0";

  // JSX summary
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black bg-opacity-40"></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
          {/* Close button */}
          <button
            onClick={handleCloseModal}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            &times;
          </button>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {donate.title}
          </h2>
          <p className="text-sm text-gray-500 mb-4">{donate.description}</p>

          {/* Funding Progress Section */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {fundingData.raised.toFixed(4)} ETH / {fundingData.target.toFixed(4)} ETH
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {fundingData.progressPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              Remaining: {fundingData.remainingNeeded.toFixed(4)} ETH
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  fundingData.isFullyFunded ? 'bg-blue-500' : 'bg-green-500'
                }`}
                style={{ width: `${fundingData.progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Transaction Alerts (multiple) ditampilkan di bawah progress bar */}
          {transactionAlerts.length > 0 && (
            <div className="mb-4 space-y-2">
              {transactionAlerts.map((a) => (
                <div
                  key={a.id}
                  className={`p-2 rounded-md text-xs ${
                    a.level === "error" ? "bg-red-100 text-red-700 border border-red-200" :
                    a.level === "warning" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                    "bg-blue-50 text-blue-700 border border-blue-100"
                  }`}
                >
                  {a.message}
                </div>
              ))}
            </div>
          )}

          {/* Input Section */}
          <div className="mb-4">
            <div className="relative">
              <input
                onChange={(e) => setAmount(e.target.value)}
                placeholder={fundingData.isFullyFunded ? "Campaign fully funded" : "Enter Amount to Donate (ETH)"}
                type="number"
                step="0.0001"
                max={fundingData.remainingNeeded}
                disabled={fundingData.isFullyFunded}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  fundingData.isFullyFunded
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300'
                    : !amountValidation.isValid && amount
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-500'
                }`}
                value={amount}
              />
              {fundingData.remainingNeeded > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(fundingData.remainingNeeded.toFixed(4))}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Max
                </button>
              )}
            </div>

            {/* Validation Message */}
            {!amountValidation.isValid && amount && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {amountValidation.message}
              </p>
            )}

            {/* Smart Amount Templates */}
            {!fundingData.isFullyFunded && smartTemplates.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {smartTemplates.map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    disabled={!template.isValid}
                    className={`px-2 py-1 rounded-full border text-xs focus:outline-none transition-all ${
                      !template.isValid
                        ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed opacity-60'
                        : template.isExact
                        ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                    }`}
                    onClick={() => template.isValid && setAmount(template.amount.toString())}
                  >
                    {template.amount} ETH
                  </button>
                ))}
              </div>
            )}

            {/* Funding Suggestions */}
            {!fundingData.isFullyFunded && fundingData.remainingNeeded < 0.1 && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-xs text-amber-800">
                  💡 This campaign is almost funded! Only {fundingData.remainingNeeded.toFixed(4)} ETH needed to reach the goal.
                </p>
              </div>
            )}

            {/* Network Fee with realtime indicator */}
            {maxFee && (
              <div className="mt-2 p-2 bg-blue-50 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-blue-800">Network Fee</p>
                  <span className="text-xs text-green-600 animate-pulse">● Live</span>
                </div>
                <p className="text-sm text-blue-600">
                  {maxFee.eth} ETH {maxFee.usd && `(${maxFee.usd})`}
                </p>
              </div>
            )}
          </div>

          {/* Donation History */}
          <div className="max-h-40 overflow-y-auto space-y-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Transaction History</h3>
            {allDonationData?.map((donation, i) => (
              <div key={i} className="text-sm text-gray-600 border-b pb-1">
                <div>
                  {i + 1}. {donation.amount} ETH -{" "}
                  <span className="text-gray-400">
                    {donation.donator?.slice(0, 8)}...
                    {donation.donator?.slice(-6)}
                  </span>
                  <div className="text-xs text-gray-500">
                    Gas: {donation.gasFee.eth} ETH ({donation.gasFee.usd}{donation.gasFee.idr})
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Section for BatchDonate */}
          {donate.contractVersion === 'batch-processing' && (
            <div className="mt-4 p-4 border-t">
              <div className="flex justify-between items-center text-sm">
                <p>Selected: {selectedCampaigns.length} campaign(s)</p>
                <p>
                  Total: {totalEth.toFixed(4)} ETH (~${totalUsd} / Rp.{totalIdr})
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end mt-6 gap-3">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={createDonation}
              disabled={
                isLoading || 
                !amount || 
                !amountValidation.isValid || 
                fundingData.isFullyFunded
              }
              className={`px-4 py-2 rounded-md text-white ${
                isLoading || !amount || !amountValidation.isValid || fundingData.isFullyFunded
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isLoading ? 'Processing...' : 
               fundingData.isFullyFunded ? 'Fully Funded' : 'Donate Now'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PupUp;