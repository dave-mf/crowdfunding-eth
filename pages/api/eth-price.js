export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    // Return a fallback price if the API call fails
    res.status(200).json({ ethereum: { usd: 2500 } });
  }
} 