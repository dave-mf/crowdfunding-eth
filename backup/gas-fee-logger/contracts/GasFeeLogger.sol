// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GasFeeLogger {
    struct GasFeeData {
        uint256 donationAmount;
        address donator;
        uint256 gasFee;          // Network fee in wei
        uint256 maxFee;          // Max fee in wei
        uint256 gasPrice;        // Gas price in wei
        uint256 gasLimit;        // Gas limit
        uint256 timestamp;
        bool isSuccess;          // Transaction status
    }

    // Mapping from campaign ID to array of gas fee data
    mapping(uint256 => GasFeeData[]) public campaignGasFees;
    
    // Event untuk logging
    event GasFeeLogged(
        uint256 indexed campaignId,
        address indexed donator,
        uint256 donationAmount,
        uint256 gasFee,
        uint256 maxFee,
        uint256 gasPrice,
        uint256 gasLimit,
        uint256 timestamp,
        bool isSuccess
    );

    // Function untuk menyimpan data gas fee
    function logGasFee(
        uint256 _campaignId,
        address _donator,
        uint256 _donationAmount,
        uint256 _gasFee,
        uint256 _maxFee,
        uint256 _gasPrice,
        uint256 _gasLimit,
        bool _isSuccess
    ) external {
        GasFeeData memory newData = GasFeeData({
            donationAmount: _donationAmount,
            donator: _donator,
            gasFee: _gasFee,
            maxFee: _maxFee,
            gasPrice: _gasPrice,
            gasLimit: _gasLimit,
            timestamp: block.timestamp,
            isSuccess: _isSuccess
        });

        campaignGasFees[_campaignId].push(newData);

        emit GasFeeLogged(
            _campaignId,
            _donator,
            _donationAmount,
            _gasFee,
            _maxFee,
            _gasPrice,
            _gasLimit,
            block.timestamp,
            _isSuccess
        );
    }

    // Function untuk mendapatkan semua data gas fee untuk campaign tertentu
    function getCampaignGasFees(uint256 _campaignId) 
        external 
        view 
        returns (GasFeeData[] memory) 
    {
        return campaignGasFees[_campaignId];
    }

    // Function untuk mendapatkan jumlah transaksi untuk campaign tertentu
    function getCampaignTransactionCount(uint256 _campaignId) 
        external 
        view 
        returns (uint256) 
    {
        return campaignGasFees[_campaignId].length;
    }

    // Function untuk mendapatkan total gas fee yang digunakan dalam campaign
    function getTotalGasFeeForCampaign(uint256 _campaignId)
        external
        view
        returns (uint256)
    {
        uint256 total = 0;
        for(uint i = 0; i < campaignGasFees[_campaignId].length; i++) {
            total += campaignGasFees[_campaignId][i].gasFee;
        }
        return total;
    }
} 