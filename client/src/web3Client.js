import { useState, useEffect, useMemo } from 'react'
import Web3 from 'web3'
import { bep20Abi } from './bep20Abi'

// return web3 instance
export const useWeb3 = () => {
  const web3 = useMemo(() => new Web3(Web3.givenProvider), [])
  return web3
}

// return current Metamask account
export const useCurrentAccount = () => {
  let [currentAccount, setAccount] = useState(0)

  useEffect(() => {
    // get current MM account
    window.ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(accounts => {
        setAccount(accounts[0])
      })
      .catch(err => {
        console.log(err)
        return
      })

    // subscribe to the MM account changing
    window.ethereum.on('accountsChanged', function (accounts) {
      setAccount(accounts[0])
    })
  }, [])

  return currentAccount
}

// export const useNetworkId = async web3 => {
//   const networkId = await web3.eth.net.getId()
//   return networkId
// }

// '0xC17c30e98541188614dF99239cABD40280810cA3'

export const createContract = (web3, abi, contractAddress) => {
  console.log('contract created by usual')
  return new web3.eth.Contract(abi, contractAddress)
}

export const useContract = (web3, abi, contractAddress) => {
  const contract = useMemo(
    () => new web3.eth.Contract(abi, contractAddress),
    []
  )
  return contract
}

// // Subscribe to EventName event
// function subscribe(EventName) {
//   eventsInstance.events[EventName]()
//     // Fires once after the subscription successfully connected. Returns the subscription id
//     .on('connected', Id => console.log(Id))
//     // Fires on each incoming event with the event object as argument
//     .on('data', event => console.log(event))
//     // Fires when an error in the subscription occurs
//     .on('error', err => console.log(err))
// }
