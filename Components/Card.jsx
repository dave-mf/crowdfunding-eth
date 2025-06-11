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

  return (
    <div className="px-4 py-12 mx-auto max-w-screen-xl">
      <h2 className="text-2xl font-semibold mb-8">{title}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activeCampaigns?.map((campaign, i) => {
          const isFundingComplete =
            parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);

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
              {isFundingComplete && (
                <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 inline-block">
                  Crowdfunding Berhasil 🎉
                </span>
              )}
              <p className="text-sm text-gray-500 mb-1">
                Days Left : {daysLeft(campaign.deadline)}
              </p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {campaign.title}
              </h3>
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {campaign.description}
              </p>
              <div className="flex justify-between text-sm font-medium text-gray-800">
                <p>Target: {campaign.target} ETH</p>
                <p>Raised: {campaign.amountCollected} ETH</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Card;
