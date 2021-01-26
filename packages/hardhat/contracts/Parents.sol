pragma solidity >=0.6.7 <0.7.0;
import "./CircuitBreaker.sol";

/**
 * @title Parents
 * @dev The Parents contract has an parents' addresses, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Parents is CircuitBreaker {

    event AddParent     (address newParent, address initiator);
    event RevokeParent  (address revokedParent, address initiator);
    event AuctionPaused (address initiator, bool pausedState);
    event RugPull       (address initiator);

    mapping(address=> bool) public parents; 

  /**
   * @dev The Parents constructor sets the original `parent/owner` of the contract to the sender
   * account.
   */
  constructor() public{
    parents[msg.sender] = true;
  }
  
  /**
   * @dev Throws if called by any account other than one of the parents.
   */
  modifier onlyParents() {
    require(parents[msg.sender], "you're not listening, you need to be a parent");
    _;
  }

  /**
   * @dev Allows any parent to add additional parents. because 21st century. 
   * @param newParent adding more parents
   */
  function addParent(address newParent) public onlyParents {
    require(newParent!= address(0), "don't give 0X0 ownership. c'mon man!"); 
    require(newParent != msg.sender, "you're already here. what are you doing"); 
    
    parents[newParent] = true; 
    emit AddParent (newParent, msg.sender); 
  }

  /**
   * @dev Allows any owner to revoke someone else
   * @param revoked The address to remove parenthood priviliges from the contract.
   */
  function revokeParenthood(address revoked) public onlyParents {
    require (revoked != address(0), "not allowed to revoke the 0x0 address fool");
    require (revoked != msg.sender, "you can't revoke yourself."); 
    require (parents[revoked], "wtf? this parent has already been revoked, or doesn't exist"); 
      parents[revoked] = false; 
    emit RevokeParent (revoked, msg.sender); 
  }
  
    /**
   * @dev Allows any Parent to pause the contract 
   */
  function togglePauseContract() public onlyParents {
      stopped = ! stopped; 
      emit AuctionPaused (msg.sender, stopped);
  }
    /**
   * @dev Allows any Parent to pause the contract 
   */
  function pauseContract() public onlyParents {
      stopped = true; 
      emit AuctionPaused (msg.sender, stopped);
  }
  
    /**
   * @dev Allows any Parent to rug pull if the contract is stopped. 
   */
  function rugPull() public onlyParents onlyInEmergency{
        selfdestruct(msg.sender);
        emit RugPull(msg.sender); 
  }
}
