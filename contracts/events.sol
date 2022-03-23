pragma solidity ^0.8.7;

contract Events{ 

    uint someId = 0;

    event Incremented(uint increment, string message, address sender);    
    // The index parameter allows us to filter the event logs by these parameters in the future
    event IncrementedIndexed(uint indexed increment, string message, address sender);

    function increaseId() external {
        someId += 1;
        emit Incremented(someId, 'Id was incremented', msg.sender);        
        emit IncrementedIndexed(someId, 'Id was incremented', msg.sender);        
    }   
    
}