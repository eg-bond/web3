pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SomeCoin is ERC20 {
  constructor() ERC20("SomeCoin", "SMC") {
    _mint(msg.sender, 55000000000000000000000);    
  }
}
