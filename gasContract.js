function gasContract(web3, accounts) {
  // Create an instance of gas contract
  let gasInstance = new web3.eth.Contract(
    gas_abi,
    '0x9c0e83775412955cadBb34A157f2443dAdaB8B0F',
    { from: accounts[0] }
  )

  return gasInstance
}
