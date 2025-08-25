// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFundingOptimized {
    struct Campaign {
        address owner;
        uint64 deadline;
        uint128 target;
        uint128 amountCollected;
        address[] donators;
        uint256[] donations;
        string title;
        string description;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns = 0;

    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint128 _target,
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

        uint128 remaining = campaign.target - campaign.amountCollected;
        uint128 accepted = uint128(msg.value);
        uint128 refund = 0;

        if (accepted > remaining) {
            accepted = remaining;
            refund = uint128(msg.value) - remaining;
        }

        campaign.donators.push(msg.sender);
        campaign.donations.push(accepted);
        campaign.amountCollected += accepted;

        // Kirim ETH ke owner sesuai accepted
        (bool sent, ) = payable(campaign.owner).call{value: accepted}("");
        require(sent, "Failed to send ETH");

        // Refund kelebihan jika ada
        if (refund > 0) {
            (bool refundSent, ) = payable(msg.sender).call{value: refund}("");
            require(refundSent, "Refund failed");
        }
    }

    function batchDonate(uint256[] calldata _ids, uint256[] calldata _amounts) external payable {
        require(_ids.length == _amounts.length, "Array length mismatch");
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            totalAmount += _amounts[i];
        }
        require(msg.value == totalAmount, "Incorrect ETH amount");

        for (uint256 i = 0; i < _ids.length; i++) {
            Campaign storage campaign = campaigns[_ids[i]];
            require(block.timestamp < campaign.deadline, "Campaign expired");
            require(campaign.amountCollected < campaign.target, "Campaign already funded");

            uint128 remaining = campaign.target - campaign.amountCollected;
            uint128 accepted = uint128(_amounts[i]);
            uint128 refund = 0;

            if (accepted > remaining) {
                accepted = remaining;
                refund = uint128(_amounts[i]) - remaining;
            }

            campaign.donators.push(msg.sender);
            campaign.donations.push(accepted);
            campaign.amountCollected += accepted;

            (bool sent, ) = payable(campaign.owner).call{value: accepted}("");
            require(sent, "Failed to send ETH");

            // Refund kelebihan jika ada (langsung ke user)
            if (refund > 0) {
                (bool refundSent, ) = payable(msg.sender).call{value: refund}("");
                require(refundSent, "Refund failed");
            }
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