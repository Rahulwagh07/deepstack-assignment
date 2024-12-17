// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./ReverseAuction.sol";

contract ReverseAuctionFactory {
    mapping(address => address[]) public creatorAuctions;
    address[] public allAuctions;

    event AuctionCreated(
        address indexed auctionAddress,
        address indexed creator,
        string name,
        uint256 maxBid,
        uint256 numberOfWinners
    );

    function createReverseAuction(
        string memory _name,
        uint256 _maxBid,
        uint256 _numberOfWinners,
        uint256 _duration
    ) external payable returns (address) {
        require(bytes(_name).length > 0, "Auction name cannot be empty");
        require(
            _numberOfWinners > 0,
            "Number of winners must be greater than zero"
        );
        require(_maxBid > 0, "Max bid amount must be greater than zero");
        require(_duration > 0, "Auction duration must be greater than zero");

        uint256 requiredLockedFunds = _maxBid * _numberOfWinners;
        require(msg.value >= requiredLockedFunds, "Insufficient funds locked");

        ReverseAuction newAuction = new ReverseAuction(
            msg.sender,
            _name,
            _maxBid,
            _numberOfWinners,
            _duration
        );

        (bool success, ) = address(newAuction).call{value: requiredLockedFunds}(
            ""
        );
        require(success, "Failed to lock funds in auction");

        creatorAuctions[msg.sender].push(address(newAuction));
        allAuctions.push(address(newAuction));

        emit AuctionCreated(
            address(newAuction),
            msg.sender,
            _name,
            _maxBid,
            _numberOfWinners
        );

        return address(newAuction);
    }

    function getCreatorAuctions(
        address _creator
    ) external view returns (address[] memory) {
        return creatorAuctions[_creator];
    }

    function getAllAuctions() external view returns (address[] memory) {
        return allAuctions;
    }
}
