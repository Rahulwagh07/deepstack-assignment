// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract ReverseAuction {
    enum AuctionState {
        ACTIVE,
        COMPLETED,
        CANCELLED
    }

    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
    }

    string public auctionName;
    address public auctionCreator;
    uint256 public maxBidAmount;
    uint256 public numberOfWinners;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public lockedFunds;
    AuctionState public currentState;

    Bid[] public bids;
    mapping(address => uint256) public bidderToIndex;
    mapping(address => bool) public hasBidded;

    Bid[] public winningBids;
    mapping(address => bool) public isWinner;

    event BidPlaced(address indexed bidder, uint256 amount, uint256 timestamp);
    event BidUpdated(
        address indexed bidder,
        uint256 oldAmount,
        uint256 newAmount
    );
    event AuctionStateChanged(AuctionState newState);
    event WinnersDeclared(Bid[] winners);
    event FundsDistributed(uint256 rewardPerWinner);

    error AuctionNotActive();
    error InvalidBidAmount();
    error BidAlreadyPlaced();
    error AuctionNotEnded();
    error NoWinnersToDistribute();

    modifier onlyCreator() {
        require(msg.sender == auctionCreator, "Only auction creator allowed");
        _;
    }

    modifier onlyDuringAuction() {
        if (
            block.timestamp < startTime ||
            block.timestamp > endTime ||
            currentState != AuctionState.ACTIVE
        ) {
            revert AuctionNotActive();
        }
        _;
    }

    constructor(
        address _creator,
        string memory _name,
        uint256 _maxBid,
        uint256 _numberOfWinners,
        uint256 _duration
    ) {
        auctionCreator = _creator;
        auctionName = _name;
        maxBidAmount = _maxBid;
        numberOfWinners = _numberOfWinners;
        startTime = block.timestamp;
        endTime = block.timestamp + _duration;
        lockedFunds = _maxBid * _numberOfWinners;
        currentState = AuctionState.ACTIVE;
    }

    function placeBid(uint256 bidAmount) external onlyDuringAuction {
        require(bidAmount <= maxBidAmount, "Bid exceeds max bid amount");

        if (hasBidded[msg.sender]) {
            uint256 bidIndex = bidderToIndex[msg.sender];
            Bid storage existingBid = bids[bidIndex];

            require(
                bidAmount < existingBid.amount,
                "New bid must be lower than existing bid"
            );

            emit BidUpdated(msg.sender, existingBid.amount, bidAmount);

            existingBid.amount = bidAmount;
            existingBid.timestamp = block.timestamp;
        } else {
            bids.push(
                Bid({
                    bidder: msg.sender,
                    amount: bidAmount,
                    timestamp: block.timestamp
                })
            );

            bidderToIndex[msg.sender] = bids.length - 1;
            hasBidded[msg.sender] = true;
        }

        emit BidPlaced(msg.sender, bidAmount, block.timestamp);
    }

    function declareWinners() external onlyCreator {
        currentState = AuctionState.COMPLETED;
        emit AuctionStateChanged(AuctionState.COMPLETED);

        if (bids.length == 0) {
            currentState = AuctionState.CANCELLED;
            payable(auctionCreator).transfer(address(this).balance);
            return;
        }

        _quickSelectWinners();
        _distributeFunds();

        emit WinnersDeclared(winningBids);
    }

    function _quickSelectWinners() internal {
        Bid[] memory bidsCopy = new Bid[](bids.length);
        for (uint256 i = 0; i < bids.length; i++) {
            bidsCopy[i] = bids[i];
        }

        uint256 actualWinnerCount = numberOfWinners <= bids.length
            ? numberOfWinners
            : bids.length;

        for (uint256 i = 0; i < actualWinnerCount; i++) {
            uint256 minIndex = i;
            for (uint256 j = i + 1; j < bidsCopy.length; j++) {
                if (bidsCopy[j].amount < bidsCopy[minIndex].amount) {
                    minIndex = j;
                }
            }

            Bid memory temp = bidsCopy[i];
            bidsCopy[i] = bidsCopy[minIndex];
            bidsCopy[minIndex] = temp;
            winningBids.push(bidsCopy[i]);
            isWinner[bidsCopy[i].bidder] = true;
        }
    }

    function _distributeFunds() internal {
        if (currentState != AuctionState.COMPLETED || winningBids.length == 0) {
            revert NoWinnersToDistribute();
        }
        require(
            address(this).balance >= lockedFunds,
            "Insufficient balance for distribution"
        );

        uint256 rewardAmount = winningBids[winningBids.length - 1].amount;

        for (uint256 i = 0; i < winningBids.length; i++) {
            payable(winningBids[i].bidder).transfer(rewardAmount);
        }

        emit FundsDistributed(rewardAmount);

        if (address(this).balance > 0) {
            payable(auctionCreator).transfer(address(this).balance);
        }
    }

    function getWinners() internal view returns (Bid[] memory) {
        return winningBids;
    }

    function getBids() internal view returns (Bid[] memory) {
        return bids;
    }

    function getAuctionDetails()
        external
        view
        returns (
            string memory name,
            address creator,
            uint256 maxBid,
            uint256 winnersCount,
            uint256 auctionStartTime,
            uint256 auctionEndTime,
            uint256 auctionLockedFunds,
            AuctionState auctionCurrentState,
            Bid[] memory winners,
            Bid[] memory allBids
        )
    {
        return (
            auctionName,
            auctionCreator,
            maxBidAmount,
            numberOfWinners,
            startTime,
            endTime,
            lockedFunds,
            currentState,
            winningBids,
            bids
        );
    }

    receive() external payable {}
}
