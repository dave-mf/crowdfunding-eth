// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFundingBatchOnly {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        address[] donators;
        uint256[] donations;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns = 0;

    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline
    ) public returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in the future");

        Campaign storage campaign = campaigns[numberOfCampaigns];

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;

        numberOfCampaigns++;
        return numberOfCampaigns - 1;
    }

    // 🔁 Fungsi donate satuan (tetap disediakan untuk perbandingan)
    function donateToCampaign(uint256 _id) public payable {
        uint256 amount = msg.value;
        Campaign storage campaign = campaigns[_id];

        require(block.timestamp < campaign.deadline, "Campaign ended");

        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);

        (bool sent, ) = payable(campaign.owner).call{value: amount}("");
        if (sent) {
            campaign.amountCollected += amount;
        }
    }

    // 🆕 Fungsi donate batch
    function donateBatch(uint256[] memory _ids, uint256[] memory _amounts) public payable {
        require(_ids.length == _amounts.length, "Array length mismatch");

        uint256 total;
        for (uint256 i = 0; i < _amounts.length; i++) {
            total += _amounts[i];
        }

        require(msg.value == total, "Incorrect total ETH sent");

        for (uint256 i = 0; i < _ids.length; i++) {
            Campaign storage campaign = campaigns[_ids[i]];
            require(block.timestamp < campaign.deadline, "Campaign ended");

            campaign.donators.push(msg.sender);
            campaign.donations.push(_amounts[i]);

            (bool sent, ) = payable(campaign.owner).call{value: _amounts[i]}("");
            if (sent) {
                campaign.amountCollected += _amounts[i];
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
