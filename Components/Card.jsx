import React from "react";

const Card = ({ allcampaign, setOpenModel, setDonate, title }) => {
  const daysLeft = (deadline) => {
    const difference = new Date(deadline).getTime() - Date.now();
    const remainingDays = difference / (1000 * 3600 * 24);
    return remainingDays.toFixed(0);
  };

  const isCampaignActive = (deadline) => {
    return new Date(deadline).getTime() > Date.now();
  };

  // Calculate progress percentage
  const calculateProgress = (raised, target) => {
    const progress = (parseFloat(raised) / parseFloat(target)) * 100;
    return Math.min(progress, 100); // Cap at 100%
  };

  const activeCampaigns = allcampaign?.filter((campaign) =>
    isCampaignActive(campaign.deadline)
  );

  const handleDonate = (campaign) => {
    console.log("DEBUG - Card Component:", {
      title: title,
      selectedCampaign: campaign,
      campaignId: campaign.pId,
      campaignTitle: campaign.title,
      owner: campaign.owner
    });
    setDonate(campaign);
    setOpenModel(true);
  };

  const validateAmount = (inputAmount) => {
    // Ganti koma dengan titik, misal "0,799" jadi "0.799"
    const normalizedInput = inputAmount.replace(',', '.');
    const numAmount = parseFloat(normalizedInput);
    
    if (isNaN(numAmount) || numAmount <= 0)
      return { isValid: false, message: "" };
    
    if (fundingData.isFullyFunded)
      return { isValid: false, message: "This campaign is already fully funded!" };
    
    // Gunakan tolerance epsilon dan bulatkan nilai remaining ke 4 desimal
    const epsilon = 0.0001;
    const remainingRounded = parseFloat(fundingData.remainingNeeded.toFixed(4));
    
    if (numAmount > remainingRounded + epsilon) {
      return {
        isValid: false,
        message: `Amount exceeds remaining needed: ${remainingRounded.toFixed(4)} ETH`
      };
    }
    
    return { isValid: true, message: "" };
  };

  return (
    <div className="px-4 py-12 mx-auto max-w-screen-xl">
      <h2 className="text-2xl font-semibold mb-8">{title}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activeCampaigns?.map((campaign, i) => {
          const isFundingComplete =
            parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);
          
          const progressPercentage = calculateProgress(
            campaign.amountCollected,
            campaign.target
          );
          const isFullyFunded = progressPercentage >= 100;

          return (
            <div
              key={i + 1}
              onClick={() =>
                !isFundingComplete && handleDonate(campaign)
              }
              className={`cursor-pointer bg-white border shadow-sm rounded-2xl p-4 transition duration-300 hover:shadow-md ${
                isFundingComplete ? "pointer-events-none opacity-90" : ""
              }`}
            >
              {/* Badge "Crowdfunding Berhasil 🎉" telah dihapus */}

              {/* Days Left and Fully Funded Badge */}
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-500">
                  Days Left : {daysLeft(campaign.deadline)}
                </p>
                {isFullyFunded && (
                  <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    Fully Funded 🎉
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {campaign.title}
              </h3>
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {campaign.description}
              </p>

              {/* Progress Bar Section */}
              <div className="mb-4">
                {/* Progress Stats */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {parseFloat(campaign.amountCollected).toFixed(4)} ETH / {parseFloat(campaign.target).toFixed(4)} ETH
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {progressPercentage.toFixed(1)}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isFullyFunded ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Card;
