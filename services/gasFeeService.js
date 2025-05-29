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
    static async getGasFeeStats(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (filters.campaignId) queryParams.append('campaignId', filters.campaignId);
            if (filters.timeRange) queryParams.append('timeRange', filters.timeRange);
            if (filters.contractVersion) queryParams.append('contractVersion', filters.contractVersion);

            const response = await fetch(`/api/gas-fee?${queryParams.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to get gas fee stats');
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting gas fee stats:', error);
            throw error;
        }
    }
}

export default GasFeeService; 