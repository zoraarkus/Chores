pragma solidity ^0.6.0;
import "./Parents.sol";

contract Chores is Parents{

    uint256 public auctionCount; 
    uint256 public duration; 
    
    mapping (uint => Auction) public auctions;
    
    event AuctionCreated    (string chore, uint256 auctionId, uint256 price, address creator);
    event AuctionBid        (uint256 auctionId, uint256 totalPrice, address winner);
    event ChoreCertified    (uint256 auctionId, uint256 price, address kid, address certifier);
    event AuctionSwept      (uint256 auctionId, uint256 price, address sweeper);


    // Represents an auction for chores
    // Simplified. starts at 0.1*msg.value and runs upwards for 9600 seconds to msg.value
    struct Auction {
        string chore;               // the task at hand
        uint256 auctionId;          
        uint256 price;              // Price (in wei) at end of auction (spent to create the auction)
        uint256 bidAmount;          // the price paid to the bidder (kids) will be <= price
        uint256 startedAt;          // Time when auction started // NOTE: 0 if this auction has been concluded
        address payable buyer;
    }                   

  constructor() public {
      auctionCount = 0; 
      duration = 200; //in seconds
      parents[msg.sender]=true; 
  }
  
    /// @dev Creates and begins a new auction.
    /// @param _chore - The task to be completed for the winner
    /// @param _price - The the price the parent is willing to pay
    function createAuction(string  memory _chore, uint256 _price) 
        public payable onlyParents {
            require(msg.value >= _price, "send more value you cheap bastard"); 
            auctions[auctionCount] = Auction({
                chore: _chore, 
                auctionId: auctionCount, 
                price: _price,
                bidAmount: 0,
                startedAt: block.timestamp,
                buyer: address(0)
        });

        emit AuctionCreated(_chore, auctionCount, _price, msg.sender);

        auctionCount ++; 
        
    }//ends createAuction()
        
    /// @dev Let's bid on some chores to do. 
    /// @dev assumed that msg.value > currentPrice and will return the difference. 
    /// @param _auctionId - the auction in question
    function bid(uint256 _auctionId) public payable{
        require(auctions[_auctionId].buyer == address(0)); 

        uint256 currentPrice = _computeCurrentPrice(
            auctions[_auctionId].price/10, 
            auctions[_auctionId].price, 
            duration, 
            block.timestamp - auctions[_auctionId].startedAt
        );
        auctions[_auctionId].buyer = msg.sender; 
        auctions[_auctionId].bidAmount = currentPrice; 
        //return the change back to the sender for overbidding. 
        //I dunno if this is vulnerable to reentrancy or not?? TODO: investigate 
        msg.sender.transfer(msg.value - currentPrice); 

        emit AuctionBid(_auctionId, currentPrice, msg.sender);
        
    }

    /// @dev the parents have to sign off on the [sometimes] shoddy work that kids do 
    /// will transfer bidAmount to the buyer and will return the excess (if any) to the certifier
    /// technically not correct. mom could run off with all of dads extra money, but I'll call it 
    /// an incentive to sign off on chores completed. It kind of doesn't matter. dad was going to pay $20 for the dishes anyways. 
    /// @param _auctionId - the auction in question
    function certifyWork(uint256 _auctionId) public onlyParents{
        require(_auctionId <= auctionCount, "sorry, that auction doesn't exist :("); 
        require(auctions[_auctionId].buyer != address(0), "sorry, this auction has not been bid on and there's nothing to certify"); 
        require(auctions[_auctionId].startedAt != 0, "this auction has already been paid/swept"); 
        
        //set the auction status to concluded (startedAt == 0)
        auctions[_auctionId].startedAt = 0; 
        
        // send the buyer her bidded amount and the change back to the certifier
        auctions[_auctionId].buyer.transfer(auctions[_auctionId].bidAmount); 
        msg.sender.transfer(auctions[_auctionId].price - auctions[_auctionId].bidAmount); 
        emit ChoreCertified(_auctionId, auctions[_auctionId].bidAmount, auctions[_auctionId].buyer, msg.sender); 
    }

    /// @dev sweeps the money back out of expired chores that nobody did
    /// assumes onlyParents are a #team and share money and don't care if one sweeps vs another
    /// @param _auctionId - the expired auction to sweep. 
    function sweepExpiredAuction(uint256 _auctionId) public onlyParents {
        require(auctions[_auctionId].startedAt != 0, "already been claimed");
        require(block.timestamp - auctions[_auctionId].startedAt > duration, "you're too early, there's still opportunity for the kids");
        require(auctions[_auctionId].buyer == address(0), "someone else already got (bid/swept) to this one"); 
        
        auctions[_auctionId].buyer = msg.sender; 
        auctions[_auctionId].startedAt = 0; 
        msg.sender.transfer(auctions[_auctionId].price); 
    }

/* We have these functions completed so we can run tests, just ignore it :) */
    function fetchAuction(uint _auctionId) public view 
        returns (string memory chore,  uint256 price, uint256 bidAmount, uint256 startedAt, address buyer) {
        chore = auctions[_auctionId].chore;
        price = auctions[_auctionId].price;
        bidAmount = auctions[_auctionId].bidAmount;
        buyer = auctions[_auctionId].buyer; 
        startedAt = auctions[_auctionId].startedAt; 
    return (chore, price, bidAmount, startedAt, buyer);
    } 
    
    
    /// @dev Computes the current price of an auction. Factored out
    ///  from _currentPrice so we can run extensive unit tests.
    ///  When testing, make this function public and turn on
    ///  `Current price computation` test suite.
    function _computeCurrentPrice(
        uint256 _startingPrice,
        uint256 _endingPrice,
        uint256 _duration,
        uint256 _secondsPassed
    )
        internal
        pure
        returns (uint256)
    {
        // NOTE: We don't use SafeMath (or similar) in this function because
        //  all of our public functions carefully cap the maximum values for
        //  time (at 64-bits) and currency (at 128-bits). _duration is
        //  also known to be non-zero (see the require() statement in
        //  _addAuction())
        if (_secondsPassed >= _duration) {
            // We've reached the end of the dynamic pricing portion
            // of the auction, just return the end price.
            return _endingPrice;
        } else {
            // Starting price can be higher than ending price (and often is!), so
            // this delta can be negative.
            int256 totalPriceChange = int256(_endingPrice) - int256(_startingPrice);

            // This multiplication can't overflow, _secondsPassed will easily fit within
            // 64-bits, and totalPriceChange will easily fit within 128-bits, their product
            // will always fit within 256-bits.
            int256 currentPriceChange = totalPriceChange * int256(_secondsPassed) / int256(_duration);

            // currentPriceChange can be negative, but if so, will have a magnitude
            // less that _startingPrice. Thus, this result will always end up positive.
            int256 currentPrice = int256(_startingPrice) + currentPriceChange;

            return uint256(currentPrice);
        }
    }


}
