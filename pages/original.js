import React, { useEffect, useContext, useState } from "react";

//INTERNAL IMPORT
import { MultiContractContext } from "../Context/MultiContractContext";
import { Hero, Card, PupUp } from "../Components";
import { getEthPrice } from "../utils/ethPrice";

const Original = () => {
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

  // Set contract type to original (hanya sekali saat mount)
  useEffect(() => {
    switchContract("original");
  }, []);

  // Fetch data hanya jika activeContract sudah benar ATAU campaignsUpdatedFlag berubah
  useEffect(() => {
    if (activeContract === "original") {
      setAllcampaign(undefined);
      setUsercampaign(undefined);
      const fetchData = async () => {
        const allData = await getCampaigns();
        const userData = await getUserCampaigns();
        setAllcampaign(allData);
        setUsercampaign(userData);
      };
      fetchData();
    }
  }, [activeContract, campaignsUpdatedFlag]);

  useEffect(() => {
    fetchEthPrice();
  }, []);

  //DONATE POPUP MODEL
  const [openModel, setOpenModel] = useState(false);
  const [donateCampaign, setDonateCampaign] = useState();

  const fetchEthPrice = async () => {
    try {
      const price = await getEthPrice();
      setEthPrice(price);
    } catch (error) {
      console.error("Error fetching ETH price:", error);
      setEthPrice(2500); // Fallback price
    }
  };

  return (
    <>
      <Hero titleData={titleData} createCampaign={createCampaign} />

      <div className="mt-8">
        {!allcampaign ? (
          <div className="text-center py-8 text-gray-500">Loading campaigns...</div>
        ) : (
          <Card 
            title="All Listed Campaign" 
            allcampaign={allcampaign} 
            setOpenModel={setOpenModel} 
            setDonate={setDonateCampaign} 
          />
        )}
        {!usercampaign ? (
          <div className="text-center py-8 text-gray-400">Loading your campaigns...</div>
        ) : (
          <Card 
            title="Your Created Campaign" 
            allcampaign={usercampaign} 
            setOpenModel={setOpenModel} 
            setDonate={setDonateCampaign} 
          />
        )}
      </div>
      
      {openModel && (
        <PupUp 
          setOpenModel={setOpenModel} 
          getDonations={getDonations} 
          donate={{...donateCampaign, contractVersion: 'original'}} 
          donateFunction={donate}
          getCampaigns={getCampaigns}
          getCurrentContract={getCurrentContract}
          getEthPrice={getEthPrice}
        />
      )}
    </>
  );
};

export default Original; 