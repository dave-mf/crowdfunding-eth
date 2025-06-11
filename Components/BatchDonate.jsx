import React, { useState, useContext, useEffect } from 'react';
import { MultiContractContext } from '../Context/MultiContractContext';
import { ethers } from 'ethers';
import { getEthPrice } from '../utils/ethPrice';

const BatchDonate = () => {
    const { batchDonate, activeContract, gasFees, getCampaigns, switchContract } = useContext(MultiContractContext);
    const [selectedCampaigns, setSelectedCampaigns] = useState([]);
    const [amounts, setAmounts] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [campaigns, setCampaigns] = useState([]);
    const [estimatedGas, setEstimatedGas] = useState(null);
    const [ethPrice, setEthPrice] = useState(null);

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

    // Fetch ETH price on component mount and every 5 minutes
    useEffect(() => {
        fetchEthPrice();
        const interval = setInterval(fetchEthPrice, 5 * 60 * 1000); // Update every 5 minutes
        return () => clearInterval(interval);
    }, []);

    // Fetch campaigns on component mount
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                // Get the current path to determine which contract to use
                const path = window.location.pathname;
                let contractType = 'optimized'; // default

                if (path.includes('original')) {
                    contractType = 'original';
                } else if (path.includes('variable-packing')) {
                    contractType = 'variable-packing';
                } else if (path.includes('batch-processing')) {
                    contractType = 'batch-processing';
                }

                // Switch to the correct contract
                switchContract(contractType);

                const data = await getCampaigns();
                // Filter active campaigns (not expired)
                const activeCampaigns = data.filter(campaign => {
                    const deadline = new Date(campaign.deadline).getTime();
                    return deadline > Date.now();
                });
                console.log("Active campaigns:", activeCampaigns); // Debug log
                setCampaigns(activeCampaigns);
            } catch (error) {
                console.error("Error fetching campaigns:", error);
                setError("Failed to load campaigns");
            }
        };
        fetchCampaigns();
    }, [getCampaigns, switchContract]);

    // Handle campaign selection
    const handleCampaignSelect = (campaignId) => {
        if (selectedCampaigns.includes(campaignId)) {
            setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaignId));
            const newAmounts = { ...amounts };
            delete newAmounts[campaignId];
            setAmounts(newAmounts);
        } else {
            setSelectedCampaigns([...selectedCampaigns, campaignId]);
            setAmounts({ ...amounts, [campaignId]: '' });
        }
    };

    // Handle amount change
    const handleAmountChange = (campaignId, amount) => {
        // Ensure we're using dot as decimal separator
        const formattedAmount = amount.toString().replace(',', '.');
        setAmounts({ ...amounts, [campaignId]: formattedAmount });
    };

    // Format deadline to show days left
    const formatDeadline = (deadline) => {
        const deadlineTime = new Date(deadline).getTime();
        const difference = deadlineTime - Date.now();
        const daysLeft = Math.floor(difference / (1000 * 3600 * 24));
        
        if (daysLeft < 0) return "Expired";
        if (daysLeft === 0) return "Less than 1 day left";
        return `${daysLeft} days left`;
    };

    // Add new function to estimate gas
    const estimateGasForBatchDonate = async () => {
        try {
            if (selectedCampaigns.length === 0) return;

            const campaignIds = selectedCampaigns.map(id => parseInt(id));
            const donationAmounts = selectedCampaigns.map(id => amounts[id]);

            if (donationAmounts.some(amount => !amount || isNaN(amount) || parseFloat(amount) <= 0)) {
                return;
            }

            const formattedAmounts = donationAmounts.map(amount => {
                const num = parseFloat(amount.toString().replace(',', '.'));
                return num.toString();
            });

            // Get the contract instance from your context
            const contract = await batchDonate.getContract();
            
            // Estimate gas
            const gasEstimate = await contract.estimateGas.batchDonate(campaignIds, formattedAmounts);
            
            // Get current gas price
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const gasPrice = await provider.getGasPrice();
            
            // Calculate total gas cost in ETH
            const gasCostInWei = gasEstimate.mul(gasPrice);
            const gasCostInEth = ethers.utils.formatEther(gasCostInWei);
            
            // Use real-time ETH price
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

    // Update useEffect to include ethPrice dependency
    useEffect(() => {
        estimateGasForBatchDonate();
    }, [selectedCampaigns, amounts, ethPrice]);

    // Handle batch donation
    const handleBatchDonate = async () => {
        try {
            setLoading(true);
            setError('');

            // Validate inputs
            if (selectedCampaigns.length === 0) {
                throw new Error('Please select at least one campaign');
            }

            const campaignIds = selectedCampaigns.map(id => parseInt(id));
            const donationAmounts = selectedCampaigns.map(id => amounts[id]);

            // Validate amounts
            if (donationAmounts.some(amount => !amount || isNaN(amount) || parseFloat(amount) <= 0)) {
                throw new Error('Please enter valid amounts for all selected campaigns');
            }

            // Format amounts to ensure they are valid for the contract
            const formattedAmounts = donationAmounts.map(amount => {
                // Ensure we're using dot as decimal separator
                const num = parseFloat(amount.toString().replace(',', '.'));
                // Convert to string with exactly 18 decimal places
                return num.toString();
            });

            console.log("Formatted amounts:", formattedAmounts); // Debug log

            // Execute batch donation
            await batchDonate(campaignIds, formattedAmounts, {
                methodName: 'Batch Donation',
                contractVersion: 'batch-processing'
            });

            // Reset form
            setSelectedCampaigns([]);
            setAmounts({});
            
        } catch (error) {
            console.error("Batch donation error:", error);
            setError(error.message || "Failed to process batch donation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Batch Donate</h2>
            
            {/* Campaign Selection */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Select Active Campaigns</h3>
                {campaigns.length === 0 ? (
                    <p className="text-gray-500">No active campaigns available for batch donation.</p>
                ) : (
                    <div className="space-y-2">
                        {campaigns.map((campaign) => (
                            <div key={campaign.pId} className="flex items-center space-x-4">
                                <input
                                    type="checkbox"
                                    id={`campaign-${campaign.pId}`}
                                    checked={selectedCampaigns.includes(campaign.pId)}
                                    onChange={() => handleCampaignSelect(campaign.pId)}
                                    className="h-4 w-4 text-blue-600"
                                />
                                <label htmlFor={`campaign-${campaign.pId}`} className="flex-1">
                                    <div className="font-medium">{campaign.title}</div>
                                    <div className="text-sm text-gray-500">
                                        Target: {campaign.target} ETH | Collected: {campaign.amountCollected} ETH
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {formatDeadline(campaign.deadline)}
                                    </div>
                                </label>
                                {selectedCampaigns.includes(campaign.pId) && (
                                    <input
                                        type="number"
                                        value={amounts[campaign.pId] || ''}
                                        onChange={(e) => handleAmountChange(campaign.pId, e.target.value)}
                                        placeholder="Amount in ETH"
                                        className="w-32 px-2 py-1 border rounded"
                                        min="0"
                                        step="0.01"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Replace the existing gas fee display with the new one */}
            {estimatedGas && (
                <div className="mb-4 p-2 bg-gray-100 rounded">
                    <p className="text-sm text-gray-600">
                        Estimated Gas Fee: {estimatedGas.eth} ETH ({estimatedGas.usd})
                    </p>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <button
                onClick={handleBatchDonate}
                disabled={loading || selectedCampaigns.length === 0}
                className={`w-full py-2 px-4 rounded ${
                    loading || selectedCampaigns.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
                {loading ? 'Processing...' : 'Donate Batch'}
            </button>
        </div>
    );
};

export default BatchDonate; 