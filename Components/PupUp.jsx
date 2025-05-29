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
      if (donate.contractVersion === 'batchProcessing' || donate.contractVersion === 'variablePacking') {
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

  // Fetch donation history from database
  const fetchDonationHistory = async () => {
    try {
      if (!donate || !donate.contractVersion) {
        setAllDonationData([]);
        return;
      }

      // Get transactions from database filtered by campaign ID and contract version
      const response = await fetch(`/api/gas-fee?campaignId=${donate.pId}&contractVersion=${donate.contractVersion}`);
      const result = await response.json();
      
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
            // If gas_fee is already in ETH format (string with decimals)
            const gasFeeInEth = typeof tx.gas_fee === 'string' && tx.gas_fee.includes('.')
              ? tx.gas_fee
              : ethers.utils.formatEther(tx.gas_fee.toString());
            
            gasFeeUsd = (parseFloat(gasFeeInEth) * ethPrice).toFixed(2);
          } catch (error) {
            console.error("Error converting gas fee to USD:", error);
          }
        }

        return {
          donator: tx.donator_address,
          amount: tx.donation_amount,
          gasFee: {
            eth: tx.gas_fee,
            usd: `$${gasFeeUsd}`
          },
          timestamp: tx.timestamp
        };
      });

      setAllDonationData(formattedDonations);
    } catch (error) {
      console.error("Error fetching donation history:", error);
      setAllDonationData([]);
    }
  };

  // Update donation history when ETH price changes
  useEffect(() => {
    if (donate) {
      fetchDonationHistory();
    }
  }, [ethPrice, donate]);

  // Clear donations when modal is closed
  const handleCloseModal = () => {
    setAllDonationData([]);
    setOpenModel(false);
  };

  useEffect(() => {
    if (donate) {
      fetchDonationHistory();
    } else {
      setAllDonationData([]);
    }
  }, [donate]);

  const createDonation = async () => {
    try {
      setIsLoading(true);
      const transaction = await donateFunction(donate.pId, amount);
      
      // Wait for transaction to be mined
      const receipt = await transaction.wait();
      
      // Log transaction
      await logTransaction(
        transaction.hash,
        donate.pId,
        amount,
        'donateToCampaign'
      );
      
      setOpenModel(false);
    } catch (error) {
      console.error("Donation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Rename the logging function to avoid confusion
  const logTransaction = async (txHash, campaignId, amount, method) => {
    try {
      // Get transaction data from MetaMask
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tx = await provider.getTransaction(txHash);
      const receipt = await provider.getTransactionReceipt(txHash);
      
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
        'batchDonate': 'Batch Donation',
        'donateBatch': 'Batch Donation',
        'unknown': 'Unknown Method'
      };

      const standardizedMethod = methodMap[methodName] || methodName;

      // Get campaign title and contract version
      const campaigns = await getCampaigns();
      const campaign = campaigns.find(c => c.pId === campaignId);
      const campaignTitle = campaign ? campaign.title : 'Unknown Campaign';
      const contractVersion = campaign ? campaign.contractVersion : 'unknown';

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
          methodName: standardizedMethod
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log transaction');
      }

      console.log("Transaction logged successfully");
      
      // Refresh donation history after successful logging
      await fetchDonationHistory();
    } catch (error) {
      console.error("Error logging transaction:", error);
      throw error; // Re-throw to handle in createDonation
    }
  };

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

          {/* Input */}
          <div className="mb-4">
            <input
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter Amount to Donate (ETH)"
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            
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
              <div
                key={i}
                className="text-sm text-gray-600 border-b pb-1"
              >
                <div>
                  {i + 1}. {donation.amount} ETH -{" "}
                  <span className="text-gray-400">
                    {donation.donator?.slice(0, 8)}...
                    {donation.donator?.slice(-6)}
                  </span>
                  <div className="text-xs text-gray-500">
                    Gas: {donation.gasFee.eth} ETH ({donation.gasFee.usd})
                  </div>
                </div>
              </div>
            ))}
          </div>

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
              disabled={isLoading || !amount || isNaN(amount) || parseFloat(amount) <= 0}
              className={`px-4 py-2 rounded-md text-white ${
                isLoading || !amount || isNaN(amount) || parseFloat(amount) <= 0
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isLoading ? 'Processing...' : 'Donate Now'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PupUp;