import React, { useContext, useEffect, useState } from 'react'
import './App.css'
import { createContract } from './web3Client'
import { useNetworkSwitch } from './hooks/useNetworkSwitch'
import { Web3Context } from './Web3Provider'
import { erc20Abi } from './abis/erc20Abi'
import { useBalancesReducer } from './store/balancesReducer'
import { useAddressesReducer } from './store/addressesReducer'

function WalletInit() {
  const { web3, selectedAccount } = useContext(Web3Context)
  const [currentChainName, handleNetworkSwitch] = useNetworkSwitch(web3)

  if (!selectedAccount || !web3 || !currentChainName) {
    return null
  }

  return (
    <WalletStorage
      web3={web3}
      selectedAccount={selectedAccount}
      currentChainName={currentChainName}
      handleNetworkSwitch={handleNetworkSwitch}
    />
  )
}

function WalletStorage({
  web3,
  selectedAccount,
  currentChainName,
  handleNetworkSwitch,
}) {
  // handle added tokens state and its sync with LocalStorage
  const { balances, userChanged, addToken, updateAllBalances, deleteToken } =
    useBalancesReducer(selectedAccount)

  // handle saved accounts state and its sync with LocalStorage
  const { accounts, addAddress } = useAddressesReducer()

  // fetch for native coin balance of current account if chain changed
  useEffect(() => {
    updateAllBalances(currentChainName)
  }, [currentChainName])

  // fetch for native coin balance of current account if MM account changed
  useEffect(() => {
    addAddress(selectedAccount)
    userChanged(selectedAccount)
    updateAllBalances(currentChainName)
  }, [selectedAccount])

  return (
    <App
      web3={web3}
      selectedAccount={selectedAccount}
      currentChainName={currentChainName}
      handleNetworkSwitch={handleNetworkSwitch}
      addToken={addToken}
      balances={balances}
      deleteToken={deleteToken}
      updateAllBalances={updateAllBalances}
    />
  )
}

function App({
  web3,
  selectedAccount,
  currentChainName,
  handleNetworkSwitch,
  addToken,
  balances,
  deleteToken,
  updateAllBalances,
}) {
  // subscribe to transfer events for added tokens

  // const subscribeToTransfers = () => {
  //   if (tokens[currentChainName]) {
  //     Object.keys(tokens[currentChainName]).map(address => {
  //       // console.log(address)
  //       if (!selectedAccount) {
  //         console.log('not subscribed')
  //         return
  //       }
  //       const tokenContract = createContract(web3, erc20Abi, address)
  //       tokenContract.events.Transfer(
  //         {
  //           filter: {
  //             from: [selectedAccount],
  //           },
  //         },
  //         () => {
  //           console.log('balance updated')
  //           updateTokenBalance(tokenContract)
  //         }
  //       )
  //       tokenContract.events.Transfer(
  //         {
  //           filter: {
  //             to: [selectedAccount],
  //           },
  //         },
  //         () => {
  //           console.log('balance updated')
  //           updateTokenBalance(tokenContract)
  //         }
  //       )
  //     })
  //   }
  // }

  // useEffect(() => {
  //   subscribeToTransfers()

  //   return () => {
  //     // console.log('unsub')
  //     web3.eth.clearSubscriptions()
  //   }
  // }, [tokens, currentChainName])

  //----------------------------------------------

  window.web3 = web3
  const [inputValue, changeValue] = useState('')
  const [addressToSend, changeAddress] = useState('')
  const [amountToSend, changeAmount] = useState('')

  const transfer = ({ type = 'native', addressToSend, amountToSend }) => {
    let contract
    const value = web3.utils.toWei(amountToSend, 'ether')

    if (type === 'token') {
      contract = createContract(
        web3,
        erc20Abi,
        '0xEbA9c9Ab25b51CC6ADF6ce7D79bfCc89Ea6fE38D'
      )
    }

    switch (type) {
      case 'native':
        web3.eth.sendTransaction({
          from: selectedAccount,
          to: addressToSend,
          value,
        })
        break
      case 'token':
        contract.methods
          .transfer(addressToSend, value)
          .send({ from: selectedAccount })
        break
      default:
        throw new Error(`Unknown transfer type: "${type}"`)
    }
  }

  return (
    <div className='App'>
      <div className='chain'>
        <div className='chainName'>{currentChainName}</div>
        <button onClick={() => handleNetworkSwitch('ethereum')}>
          Switch to Ethereum
        </button>
        <button onClick={() => handleNetworkSwitch('polygon')}>
          Switch to Polygon
        </button>
        <button onClick={() => handleNetworkSwitch('binance')}>
          Switch to BSC
        </button>
        <button onClick={() => handleNetworkSwitch('fantom')}>
          Switch to Fantom
        </button>
      </div>
      <div className='accountBar'>{selectedAccount}</div>
      <div>
        <span>{balances.nativeCoin.symbol}: </span>
        <span>{balances.nativeCoin.balance} </span>
      </div>

      <div className='balances'>
        <div>
          {Object.keys(balances[currentChainName] || {}).map(address => (
            <div key={address}>
              <span>
                {balances[currentChainName][address].symbol}:{' '}
                {balances[currentChainName][address].balance}
              </span>
              <button onClick={() => deleteToken(address, currentChainName)}>
                delete
              </button>
            </div>
          ))}
        </div>
        <input onChange={e => changeValue(e.target.value)} value={inputValue} />
        <button onClick={() => addToken(inputValue, currentChainName)}>
          addToken
        </button>
        {/* <button onClick={() => getEvents()}>getEvents</button> */}
      </div>
      <input
        onChange={e => changeAddress(e.target.value)}
        value={addressToSend}
        placeholder={'address'}
      />
      <input
        onChange={e => changeAmount(e.target.value)}
        value={amountToSend}
        placeholder={'amount'}
      />
      <button
        onClick={() =>
          transfer({ type: 'token', addressToSend, amountToSend })
        }>
        sendTokens
      </button>
      <button onClick={() => transfer({ addressToSend, amountToSend })}>
        sendNative
      </button>
      <button onClick={() => updateAllBalances(balances)}>
        updateAllBalances
      </button>
    </div>
  )
}

export default WalletInit
