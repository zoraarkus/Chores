pragma solidity >=0.6.7 <0.7.0;

/**
 * @title CircuitBreaker
 * @dev The CircuitBreaker is a simple pause button for payable functions in Chores.sol
 */
contract CircuitBreaker {

    bool public stopped = false;

    modifier stopInEmergency { require(!stopped, 
            "Sorry, something has gone horribly wrong and this contract is paused"); _; }
    modifier onlyInEmergency { require(stopped, 
            "Sorry, you are only able to call this function when this contract is paused"); _; }

}
