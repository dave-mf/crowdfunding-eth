# Crowdfunding Platform

A decentralized crowdfunding platform built with Next.js, Hardhat, and Tailwind CSS. This platform allows users to create and participate in crowdfunding campaigns using smart contracts.

## Features

- **Smart Contract Integration**: Deploy and interact with crowdfunding campaigns using Ethereum smart contracts
- **Multiple Contract Versions**: Support for different contract implementations:
  - Original Contract
  - Optimized Contract
  - Variable Packing Contract
  - Batch Processing Contract
- **Gas Fee Analytics**: Comprehensive gas fee tracking and analysis:
  - Real-time gas fee monitoring
  - Performance comparison between contract versions
  - Detailed transaction history
  - Savings calculation
  - USD value conversion
- **Campaign Management**:
  - Create new campaigns
  - Set funding goals and deadlines
  - Track campaign progress
  - View campaign details
- **User Features**:
  - Connect MetaMask wallet
  - Make donations
  - View transaction history
  - Track gas fees
- **Modern UI/UX**:
  - Responsive design
  - Interactive dashboards
  - Real-time updates
  - Beautiful statistics visualization

## Tech Stack

- **Frontend**:
  - Next.js
  - Tailwind CSS
  - React
  - Ethers.js
- **Smart Contracts**:
  - Solidity
  - Hardhat
  - OpenZeppelin
- **Database**:
  - PostgreSQL
  - Prisma ORM
- **Development Tools**:
  - TypeScript
  - ESLint
  - Prettier

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- MetaMask browser extension

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/crowdfunding.git
   cd crowdfunding
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/crowdfunding"
   NEXT_PUBLIC_RPC_URL="your_ethereum_rpc_url"
   ```

4. Initialize the database:
   ```bash
   npm run init-db
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Database Management

The project uses PostgreSQL for storing gas fee logs and campaign data. The database schema includes:

- `gas_fee_logs`: Stores transaction data including:
  - Gas fees
  - Contract versions
  - Campaign information
  - Transaction methods
  - Timestamps
  - Success status

To manage the database:

1. Start PostgreSQL:
   ```bash
   brew services start postgresql
   ```

2. Create the database:
   ```bash
   createdb crowdfunding
   ```

3. Initialize the database:
   ```bash
   npm run init-db
   ```

4. To reset the database:
   ```bash
   dropdb crowdfunding
   createdb crowdfunding
   npm run init-db
   ```

## Smart Contract Versions

The platform supports multiple contract implementations for gas optimization:

1. **Original Contract**: Base implementation
2. **Optimized Contract**: Gas-optimized version
3. **Variable Packing**: Uses Solidity's variable packing for gas savings
4. **Batch Processing**: Supports batch operations for multiple donations

## Gas Fee Analytics

The platform includes a comprehensive gas fee analytics system:

- **Real-time Monitoring**: Track gas fees for all transactions
- **Version Comparison**: Compare gas usage across different contract versions
- **Performance Metrics**:
  - Average gas fees
  - Total gas consumption
  - USD value conversion
  - Savings percentage
- **Transaction History**:
  - Detailed transaction logs
  - Method tracking
  - Campaign association
  - Success/failure status

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenZeppelin for smart contract libraries
- Tailwind CSS for the UI framework
- Next.js team for the amazing framework
