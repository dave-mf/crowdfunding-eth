import React, { useState, useEffect, createContext } from "react";
import Wenb3Modal from "web3modal";
import { ethers } from "ethers";
import { CONTRACTS } from "./contants";

// Create context
export const MultiContractContext = createContext();

// Web3Modal configuration for mobile compatibility
const web3ModalConfig = {
    network: "sepolia",
    cacheProvider: true,
    disableInjectedProvider: false,
    providerOptions: {
      walletconnect: {
        package: null, // Disable WalletConnect for now
      }
    }
};

// Fetch contract function
const fetchContract = (address, abi, signerOrProvider) =>
    new ethers.Contract(address, abi, signerOrProvider);

export const MultiContractProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [activeContract, setActiveContract] = useState("optimized"); // Default to optimized
    const [gasFees, setGasFees] = useState({});
    const [titleData, setTitleData] = useState({
        title: "Crowdfunding DApp",
        description: "A decentralized crowdfunding platform built on blockchain technology"
    });
    const [campaignsUpdatedFlag, setCampaignsUpdatedFlag] = useState(0); // State untuk menandai update campaign

    // Fungsi untuk memicu refresh data campaign
    const triggerCampaignsRefresh = () => {
        setCampaignsUpdatedFlag(prev => prev + 1);
        console.log("Campaigns refresh triggered. Flag:", campaignsUpdatedFlag + 1);
    };

    // Get current contract details
    const getCurrentContract = () => {
        return CONTRACTS[activeContract];
    };

    // Switch contract function
    const switchContract = (contractType) => {
        setActiveContract(contractType);
    };

    // Get ETH price in USD with fallback
    const getEthPrice = async () => {
        try {
            const response = await fetch('/api/eth-price');
            const data = await response.json();
            const price = data.ethereum.usd;
            console.log("Current ETH price:", price); // Debug log
            if (!price || price <= 0) {
                throw new Error("Invalid price from API");
            }
            return price;
        } catch (error) {
            console.warn("Failed to fetch ETH price, using fallback value:", error);
            return 2500; // Updated fallback value in USD
        }
    };

    // Get transaction data from Etherscan
    const getTransactionFromEtherscan = async (txHash) => {
        try {
            const response = await fetch(`https://api-sepolia.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=YourApiKey`);
            const data = await response.json();
            return data.result;
        } catch (error) {
            console.warn("Failed to fetch from Etherscan:", error);
            return null;
        }
    };

    // Get transaction receipt from Etherscan
    const getTransactionReceiptFromEtherscan = async (txHash) => {
        try {
            const response = await fetch(`https://api-sepolia.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=YourApiKey`);
            const data = await response.json();
            return data.result;
        } catch (error) {
            console.warn("Failed to fetch receipt from Etherscan:", error);
            return null;
        }
    };

    // Get gas fee for a transaction
    const getGasFee = async (transaction) => {
        try {
            const provider = transaction.provider;
            const feeData = await provider.getFeeData();
            const gasPrice = feeData.gasPrice || feeData.maxFeePerGas;
            const gasLimit = await transaction.estimateGas();
            const gasFee = gasPrice.mul(gasLimit);
            
            // Get ETH price in USD
            const ethPrice = await getEthPrice();
            console.log("ETH price used for conversion:", ethPrice); // Debug log
            
            const gasFeeInEth = ethers.utils.formatEther(gasFee);
            const gasFeeInUsd = (parseFloat(gasFeeInEth) * ethPrice).toFixed(2);
            
            console.log("Gas fee calculation:", {
                gasFeeInEth,
                ethPrice,
                gasFeeInUsd
            }); // Debug log
            
            return {
                eth: gasFeeInEth,
                usd: gasFeeInUsd
            };
        } catch (error) {
            console.error("Error getting gas fee:", error);
            return { eth: "0", usd: "0" };
        }
    };

    // Store gas fee in localStorage
    const storeGasFee = (txHash, gasFee) => {
        try {
            const storedFees = JSON.parse(localStorage.getItem('gasFees') || '{}');
            storedFees[txHash] = gasFee;
            localStorage.setItem('gasFees', JSON.stringify(storedFees));
            console.log("Stored gas fee:", txHash, gasFee); // Debug log
        } catch (error) {
            console.warn("Error storing gas fee:", error);
        }
    };

    // Get stored gas fee
    const getStoredGasFee = (txHash) => {
        try {
            const storedFees = JSON.parse(localStorage.getItem('gasFees') || '{}');
            const fee = storedFees[txHash];
            console.log("Retrieved gas fee:", txHash, fee); // Debug log
            return fee;
        } catch (error) {
            console.warn("Error getting stored gas fee:", error);
            return null;
        }
    };

    // Create campaign with gas tracking
    const createCampaign = async (campaign) => {
        const { title, description, amount, deadline } = campaign;
        const web3Modal = new Wenb3Modal(web3ModalConfig);
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(
            getCurrentContract().address,
            getCurrentContract().abi,
            signer
        );

        try {
            const transaction = await contract.createCampaign(
                currentAccount,
                title,
                description,
                ethers.utils.parseUnits(amount, 18),
                new Date(deadline).getTime()
            );

            // Get gas fee before waiting for transaction
            const gasFee = await getGasFee(transaction);
            
            // Update gas fees state
            setGasFees(prev => ({
                ...prev,
                createCampaign: {
                    ...prev.createCampaign,
                    [activeContract]: gasFee
                }
            }));

            await transaction.wait();
            console.log("Contract Call Success", transaction);
            triggerCampaignsRefresh(); // <-- Panggil setelah sukses
            return transaction;
        } catch (error) {
            console.log("Contract Call Failure!", error);
            throw error;
        }
    };

    // Get campaigns
    const getCampaigns = async () => {
        if (typeof window === "undefined" || !window.ethereum) {
            alert("Please open this site in MetaMask mobile browser or install MetaMask.");
            return [];
        }
        // Pastikan wallet sudah connect
        let accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (!accounts || accounts.length === 0) {
            accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            if (!accounts || accounts.length === 0) {
                alert("Please connect your wallet first.");
                return [];
            }
        }
        // Pastikan network Sepolia
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0xaa36a7') { // Sepolia chainId
            alert("Please switch your MetaMask network to Sepolia.");
            return [];
        }
        const web3Modal = new Wenb3Modal(web3ModalConfig);
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const contract = fetchContract(
            getCurrentContract().address,
            getCurrentContract().abi,
            provider
        );

        const campaigns = await contract.getCampaigns();

        const parsedCampaigns = campaigns.map((campaign, i) => ({
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: ethers.utils.formatEther(campaign.target.toString()),
            deadline: campaign.deadline.toNumber(),
            amountCollected: ethers.utils.formatEther(
                campaign.amountCollected.toString()
            ),
            pId: i,
            contractVersion: activeContract // Ensure contractVersion is always included
        }));

        return parsedCampaigns;
    };

    // Get user campaigns
    const getUserCampaigns = async () => {
        const web3Modal = new Wenb3Modal(web3ModalConfig);
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const contract = fetchContract(
            getCurrentContract().address,
            getCurrentContract().abi,
            provider
        );

        const allCampaigns = await contract.getCampaigns();
        const accounts = await window.ethereum.request({
            method: "eth_accounts",
        });
        const currentUser = accounts[0];

        // Map all campaigns first to get the correct pId
        const mappedCampaigns = allCampaigns.map((campaign, i) => ({
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: ethers.utils.formatEther(campaign.target.toString()),
            deadline: campaign.deadline.toNumber(),
            amountCollected: ethers.utils.formatEther(
                campaign.amountCollected.toString()
            ),
            pId: i,  // Use the original index as pId
            contractVersion: activeContract
        }));

        // Then filter for user's campaigns
        const userData = mappedCampaigns.filter(
            (campaign) => campaign.owner.toLowerCase() === currentUser.toLowerCase()
        );

        console.log("DEBUG - User Campaigns:", {
            allCampaignsCount: allCampaigns.length,
            userCampaignsCount: userData.length,
            userCampaigns: userData
        });

        return userData;
    };

    // Get donations
    const getDonations = async (pId) => {
        const web3Modal = new Wenb3Modal(web3ModalConfig);
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const contract = fetchContract(
            getCurrentContract().address,
            getCurrentContract().abi,
            provider
        );

        const donations = await contract.getDonators(pId);
        const numberOfDonations = donations[0].length;

        const parsedDonations = [];

        for (let i = 0; i < numberOfDonations; i++) {
            try {
                const donatorAddress = donations[0][i];
                const donationAmount = ethers.utils.formatEther(donations[1][i].toString());
                
                // Get all events from the contract
                const filter = contract.filters.Donated(donatorAddress);
                const events = await contract.queryFilter(filter);
                console.log("Found events for", donatorAddress, ":", events); // Debug log

                let gasFee = { eth: "0", usd: "0" };

                if (events.length > 0) {
                    // Get the most recent event for this donation amount
                    const matchingEvent = events.find(event => {
                        const eventAmount = ethers.utils.formatEther(event.args.amount.toString());
                        return eventAmount === donationAmount;
                    });

                    if (matchingEvent) {
                        const txHash = matchingEvent.transactionHash;
                        console.log("Found transaction hash:", txHash); // Debug log
                        
                        // Try to get stored gas fee first
                        const storedFee = getStoredGasFee(txHash);
                        if (storedFee) {
                            console.log("Using stored fee:", storedFee); // Debug log
                            gasFee = storedFee;
                        } else {
                            console.log("No stored fee, getting from transaction"); // Debug log
                            // If not stored, get from transaction
                            const tx = await provider.getTransaction(txHash);
                            const receipt = await provider.getTransactionReceipt(txHash);
                            
                            if (tx && receipt) {
                                console.log("Transaction data:", tx); // Debug log
                                console.log("Receipt data:", receipt); // Debug log
                                
                                const gasUsed = receipt.gasUsed;
                                const gasPrice = receipt.effectiveGasPrice || tx.gasPrice || tx.maxFeePerGas;
                                const gasFeeInWei = gasUsed.mul(gasPrice);
                                
                                // Get ETH price in USD
                                const ethPrice = await getEthPrice();
                                console.log("ETH price for conversion:", ethPrice); // Debug log
                                
                                const gasFeeInEth = ethers.utils.formatEther(gasFeeInWei);
                                const gasFeeInUsd = (parseFloat(gasFeeInEth) * ethPrice).toFixed(2);
                                
                                console.log("Gas fee calculation:", {
                                    gasUsed: gasUsed.toString(),
                                    gasPrice: gasPrice.toString(),
                                    gasFeeInWei: gasFeeInWei.toString(),
                                    gasFeeInEth,
                                    ethPrice,
                                    gasFeeInUsd
                                }); // Debug log
                                
                                gasFee = {
                                    eth: gasFeeInEth,
                                    usd: gasFeeInUsd
                                };

                                // Store the gas fee for future use
                                storeGasFee(txHash, gasFee);
                            }
                        }
                    }
                }

                // Create donation object
                const donation = {
                    donator: donatorAddress,
                    donation: donationAmount,
                    gasFee: gasFee
                };

                console.log("Created donation object:", donation); // Debug log
                parsedDonations.push(donation);
            } catch (error) {
                console.warn("Error getting gas fee for donation:", error);
                // If we can't get the actual gas fee, use an estimate
                const feeData = await provider.getFeeData();
                const gasPrice = feeData.gasPrice || feeData.maxFeePerGas;
                const gasLimit = 100000;
                const gasFeeInWei = gasPrice.mul(gasLimit);
                const ethPrice = await getEthPrice();
                
                const gasFeeInEth = ethers.utils.formatEther(gasFeeInWei);
                const gasFeeInUsd = (parseFloat(gasFeeInEth) * ethPrice).toFixed(2);

                parsedDonations.push({
                    donator: donations[0][i],
                    donation: ethers.utils.formatEther(donations[1][i].toString()),
                    gasFee: {
                        eth: gasFeeInEth,
                        usd: gasFeeInUsd
                    }
                });
            }
        }

        console.log("Final parsed donations:", parsedDonations); // Debug log
        return parsedDonations;
    };

    // Donate with gas tracking
    const donate = async (pId, amount) => {
        const web3Modal = new Wenb3Modal(web3ModalConfig);
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(
            getCurrentContract().address,
            getCurrentContract().abi,
            signer
        );

        try {
            const transaction = await contract.donateToCampaign(pId, {
                value: ethers.utils.parseEther(amount),
            });

            console.log("Transaction sent:", transaction); // Debug log

            // Wait for transaction to be mined
            console.log("Waiting for transaction to be mined...");
            const receipt = await transaction.wait();
            console.log("Transaction receipt:", receipt); // Debug log

            // Calculate gas fee from receipt
            const gasUsed = receipt.gasUsed;
            const gasPrice = transaction.gasPrice || transaction.maxFeePerGas;
            const gasFeeInWei = gasUsed.mul(gasPrice);
            
            // Get ETH price in USD
            const ethPrice = await getEthPrice();
            
            const gasFeeInEth = ethers.utils.formatEther(gasFeeInWei);
            const gasFeeInUsd = (parseFloat(gasFeeInEth) * ethPrice).toFixed(2);
            
            const gasFee = {
                eth: gasFeeInEth,
                usd: gasFeeInUsd
            };

            console.log("Calculated gas fee:", gasFee); // Debug log
            
            // Store gas fee in localStorage
            storeGasFee(transaction.hash, gasFee);
            
            // Update gas fees state
            setGasFees(prev => ({
                ...prev,
                donate: {
                    ...prev.donate,
                    [activeContract]: gasFee
                }
            }));

            triggerCampaignsRefresh();
            return transaction;
        } catch (error) {
            console.log("Contract Call Failure!", error);
            throw error;
        }
    };

    // Batch donate with gas tracking
    const batchDonate = async (ids, amounts) => {
        const web3Modal = new Wenb3Modal(web3ModalConfig);
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(
            getCurrentContract().address,
            getCurrentContract().abi,
            signer
        );

        try {
            // Calculate total value and format amounts properly
            const totalValue = amounts.reduce((sum, amount) => {
                const parsedAmount = ethers.utils.parseEther(amount.toString());
                return sum.add(parsedAmount);
            }, ethers.BigNumber.from(0));

            // Format amounts for the contract call
            const formattedAmounts = amounts.map(amount => 
                ethers.utils.parseEther(amount.toString())
            );

            console.log("Campaign IDs:", ids); // Debug log
            console.log("Sending amounts:", formattedAmounts); // Debug log
            console.log("Total value:", ethers.utils.formatEther(totalValue)); // Debug log

            let transaction;
            let methodName;
            
            // If only one campaign is selected, use regular donate function
            if (ids.length === 1) {
                console.log("Using single donation function");
                methodName = 'donateToCampaign';
                transaction = await contract.donateToCampaign(ids[0], {
                    value: formattedAmounts[0],
                });
            } else {
                // Use batch donation for multiple campaigns
                console.log("Using batch donation function");
                methodName = activeContract === 'batch-processing' ? 'donateBatch' : 'batchDonate';
                transaction = await contract[methodName](ids, formattedAmounts, {
                    value: totalValue,
                });
            }

            // Get gas fee before waiting for transaction
            const gasFee = await getGasFee(transaction);
            
            // Update gas fees state
            setGasFees(prev => ({
                ...prev,
                batchDonate: {
                    ...prev.batchDonate,
                    [activeContract]: gasFee
                }
            }));

            // Wait for transaction to be mined
            const receipt = await transaction.wait();

            // Log transaction for each campaign
            for (let i = 0; i < ids.length; i++) {
                await logTransaction(
                    transaction.hash,
                    ids[i],
                    amounts[i],
                    methodName,
                    ids, // pass all ids for batch context
                    i    // pass index
                );
            }

            triggerCampaignsRefresh();
            return transaction;
        } catch (error) {
            console.log("Contract Call Failure!", error);
            throw error;
        }
    };

    // Add logTransaction function
    const logTransaction = async (txHash, campaignId, amount, method, ids = [], batchIndex = 0) => {
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

            // Prepare batch data if this is a batch transaction
            let batchData = {};
            if (
              (standardizedMethod === 'Batch Donation' && Array.isArray(ids) && ids.length > 1) ||
              (contractVersion === 'optimized' && Array.isArray(ids) && ids.length > 1)
            ) {
                batchData = {
                    batch_id: txHash,
                    batch_index: batchIndex,
                    batch_size: ids.length
                };
            }

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
                    ...batchData
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to log transaction');
            }

            console.log("Transaction logged successfully");
        } catch (error) {
            console.error("Error logging transaction:", error);
            throw error;
        }
    };

    // Check if wallet is connected
    const checkIfWalletConnected = async () => {
        try {
            if (!window.ethereum) return console.log("Install MetaMask");
            
            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });

            if (accounts.length) {
                setCurrentAccount(accounts[0]);
            } else {
                console.log("No Account Found");
            }
        } catch (error) {
            console.log("Something wrong while connecting to wallet!");
        }
    };

    // Connect wallet
    const connectWallet = async () => {
        try {
            if (!window.ethereum) return console.log("Install Metamask!");

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log("Error while connecting to wallet!");
        }
    };

    // Disconnect wallet
    const disconnectWallet = async () => {
        try {
            const web3Modal = new Wenb3Modal(web3ModalConfig);
            // Clear the cached provider
            if (web3Modal.cachedProvider) {
                await web3Modal.clearCachedProvider();
            }
            // Clear the current account
            setCurrentAccount("");
            // Clear any stored wallet data in localStorage
            localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');
            
            // Request MetaMask to disconnect
            if (window.ethereum) {
                await window.ethereum.request({
                    method: "wallet_requestPermissions",
                    params: [{ eth_accounts: {} }]
                });
            }
            
            // Force reload the page to clear any remaining state
            window.location.reload();
        } catch (error) {
            console.log("Error while disconnecting wallet!", error);
        }
    };

    useEffect(() => {
        checkIfWalletConnected();

        // Add event listeners for MetaMask
        if (window.ethereum) {
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    // User disconnected their wallet
                    setCurrentAccount("");
                    localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');
                } else {
                    // User switched accounts
                    setCurrentAccount(accounts[0]);
                }
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });

            // Listen for disconnect
            window.ethereum.on('disconnect', () => {
                setCurrentAccount("");
                localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');
            });
        }

        // Cleanup function
        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners('accountsChanged');
                window.ethereum.removeAllListeners('chainChanged');
                window.ethereum.removeAllListeners('disconnect');
            }
        };
    }, []);

    return (
        <MultiContractContext.Provider
            value={{
                currentAccount,
                activeContract,
                gasFees,
                titleData,
                switchContract,
                createCampaign,
                getCampaigns,
                getUserCampaigns,
                donate,
                batchDonate,
                getDonations,
                connectWallet,
                disconnectWallet,
                getCurrentContract,
                campaignsUpdatedFlag,
                getEthPrice
            }}
        >
            {children}
        </MultiContractContext.Provider>
    );
}; 