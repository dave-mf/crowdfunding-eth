// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFunding {
    struct Campaign {
        address owner;
        uint64 deadline;
        uint128 target;
        uint128 amountCollected;
        string title;
        string description;
        address[] donators;
        uint256[] donations;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns = 0;

    event CampaignCreated(uint256 indexed id, address indexed owner, string title);
    event DonationMade(uint256 indexed id, address donor, uint256 amount);
    event BatchDonations(uint256[] ids, address donor, uint256[] amounts);

    function batchDonate(uint256[] calldata _ids, uint256[] calldata _amounts) external payable {
        require(_ids.length == _amounts.length, "Array length mismatch");
        uint256 totalAmount = 0;
        address sender = msg.sender; // cache sender
        for (uint256 i = 0; i < _amounts.length; i++) {
            totalAmount += _amounts[i];
        }
        require(msg.value == totalAmount, "Incorrect ETH amount");

        for (uint256 i = 0; i < _ids.length; i++) {
            _donateToCampaign(_ids[i], _amounts[i], sender);
        }

        emit BatchDonations(_ids, sender, _amounts);
    }

    function _donateToCampaign(uint256 _id, uint256 _amount, address sender) internal {
        require(_id < numberOfCampaigns, "Invalid campaign ID");
        require(_amount > 0, "Amount must be > 0");

        Campaign storage campaign = campaigns[_id];
        require(block.timestamp < campaign.deadline, "Campaign ended"); // PENTING: validasi deadline

        campaign.donators.push(sender);
        campaign.donations.push(_amount);
        campaign.amountCollected += uint128(_amount);

        (bool sent, ) = payable(campaign.owner).call{value: _amount}("");
        require(sent, "Failed to send ETH");

        emit DonationMade(_id, sender, _amount);
    }

    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint128 _target,
        uint64 _deadline
    ) public returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in the future");

        Campaign storage campaign = campaigns[numberOfCampaigns];
        campaign.owner = _owner;
        campaign.deadline = _deadline;
        campaign.target = _target;
        campaign.amountCollected = 0;
        campaign.title = _title;
        campaign.description = _description;

        uint256 newId = numberOfCampaigns;
        numberOfCampaigns++;

        emit CampaignCreated(newId, _owner, _title);
        return newId;
    }

    function donateToCampaign(uint256 _id) public payable {
        _donateToCampaign(_id, msg.value, msg.sender);
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