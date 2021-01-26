Design Patterns and Decisions

In the spirit of good design patterns, I've extensively used require() statements. 

Chores.sol extends Parents.sol extends CircuitBreaker.sol

Chores.sol is keeps track of the Auctions and mechanics. Parents can start and certify auctions, while kids can bid of them. 
    - I didn't use the withdrawl pattern, instead on certification(), it will send the money to whomever bid and completed the chore, whilst sending the remaining balance (if any) back to the parent who created it. 

Parents.sol is a ripoff of Ownable.sol from the lessons. Capable of adding/removing parents, pausing the contract, or rugPulling. 

CircuitBreaker.sol enables/disables functionality in case of an emergency. **TODO** make Chores -> upgradable. 
