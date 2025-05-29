export const gasFeeLoggerABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "campaignId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "donator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "donationAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gasFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "maxFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gasPrice",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gasLimit",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isSuccess",
        "type": "bool"
      }
    ],
    "name": "GasFeeLogged",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "campaignGasFees",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "donationAmount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "donator",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "gasFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "gasPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "gasLimit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isSuccess",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_campaignId",
        "type": "uint256"
      }
    ],
    "name": "getCampaignGasFees",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "donationAmount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "donator",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "gasFee",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxFee",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gasPrice",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gasLimit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isSuccess",
            "type": "bool"
          }
        ],
        "internalType": "struct GasFeeLogger.GasFeeData[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_campaignId",
        "type": "uint256"
      }
    ],
    "name": "getCampaignTransactionCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_campaignId",
        "type": "uint256"
      }
    ],
    "name": "getTotalGasFeeForCampaign",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_campaignId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_donator",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_donationAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_gasFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_maxFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_gasPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_gasLimit",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "_isSuccess",
        "type": "bool"
      }
    ],
    "name": "logGasFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const GAS_FEE_LOGGER_ADDRESS = "0xEed7b507A8703dB93D8d256A1B0f082fe57aA1C9"; 