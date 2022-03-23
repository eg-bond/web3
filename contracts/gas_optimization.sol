pragma solidity ^0.8.7;

contract Gas_Test{
    uint[] public arrayFunds;
    uint public totalFunds;

    constructor() {
        arrayFunds = [1,2,3,4,5,6,7,8,9,10,11,12,13];
    }

    function unsafe_inc(uint x) private pure returns (uint) {
        unchecked { return x + 1; }
    }

    // The most expensive one, read and write to blockchain in every iteration
    function optionA() external {
        for (uint i =0; i < arrayFunds.length; i++){
            totalFunds = totalFunds + arrayFunds[i];
        }
    }
    
    // consumes less gas via writing the result of each iteration to memory variable
    // and changing the state variable only once
    function optionB() external {
        uint _totalFunds;
        for (uint i =0; i < arrayFunds.length; i++){
            _totalFunds = _totalFunds + arrayFunds[i];
        }
        totalFunds = _totalFunds;
    }

    // The best solution, clones arrayFunds to memory and reads from it 
    function optionC() external {
        uint _totalFunds;
        uint[] memory _arrayFunds = arrayFunds;
        for (uint i =0; i < _arrayFunds.length; i++){
            _totalFunds = _totalFunds + _arrayFunds[i];
        }
        totalFunds = _totalFunds;
    }

    // Saves a little bit more gas than optionC using unsafe_inc
    function optionD() external {
        uint _totalFunds;
        uint[] memory _arrayFunds = arrayFunds;
        for (uint i =0; i < _arrayFunds.length; i = unsafe_inc(i)){
            _totalFunds = _totalFunds + _arrayFunds[i];
        }
        totalFunds = _totalFunds;
    }
    
}