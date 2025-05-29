export const getEthPrice = async () => {
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT');
        const data = await response.json();
        return parseFloat(data.price);
    } catch (error) {
        console.error('Error fetching ETH price:', error);
        return 2500; // Fallback price
    }
}; 