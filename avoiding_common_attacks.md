Avoiding common Attacks: 

Re-entracy Attacks (SWC-107)
    - in the 2 functions that pay ether, i've set the state before paying to prevent re-entrancy attacks. 

Transaction Ordering and Timestamp Dependence (SWC-114)
    - although my contracts a dependant on block.timestamp, it's not necessarily an issue since my kids don't run mining farms and can manipulate block.timestamp to their advantage. 

Integer Overflow and Underflow (SWC-101)
    - I've deliberately NOT included SafeMath.sol as I've stollen the relevant price calculation code from the CryptoKitties contract. I'm trusting that they've dont their due-dilligence. 

Denial of Service by Block Gas Limit or startGas (SWC-128)
    - I'm not looping over arrays of undefined size (or anything really). I'm thinking that my contracts have a fixed gas usage??

Denial of Service with Failed Call (SWC-113)
    - pretty sure I'm not susceptible here, but when the audit comes back, we'll know for sure :) 

Denial of Service (generally) 
    - I've forced kids who would like ot bid() on chores, to post a 10% refundable bond to keep them from breaking my contract. 




