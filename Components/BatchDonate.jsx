import React, { useState, useContext, useEffect } from 'react';
import { MultiContractContext } from '../Context/MultiContractContext';
import { ethers } from 'ethers';
import { getEthPrice } from '../utils/ethPrice';

const AMOUNT_TEMPLATES = [0.1, 0.01, 0.001, 0.0001];

const BatchDonate = () => {
    const { batchDonate, activeContract, getCampaigns, switchContract } = useContext(MultiContractContext);
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaigns, setSelectedCampaigns] = useState([]);
    const [amounts, setAmounts] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [ethPrice, setEthPrice] = useState(2500);
    const [successMsg, setSuccessMsg] = useState('');
    const [idrRate, setIdrRate] = useState(null);

    // Fetch ETH price
    useEffect(() => {
    const fetchEthPrice = async () => {
        try {
            const price = await getEthPrice();
            setEthPrice(price);
        } catch (error) {
                setEthPrice(2500);
        }
    };
        fetchEthPrice();
    }, []);

    // Fetch IDR rate dari API dan tampilkan di console log
    useEffect(() => {
      const fetchIdrRate = async () => {
        try {
          const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
          const data = await response.json();
          if (data && data.rates && data.rates.IDR) {
            setIdrRate(data.rates.IDR);
          } else {
            console.log("❌ No IDR rate found in response");
            setIdrRate(16000); // gunakan fallback jika perlu
          }
        } catch (error) {
          setIdrRate(16000); // fallback rate
        }
      };
      fetchIdrRate();
    }, []);

    // Fetch campaigns on mount
    useEffect(() => {
        const fetchCampaigns = async () => {
            // Switch contract sesuai halaman
            if (activeContract !== 'optimized' && activeContract !== 'batch-processing') {
                switchContract('optimized');
            }
                const data = await getCampaigns();
                // Filter active campaigns (not expired)
            const active = data.filter(campaign => {
                    const deadline = new Date(campaign.deadline).getTime();
                    return deadline > Date.now();
                });
            setCampaigns(active);
        };
        fetchCampaigns();
    }, [getCampaigns, switchContract, activeContract]);

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
        setError('');
        setSuccessMsg('');
    };

    // Handle amount change
    const handleAmountChange = (campaignId, amount) => {
        const formatted = amount.toString().replace(',', '.');
        setAmounts({ ...amounts, [campaignId]: formatted });
        setError('');
        setSuccessMsg('');
    };

    // Handle badge click
    const handleBadgeClick = (campaignId, value) => {
        setAmounts({ ...amounts, [campaignId]: value.toString() });
        setError('');
        setSuccessMsg('');
    };

    // Calculate total ETH
    const totalETH = selectedCampaigns.reduce((sum, id) => {
        const val = parseFloat(amounts[id]);
        return sum + (isNaN(val) ? 0 : val);
    }, 0);

    // Validate input
    const isValid = selectedCampaigns.length > 0 && selectedCampaigns.every(id => {
        const val = parseFloat(amounts[id]);
        return amounts[id] && !isNaN(val) && val > 0;
    });

    // Handle batch donate
    const handleBatchDonate = async () => {
        setError('');
        setSuccessMsg('');
        if (!isValid) {
            setError('Please enter valid amounts for all selected campaigns.');
            return;
        }

        // Validasi tambahan: pastikan semua campaign masih aktif
        const now = Date.now();
        const expiredCampaigns = selectedCampaigns.filter(campaignId => {
            const campaign = campaigns.find(c => c.pId === campaignId);
            if (!campaign) return true; // Campaign tidak ditemukan
            const deadline = new Date(campaign.deadline).getTime();
            return deadline <= now;
        });
        
        if (expiredCampaigns.length > 0) {
            const expiredTitles = expiredCampaigns.map(id => {
                const campaign = campaigns.find(c => c.pId === id);
                return campaign ? campaign.title : `Campaign ${id}`;
            });
            setError(`Campaign(s) expired: ${expiredTitles.join(', ')}. Please refresh and select active campaigns only.`);
            return;
        }
        
        setLoading(true);
        try {
            const campaignIds = selectedCampaigns.map(id => parseInt(id));
            const donationAmounts = selectedCampaigns.map(id => amounts[id]);
            await batchDonate(campaignIds, donationAmounts, {
                methodName: 'Batch Donation',
                contractVersion: activeContract
            });
            setSuccessMsg('Batch donation successful!');
            setSelectedCampaigns([]);
            setAmounts({});
        } catch (e) {
            // Tangani error apabila user membatalkan transaksi di MetaMask
            if (e.code === "ACTION_REJECTED") {
                setError("Transaction cancelled by user");
            } else {
                setError(e.message || 'Failed to process batch donation');
            }
        } finally {
            setLoading(false);
        }
    };

    // Format deadline
    const formatDeadline = (deadline) => {
        const deadlineTime = new Date(deadline).getTime();
        const difference = deadlineTime - Date.now();
        const daysLeft = Math.floor(difference / (1000 * 3600 * 24));
        if (daysLeft < 0) return "Expired";
        if (daysLeft === 0) return "Less than 1 day left";
        return `${daysLeft} days left`;
    };

    // Success message timer untuk batch donate
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(''), 3500);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    // Hitung total IDR berdasarkan totalETH, ethPrice, dan idrRate bila tersedia
    const totalIdr = (ethPrice && idrRate) ? (totalETH * ethPrice * idrRate).toFixed(0) : "0";

    return (
        <div className="bg-white rounded-xl mb-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <span role="img" aria-label="batch">📦</span> Batch Donate
            </h2>
            <p className="text-gray-500 mb-6">Donasi ke banyak campaign sekaligus, lebih efisien!</p>

            {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
            {successMsg && (
                <div className="mb-4 p-2 bg-green-100 text-green-700 rounded flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    <span>{successMsg}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {campaigns.length === 0 ? (
                    <div className="col-span-full text-gray-500">No active campaigns available for batch donation.</div>
                ) : campaigns.map((campaign) => {
                    const selected = selectedCampaigns.includes(campaign.pId);
                    const isFundingComplete = parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);
                    const progress = (parseFloat(campaign.amountCollected) / parseFloat(campaign.target)) * 100;
                    const progressPercentage = Math.min(progress, 100);
                    return (
                        <div
                          key={campaign.pId}
                          // Jika fully funded, card tidak responsif
                          onClick={() => {
                            if (!isFundingComplete) {
                              handleCampaignSelect(campaign.pId);
                            }
                          }}
                          className={`rounded-lg shadow-md p-4 border transition-all duration-200 ${
                            isFundingComplete
                              ? "pointer-events-none opacity-60"
                              : selected
                              ? "border-blue-500 ring-2 ring-blue-200"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              id={`campaign-${campaign.pId}`}
                              checked={selected}
                              onChange={() => {
                                if (!isFundingComplete) {
                                  handleCampaignSelect(campaign.pId);
                                }
                              }}
                              disabled={isFundingComplete}
                              className="h-4 w-4 text-blue-600 mr-2"
                            />
                            <label
                              htmlFor={`campaign-${campaign.pId}`}
                              className="font-medium text-lg flex-1 cursor-pointer"
                            >
                              {campaign.title}
                            </label>
                          </div>
                          <div className="text-sm text-gray-400 mb-2">{formatDeadline(campaign.deadline)}</div>
                          
                          {/* Progress Bar Section */}
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                {parseFloat(campaign.amountCollected).toFixed(4)} ETH / {parseFloat(campaign.target).toFixed(4)} ETH
                              </span>
                              <span className="text-sm font-semibold text-gray-800">
                                {progressPercentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  progressPercentage >= 100 ? 'bg-blue-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Jika card tidak disabled, tampilkan input amount dan badge */}
                          {!isFundingComplete && selected && (
                            <div className="mt-2">
                              <div className="flex gap-2 mb-2 flex-wrap">
                                {AMOUNT_TEMPLATES.map((amt) => (
                                  <button
                                    key={amt}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation(); // mencegah event naik ke parent
                                      handleBadgeClick(campaign.pId, amt);
                                    }}
                                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200 text-xs hover:bg-blue-100 focus:outline-none"
                                  >
                                    {amt} ETH
                                  </button>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  onClick={(e) => e.stopPropagation()}
                                  value={amounts[campaign.pId] || ''}
                                  onChange={(e) => handleAmountChange(campaign.pId, e.target.value)}
                                  placeholder="Amount in ETH"
                                  className={`w-48 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                    !amounts[campaign.pId] ||
                                    isNaN(parseFloat(amounts[campaign.pId])) ||
                                    parseFloat(amounts[campaign.pId]) <= 0
                                      ? 'border-red-300 focus:ring-red-200'
                                      : 'border-blue-300 focus:ring-blue-200'
                                  }`}
                                  min="0"
                                  step="0.0001"
                                />
                                {amounts[campaign.pId] && (
                                  <button
                                    type="button"
                                    className="text-gray-400 hover:text-red-500 text-lg"
                                    onClick={() => handleAmountChange(campaign.pId, '')}
                                    title="Clear"
                                  >
                                    &times;
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                })}
            </div>

            {/* Summary Bar */}
            <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 pb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4 z-10">
                <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-700">Selected: {selectedCampaigns.length} campaign</span>
                    <span className="font-medium text-gray-700">Total: {totalETH.toFixed(4)} ETH</span>
                    <span className="font-medium text-gray-500">
          (~${(totalETH * ethPrice).toFixed(2)} / Rp.{totalIdr})
        </span>
                </div>
            <button
                onClick={handleBatchDonate}
                    disabled={!isValid || loading}
                    className={`px-6 py-2 rounded text-white font-semibold transition-all duration-200 ${!isValid || loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
                    {loading ? (
                        <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></span> Processing...</span>
                    ) : 'Donate Batch'}
            </button>
            </div>
        </div>
    );
};

export default BatchDonate;