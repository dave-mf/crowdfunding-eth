import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import GasFeeService from '../services/gasFeeService';
import { MultiContractContext } from '../Context/MultiContractContext';
import { getEthPrice } from '../utils/ethPrice';

const GasStats = () => {
  const { getCampaigns } = useContext(MultiContractContext);
  const [stats, setStats] = useState({
    original: [],
    optimized: [],
    variablePacking: [],
    batchProcessing: []
  });
  const [transactions, setTransactions] = useState([]);
  const [ethPrice, setEthPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [selectedVersion, setSelectedVersion] = useState('all');
  const [campaigns, setCampaigns] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch ETH price
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const price = await getEthPrice();
        setEthPrice(price);
      } catch (error) {
        console.error('Error fetching ETH price:', error);
        setEthPrice(2500); // Fallback price
      }
    };

    fetchEthPrice();
    const interval = setInterval(fetchEthPrice, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Fetch campaign titles
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const campaignData = await getCampaigns();
        const campaignMap = {};
        campaignData.forEach(campaign => {
          // Store campaign data with both contract version and campaign ID
          const key = `${campaign.contractVersion || 'original'}-${campaign.pId}`;
          campaignMap[key] = {
            title: campaign.title,
            contractVersion: campaign.contractVersion || 'original'
          };
        });
        setCampaigns(campaignMap);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    fetchCampaigns();
  }, [getCampaigns]);

  // Fetch gas fee stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await GasFeeService.getGasFeeStats({
          campaignId: selectedCampaign,
          timeRange: timeRange,
          contractVersion: selectedVersion,
          page: currentPage,
          limit: itemsPerPage
        });
        
        setStats(data.stats);
        setTransactions(data.transactions);
        // Ensure totalPages is a positive number
        const calculatedTotalPages = Math.max(1, Math.ceil((data.total_count || 0) / itemsPerPage));
        setTotalPages(calculatedTotalPages);
      } catch (error) {
        console.error('Error fetching gas stats:', error);
        setTotalPages(1); // Reset to 1 on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedCampaign, timeRange, selectedVersion, currentPage]);

  // Calculate savings percentage
  const calculateSavings = (original, optimized) => {
    if (!original || !optimized) return 0;
    return ((original - optimized) / original * 100).toFixed(2);
  };

  // Format gas fee to ETH
  const formatGasFee = (fee) => {
    if (!fee) return '0 ETH';
    try {
      // If fee is already in ETH format (string with decimals)
      const feeInEth = typeof fee === 'string' && fee.includes('.')
        ? fee
        : ethers.utils.formatEther(fee.toString());
      
      return `${parseFloat(feeInEth).toFixed(6)} ETH`;
    } catch (error) {
      console.error('Error formatting gas fee:', error);
      return '0 ETH';
    }
  };

  // Format gas fee to USD
  const formatGasFeeUSD = (fee) => {
    if (!fee || !ethPrice) return '$0';
    
    try {
      // If fee is already in ETH format (string with decimals)
      const feeInEth = typeof fee === 'string' && fee.includes('.')
        ? fee
        : ethers.utils.formatEther(fee.toString());
      
      const ethAmount = parseFloat(feeInEth);
      return `$${(ethAmount * ethPrice).toFixed(2)}`;
    } catch (error) {
      console.error('Error formatting gas fee:', error);
      return '$0';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gas Fee Statistics</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading statistics...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Original Contract Stats */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Original Contract</h2>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600">Total Transactions</span>
                    <span className="font-medium text-gray-900">{stats.original.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600">Average Gas Fee</span>
                    <span className="font-medium text-gray-900">{formatGasFee(stats.original[0]?.avg_gas_fee)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600">Total Gas Fee</span>
                    <span className="font-medium text-gray-900">{formatGasFee(stats.original[0]?.total_gas_fee)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600">Total Gas Fee (USD)</span>
                    <span className="font-medium text-gray-900">{formatGasFeeUSD(stats.original[0]?.total_gas_fee)}</span>
                  </div>
                </div>
              </div>

              {/* Optimized Contract Stats */}
              <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Optimized Contract</h2>
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600">Total Transactions</span>
                    <span className="font-medium text-gray-900">{stats.optimized.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600">Average Gas Fee</span>
                    <span className="font-medium text-gray-900">{formatGasFee(stats.optimized[0]?.avg_gas_fee)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600">Total Gas Fee</span>
                    <span className="font-medium text-gray-900">{formatGasFee(stats.optimized[0]?.total_gas_fee)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600">Total Gas Fee (USD)</span>
                    <span className="font-medium text-gray-900">{formatGasFeeUSD(stats.optimized[0]?.total_gas_fee)}</span>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">Savings</span>
                      <span className="text-green-700 font-bold">
                        {calculateSavings(stats.original[0]?.avg_gas_fee, stats.optimized[0]?.avg_gas_fee)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Variable Packing Stats */}
              <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Variable Packing</h2>
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600">Total Transactions</span>
                    <span className="font-medium text-gray-900">{stats.variablePacking.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600">Average Gas Fee</span>
                    <span className="font-medium text-gray-900">{formatGasFee(stats.variablePacking[0]?.avg_gas_fee)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600">Total Gas Fee</span>
                    <span className="font-medium text-gray-900">{formatGasFee(stats.variablePacking[0]?.total_gas_fee)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600">Total Gas Fee (USD)</span>
                    <span className="font-medium text-gray-900">{formatGasFeeUSD(stats.variablePacking[0]?.total_gas_fee)}</span>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700 font-medium">Savings</span>
                      <span className="text-purple-700 font-bold">
                        {calculateSavings(stats.original[0]?.avg_gas_fee, stats.variablePacking[0]?.avg_gas_fee)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Batch Processing Stats */}
              <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Batch Processing</h2>
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600">Total Transactions</span>
                    <span className="font-medium text-gray-900">{stats.batchProcessing.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600">Average Gas Fee</span>
                    <span className="font-medium text-gray-900">{formatGasFee(stats.batchProcessing[0]?.avg_gas_fee)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600">Total Gas Fee</span>
                    <span className="font-medium text-gray-900">{formatGasFee(stats.batchProcessing[0]?.total_gas_fee)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-gray-600">Total Gas Fee (USD)</span>
                    <span className="font-medium text-gray-900">{formatGasFeeUSD(stats.batchProcessing[0]?.total_gas_fee)}</span>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="flex justify-between items-center">
                      <span className="text-orange-700 font-medium">Savings</span>
                      <span className="text-orange-700 font-bold">
                        {calculateSavings(stats.original[0]?.avg_gas_fee, stats.batchProcessing[0]?.avg_gas_fee)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Campaign</label>
                  <select
                    value={selectedCampaign}
                    onChange={(e) => {
                      setSelectedCampaign(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="all">All Campaigns</option>
                    {Object.entries(campaigns).map(([key, campaign]) => (
                      <option key={key} value={campaign.pId}>
                        {campaign.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contract Version</label>
                  <select
                    value={selectedVersion}
                    onChange={(e) => {
                      setSelectedVersion(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="all">All Versions</option>
                    <option value="original">Original</option>
                    <option value="optimized">Optimized</option>
                    <option value="variablePacking">Variable Packing</option>
                    <option value="batchProcessing">Batch Processing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time Range</label>
                  <select
                    value={timeRange}
                    onChange={(e) => {
                      setTimeRange(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="all">All Time</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transaction History Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Transaction History</h3>
              </div>
              <div className="border-t border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract Version</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gas Fee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gas Fee (USD)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((tx) => {
                      const campaignKey = `${tx.contract_version}-${tx.campaign_id}`;
                      const campaignInfo = campaigns[campaignKey];
                      const campaignTitle = tx.campaign_title || campaignInfo?.title || `Campaign #${tx.campaign_id}`;
                      
                      return (
                        <tr key={tx.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="font-medium">{campaignTitle}</div>
                            <div className="text-gray-500">ID: {tx.campaign_id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.method_name || 'unknown'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.contract_version}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatGasFee(tx.gas_fee)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatGasFeeUSD(tx.gas_fee)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              tx.is_success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {tx.is_success ? 'Success' : 'Failed'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(tx.timestamp)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      {totalPages > 0 && [...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === i + 1
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GasStats; 