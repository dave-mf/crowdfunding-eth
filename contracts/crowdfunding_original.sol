// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        address[] donators;
        uint256[] donations;
        uint256 dummyCounter;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns = 0;

    event DonationReceived(uint256 indexed campaignId, address indexed donator, uint256 amount);
    event Refund(address indexed donator, uint256 amount);

    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline
    ) public returns (uint256) {
        Campaign storage campaign = campaigns[numberOfCampaigns];

        require(_deadline > block.timestamp, "The deadline should be a date in the future!");

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.dummyCounter = 0;

        numberOfCampaigns++;

        return numberOfCampaigns - 1;
    }

    function donateToCampaign(uint256 _id) public payable {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp < campaign.deadline, "Campaign expired");
        require(msg.value > 0, "No ETH sent");
        require(campaign.amountCollected < campaign.target, "Campaign already funded");

        uint256 remaining = campaign.target - campaign.amountCollected;
        uint256 accepted = msg.value;
        uint256 refund = 0;

        if (accepted > remaining) {
            accepted = remaining;
            refund = msg.value - remaining;
        }

        campaign.donators.push(msg.sender);
        campaign.donations.push(accepted);
        campaign.dummyCounter += 1;

        // Transfer accepted amount to owner
        (bool sent, ) = payable(campaign.owner).call{value: accepted}("");
        require(sent, "Failed to send ETH");

        campaign.amountCollected += accepted;

        // Refund excess if any
        if (refund > 0) {
            (bool refundSent, ) = payable(msg.sender).call{value: refund}("");
            require(refundSent, "Refund failed");
            emit Refund(msg.sender, refund);
        }

        emit DonationReceived(_id, msg.sender, accepted);
    }

    function getDonators(uint256 _id) view public returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for (uint256 i = 0; i < numberOfCampaigns; i++) {
            Campaign storage item = campaigns[i];
            allCampaigns[i] = item;
        }

        return allCampaigns;
    }
}