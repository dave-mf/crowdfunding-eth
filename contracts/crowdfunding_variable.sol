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

    event DonationReceived(uint256 indexed campaignId, address indexed donator, uint256 amount);
    event Refund(address indexed donator, uint256 amount);

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
        require(block.timestamp < campaign.deadline, "Campaign expired");
        require(msg.value > 0, "No ETH sent");
        require(campaign.amountCollected < campaign.target, "Campaign already funded");

        uint64 remaining = campaign.target - campaign.amountCollected;
        uint64 accepted = uint64(msg.value);
        uint64 refund = 0;

        if (accepted > remaining) {
            accepted = remaining;
            refund = uint64(msg.value) - remaining;
        }

        campaign.donators.push(msg.sender);
        campaign.donations.push(accepted);
        campaign.amountCollected += accepted;

        // Transfer accepted amount to owner
        (bool sent, ) = payable(campaign.owner).call{value: accepted}("");
        require(sent, "Failed to send ETH");

        // Refund excess if any
        if (refund > 0) {
            (bool refundSent, ) = payable(msg.sender).call{value: refund}("");
            require(refundSent, "Refund failed");
            emit Refund(msg.sender, refund);
        }

        emit DonationReceived(_id, msg.sender, accepted);
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