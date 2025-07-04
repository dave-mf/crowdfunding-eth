import React, { useEffect, useContext, useState } from "react";
import { MultiContractContext } from "../Context/MultiContractContext";
import { Hero, Card, PupUp } from "../Components";
import Link from "next/link";
import { getEthPrice } from "../utils/ethPrice";

const VariablePacking = () => {
  const {
    titleData,
    getCampaigns,
    createCampaign,
    donate,
    getUserCampaigns,
    getDonations,
    switchContract,
    activeContract,
    campaignsUpdatedFlag,
    getCurrentContract,
    getEthPrice
  } = useContext(MultiContractContext);

  const [allcampaign, setAllcampaign] = useState();
  const [usercampaign, setUsercampaign] = useState();
  const [ethPrice, setEthPrice] = useState(2500);

  // Set contract type to variable-packing (hanya sekali saat mount)
  useEffect(() => {
    switchContract("variable-packing");
  }, []);

  // Fetch data hanya jika activeContract sudah benar ATAU campaignsUpdatedFlag berubah
  useEffect(() => {
    if (activeContract === "variable-packing") {
      setAllcampaign(undefined);
      setUsercampaign(undefined);
      const fetchData = async () => {
        const allData = await getCampaigns();
        const userData = await getUserCampaigns();
        
        // Log untuk debug
        console.log("DEBUG - Campaign Data:", {
          allData: allData,
          userData: userData,
          activeContract: activeContract
        });
        
        setAllcampaign(allData);
        setUsercampaign(userData);
      };
      fetchData();
    }
  }, [activeContract, campaignsUpdatedFlag]);

  //DONATE POPUP MODEL
  const [openModel, setOpenModel] = useState(false);
  const [donateCampaign, setDonateCampaign] = useState();

  const handleDonate = (campaign) => {
    console.log("DEBUG - Selected Campaign:", {
      campaign: campaign,
      id: campaign.pId,
      title: campaign.title,
      owner: campaign.owner
    });
    setDonateCampaign(campaign);
    setOpenModel(true);
  };

  const fetchEthPrice = async () => {
    try {
      const price = await getEthPrice();
      setEthPrice(price);
    } catch (error) {
      console.error("Error fetching ETH price:", error);
      setEthPrice(2500); // Fallback price
    }
  };

  useEffect(() => {
    fetchEthPrice();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="w-full">
        <Hero titleData={titleData} createCampaign={createCampaign} />

        <div className="mt-8">
          {!allcampaign ? (
            <div className="text-center py-8 text-gray-500">Loading campaigns...</div>
          ) : (
            <Card 
              title="All Listed Campaign" 
              allcampaign={allcampaign} 
              setOpenModel={setOpenModel} 
              setDonate={handleDonate} 
            />
          )}
          {!usercampaign ? (
            <div className="text-center py-8 text-gray-400">Loading your campaigns...</div>
          ) : (
            <Card 
              title="Your Created Campaign" 
              allcampaign={usercampaign} 
              setOpenModel={setOpenModel} 
              setDonate={handleDonate} 
            />
          )}
        </div>
      </div>

      {/* Donation Popup */}
      {openModel && donateCampaign && (
        <PupUp 
          setOpenModel={setOpenModel} 
          getDonations={getDonations} 
          donate={{
            ...donateCampaign,
            contractVersion: 'variable-packing'
          }} 
          donateFunction={donate}
          getCampaigns={getCampaigns}
          getCurrentContract={getCurrentContract}
          getEthPrice={getEthPrice}
        />
      )}
    </div>
  );
};

export default VariablePacking; 