// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFundingVariablePacking {
    struct Campaign {
        address owner;              // 20 bytes
        uint64 target;             // 8 bytes
        uint64 amountCollected;    // 8 bytes
        uint64 deadline;           // 8 bytes
        address[] donators;         // dynamic
        uint256[] donations;        // dynamic
        string title;               // dynamic
        string description;         // dynamic
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns = 0;

    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint64 _target,
        uint64 _deadline
    ) public returns (uint256) {
        Campaign storage campaign = campaigns[numberOfCampaigns];
        campaign.owner = _owner;
        campaign.target = _target;
        campaign.amountCollected = 0;
        campaign.deadline = _deadline;
        campaign.title = _title;
        campaign.description = _description;
        numberOfCampaigns++;
        return numberOfCampaigns - 1;
    }

    function donateToCampaign(uint256 _id) public payable {
        Campaign storage campaign = campaigns[_id];
        campaign.donators.push(msg.sender);
        campaign.donations.push(msg.value);
        campaign.amountCollected += uint64(msg.value);
        (bool sent, ) = payable(campaign.owner).call{value: msg.value}("");
        if(sent) {
            campaign.amountCollected = campaign.amountCollected; // sama seperti original, tidak revert jika gagal
        }
    }

    function getDonators(uint256 _id) public view returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);
        for (uint256 i = 0; i < numberOfCampaigns; i++) {
            allCampaigns[i] = campaigns[i];
        }
        return allCampaigns;
    }
}