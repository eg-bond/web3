import React, { useContext, useEffect, useReducer, useState } from 'react'
import './App.css'
import { bep20Abi } from './abis/bep20Abi'
import { createContract } from './web3Client'
import { useNetworkSwitch } from './hooks/useNetworkSwitch'
import { Web3Context } from './Web3Provider'
import { erc20Abi } from './abis/erc20Abi'
import { tokensReducer } from './store/tokensReducer'

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
  // initial token balances to show
  let initialState = JSON.parse(localStorage.getItem(selectedAccount) || '{}')
  //store
  const [tokens, dispatch] = useReducer(tokensReducer, initialState)

  // native coin balance
  const [balance, setBalance] = useState(0)

  // getting native coin balance
  const getNativeBalance = async () => {
    const balance = await web3.eth.getBalance(selectedAccount)
    setBalance(web3.utils.fromWei(balance))
  }

  const fetchTokenBalances = async newBalances => {
    if (!newBalances[currentChainName]) {
      dispatch({ type: 'UPDATE_ALL_BALANCES', newBalances })
      return
    }
    if (Object.keys(newBalances[currentChainName]).length == 0) {
      dispatch({ type: 'UPDATE_ALL_BALANCES', newBalances })
      return
    }
    let balances = { ...newBalances }
    let callbackArr = []
    let originalBalancesArr = []

    Object.keys(balances[currentChainName]).forEach(address => {
      const tokenContract = createContract(web3, erc20Abi, address)
      let callback = tokenContract.methods
        .balanceOf(selectedAccount)
        .call()
        .then(balance => web3.utils.fromWei(balance, 'ether'))
      callbackArr.push(callback)
      originalBalancesArr.push([
        balances[currentChainName][address].balance,
        address,
      ])
    })

    const fetchedBalances = await Promise.all(callbackArr)
    fetchedBalances.forEach((balance, i) => {
      if (balance !== originalBalancesArr[i][0]) {
        const address = originalBalancesArr[i][1]
        balances[currentChainName][address].balance = balance
      }
    })
    dispatch({ type: 'UPDATE_ALL_BALANCES', newBalances: balances })
  }

  // fetch for native coin balance of current account if chain changed
  useEffect(() => {
    getNativeBalance()
    fetchTokenBalances(tokens)
  }, [currentChainName])

  // fetch for native coin balance of current account if MM account changed
  useEffect(() => {
    getNativeBalance()
    let newBalances = JSON.parse(localStorage.getItem(selectedAccount) || '{}')
    fetchTokenBalances(newBalances)
  }, [selectedAccount])

  // update LS if tokens state changed
  useEffect(() => {
    localStorage.setItem(selectedAccount, JSON.stringify(tokens))
  }, [tokens])

  const addToken = async address => {
    const tokenContract = createContract(web3, bep20Abi, address)
    const symbol = await tokenContract.methods.symbol().call()

    let balance = await tokenContract.methods.balanceOf(selectedAccount).call()
    balance = web3.utils.fromWei(balance, 'ether')

    dispatch({
      type: 'ADD_TOKEN',
      symbol,
      balance,
      address,
      chainName: currentChainName,
    })
  }

  // const updateTokenBalance = async contract => {
  //   let balance = await contract.methods.balanceOf(selectedAccount).call()
  //   let address = contract._address
  //   balance = web3.utils.fromWei(balance, 'ether')

  //   dispatch({
  //     type: 'UPDATE_BALANCE',
  //     balance,
  //     address,
  //     chainName: currentChainName,
  //   })
  // }

  return (
    <App
      web3={web3}
      selectedAccount={selectedAccount}
      currentChainName={currentChainName}
      handleNetworkSwitch={handleNetworkSwitch}
      addToken={addToken}
      balance={balance}
      getNativeBalance={getNativeBalance}
      tokens={tokens}
      dispatch={dispatch}
      updateAllBalances={fetchTokenBalances}
    />
  )
}

function App({
  web3,
  selectedAccount,
  currentChainName,
  handleNetworkSwitch,
  addToken,
  balance,
  getBalance,
  tokens,
  dispatch,
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
      <button onClick={() => getBalance()}>getBalance</button>
      <div>{balance}</div>

      <div className='balances'>
        <input onChange={e => changeValue(e.target.value)} value={inputValue} />
        <button onClick={() => addToken(inputValue)}>addToken</button>
        <div>
          {Object.keys(tokens[currentChainName] || {}).map(address => (
            <div key={address}>
              <span>
                {tokens[currentChainName][address].symbol}:{' '}
                {tokens[currentChainName][address].balance}
              </span>
              <button
                onClick={() =>
                  dispatch({
                    type: 'DELETE_TOKEN',
                    address,
                    chainName: currentChainName,
                  })
                }>
                delete
              </button>
            </div>
          ))}
        </div>
        {/* <button onClick={() => getEvents()}>getEvents</button> */}
      </div>
      <button onClick={() => updateAllBalances(tokens)}>
        updateAllBalances
      </button>
    </div>
  )
}

export default WalletInit
