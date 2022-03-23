let gasInstance
let eventsInstance

async function init() {
  // works only with live server
  let web3 = new Web3(Web3.givenProvider)

  // Gas_Test contract
  let account
  // Save current MM account into a variable
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  })
  account = accounts[0]

  // Change account variable then MM account changed
  window.ethereum.on('accountsChanged', function (accounts) {
    account = accounts[0]
    console.log(account)
  })

  gasInstance = gasContract(web3, accounts)
  eventsInstance = eventsContract(web3, accounts)
}
