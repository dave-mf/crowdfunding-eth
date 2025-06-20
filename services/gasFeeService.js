class GasFeeService {
    // Log gas fee data
    static async logGasFee({
        campaignId,
        donatorAddress,
        donationAmount,
        gasFee,
        maxFee,
        gasPrice,
        gasLimit,
        contractVersion,
        isSuccess,
        campaignTitle,
        methodName
    }) {
        try {
            const response = await fetch('/api/gas-fee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    campaignId,
                    donatorAddress,
                    donationAmount,
                    gasFee,
                    maxFee,
                    gasPrice,
                    gasLimit,
                    contractVersion,
                    isSuccess,
                    campaignTitle,
                    methodName
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to log gas fee');
            }

            return await response.json();
        } catch (error) {
            console.error('Error logging gas fee:', error);
            throw error;
        }
    }

    // Get gas fee data for a specific campaign
    static async getCampaignGasFees(campaignId) {
        try {
            const response = await fetch(`/api/gas-fee?campaignId=${campaignId}`);
            if (!response.ok) {
                throw new Error('Failed to get campaign gas fees');
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting campaign gas fees:', error);
            throw error;
        }
    }

    // Get total gas fee for a campaign
    static async getTotalGasFeeForCampaign(campaignId) {
        try {
            const query = `
                SELECT SUM(gas_fee) as total_gas_fee
                FROM gas_fee_logs
                WHERE campaign_id = $1;
            `;
            const result = await pool.query(query, [campaignId]);
            return result.rows[0].total_gas_fee || 0;
        } catch (error) {
            console.error('Error getting total gas fee:', error);
            throw error;
        }
    }

    // Get gas fee statistics with filters
    static async getGasFeeStats({ campaignId, timeRange, contractVersion, page, limit }) {
        try {
            console.log("GasFeeService - Fetching stats with params:", {
                campaignId,
                timeRange,
                contractVersion,
                page,
                limit
            });

            const queryParams = new URLSearchParams({
                campaignId: campaignId || 'all',
                timeRange: timeRange || 'all',
                contractVersion: contractVersion || 'all',
                page: page || 1,
                limit: limit || 10
            });

            const response = await fetch(`/api/gas-fee?${queryParams}`);
            const data = await response.json();

            console.log("GasFeeService - Received data:", data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch gas fee stats');
            }

            return data;
        } catch (error) {
            console.error('GasFeeService - Error:', error);
            throw error;
        }
    }
}

export default GasFeeService; 