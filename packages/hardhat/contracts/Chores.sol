pragma solidity ^0.6.0;
import "./Parents.sol";

/// @title An auction run by parents to incentivize kids to do chores
/// @author bryon b@33ren.com
/// @notice the most basic auction I can think of
/// @dev 

contract Chores is Parents{

    uint256 public auctionCount; 
    uint8 constant public duration = 255;   //all auctions are 255 seconds 
    uint8 constant public priceCurve = 10;  //start at 1/10 the price and grow over the auction duration
    
    mapping (uint => Auction) public auctions;
    
    event AuctionCreated    (string chore, uint256 auctionId, uint256 price, address creator);
    event AuctionBid        (uint256 auctionId, uint256 totalPrice, address winner);
    event ChoreCertified    (uint256 auctionId, uint256 price, address kid, address certifier);
    event AuctionSwept      (uint256 auctionId, uint256 price, address sweeper);


    // Represents a simple auction for chores
    // starts at 0.1*msg.value and runs upwards for constant duration seconds to msg.value
    // kids can bid upto and past duration, but after duration, parents can sweep the money back out. 
    struct Auction {
        string chore;               // the task at hand
        uint256 auctionId;          
        uint256 price;              // Price (in wei) at end of auction (spent to create the auction)
        uint256 bidAmount;          // the price paid to the bidder (kids) will be <= price
        uint256 startedAt;          // Time when auction started // NOTE: 0 if this auction has been concluded
        address payable buyer;      // who bid the auction, will be paid after certifyWork()
        address payable seller;      // who created the auction, will be paid any change after certifyWork()
    }                   
 
    /// @notice constructor sets sane defaults
    /// @dev **TODO - move into args file
    constructor() public {
      auctionCount = 0; 
      parents[msg.sender]=true; 
      parents[address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)]=true; 
    }

    // Fallback function - Called if other functions don't match call or
    // sent ether without data
    // Typically, called when invalid data is sent
    // Added so ether sent to this contract is reverted if the contract fails
    // otherwise, the sender's money is transferred to contract
    fallback() external payable {
        revert("this isn't the correct way to fund this contract");
    }

    /// @notice parents can start an auction
    /// @dev Creates and begins a new auction. price of auction is set to msg.value
    /// @param _chore - The task to be completed for the winner
    function createAuction(string  memory _chore) 
        public payable onlyParents stopInEmergency{
            require (msg.value > 0, "need more value, nobody works for free"); 
            auctions[auctionCount] = Auction({
                chore: _chore, 
                auctionId: auctionCount, 
                price: msg.value,
                bidAmount: 0,
                startedAt: block.timestamp,
                buyer: address(0),
                seller: msg.sender
        });

        emit AuctionCreated(_chore, auctionCount, msg.value, msg.sender);

        auctionCount ++; 
        
    }//ends createAuction()
        
    /// @notice price is calculated at current block 
    /// 
    /// @param _auctionId - the auction in question
    function getCurrentAuctionPrice(uint256 _auctionId) public view returns (uint256){
        require(_auctionId <= auctionCount, "this auction doesn't exist"); 
        //_computeCurrentPrice was shamelessly stolen from cryptokitties
        uint256 currentPrice = _computeCurrentPrice(
            auctions[_auctionId].price/priceCurve, 
            auctions[_auctionId].price, 
            duration, 
            block.timestamp - auctions[_auctionId].startedAt
        );
        
	return currentPrice; 

    }
    /// @notice Kids can bid on some chores to do. Requires a 10% bond. price is calculated at current block 
    /// change is calcualted and returned. 
    /// @param _auctionId - the auction in question
    function bid(uint256 _auctionId) public payable stopInEmergency{
        require(_auctionId <= auctionCount, "this auction doesn't exist"); 
        require(auctions[_auctionId].buyer == address(0), "this auction has already been bid"); 

        //_computeCurrentPrice was shamelessly stolen from cryptokitties
        uint256 currentPrice = _computeCurrentPrice(
            auctions[_auctionId].price/priceCurve, 
            auctions[_auctionId].price, 
            duration, 
            block.timestamp - auctions[_auctionId].startedAt
        );
        
        uint256 bond = currentPrice/10; 
        require(msg.value >= bond, "you didn't send enough to cover your bond (10%)"); 
        
        auctions[_auctionId].buyer = msg.sender; 
        auctions[_auctionId].bidAmount = currentPrice; 
        msg.sender.transfer(msg.value - bond); 
        emit AuctionBid(_auctionId, currentPrice, msg.sender);
        
    }

    /// @dev the parents have to sign off on the [sometimes] shoddy work that kids do 
    /// will transfer bidAmount to the buyer and will return the excess (if any) to the certifier
    /// technically not correct. mom could run off with all of dads extra money, but I'll call it 
    /// an incentive to sign off on chores completed. It kind of doesn't matter. dad was going to pay $20 for the dishes anyways. 
    /// @param _auctionId - the auction in question
    function certifyWork(uint256 _auctionId) public onlyParents stopInEmergency{
        require(_auctionId <= auctionCount, "this auction doesn't exist"); 
        require(auctions[_auctionId].buyer != address(0), "sorry, this auction has not been bid on and there's nothing to certify"); 
        require(auctions[_auctionId].startedAt != 0, "this auction has already been paid/swept"); 
        
        //set the auction status to concluded (startedAt == 0)
        auctions[_auctionId].startedAt = 0; 
        
        // send the buyer her bidded amount + her bond 
        auctions[_auctionId].buyer.transfer(auctions[_auctionId].bidAmount + auctions[_auctionId].bidAmount/10); 
        // and the change back to the original seller
        auctions[_auctionId].seller.transfer(auctions[_auctionId].price - auctions[_auctionId].bidAmount); 
        
        emit ChoreCertified(_auctionId, auctions[_auctionId].bidAmount, auctions[_auctionId].buyer, msg.sender); 
    }

    /// @dev sweeps the money back out of expired chores that nobody did
    /// assumes onlyParents are a #team and share money and don't care if one sweeps vs another
    /// @param _auctionId - the expired auction to sweep. 
    function sweepExpiredAuction(uint256 _auctionId) public onlyParents stopInEmergency{
        require(_auctionId <= auctionCount, "this auction doesn't exist"); 
        require(auctions[_auctionId].startedAt != 0, "already been claimed");
        require(block.timestamp - auctions[_auctionId].startedAt > duration, "you're too early, there's still opportunity for the kids");
        require(auctions[_auctionId].buyer == address(0), "someone else already got (bid/swept) to this one"); 
        
        auctions[_auctionId].buyer = msg.sender; 
        auctions[_auctionId].startedAt = 0; 
        auctions[_auctionId].bidAmount = 0; //not necessary but for completeness? 
        auctions[_auctionId].seller.transfer(auctions[_auctionId].price); //send the original buyer her money back. 
        
        //    event AuctionSwept      (uint256 auctionId, uint256 price, address sweeper);
        emit AuctionSwept(_auctionId, auctions[_auctionId].price, msg.sender); 
    }

/* We have these functions completed so we can run tests, just ignore it :) */
    function fetchAuction(uint _auctionId) public view 
        returns (string memory chore,  uint256 price, uint256 bidAmount, uint256 startedAt, address buyer, address seller) {
        chore = auctions[_auctionId].chore;
        price = auctions[_auctionId].price;
        bidAmount = auctions[_auctionId].bidAmount;
        buyer = auctions[_auctionId].buyer; 
        startedAt = auctions[_auctionId].startedAt; 
        seller = auctions[_auctionId].seller; 
    return (chore, price, bidAmount, startedAt, buyer, seller);
    } 
    
    
    /// @dev shamelessly stolen from the cryptokitties contract 0x06012c8cf97BEaD5deAe237070F9587f8E7A266d
    /// originally was going to be a more complicated auction. leaving here for future extensibility. 
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
       public 
        pure
        returns (uint256)
    {
        // NOTE: We don't use SafeMath (or similar) in this function because
        //  all of our public functions carefully cap the maximum values for
        //  time (at 64-bits) and currency (at 128-bits). _duration is >0 (constant)
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





