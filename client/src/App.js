import React, { useEffect, useReducer, useState } from 'react'
import './App.css'
import { bep20Abi } from './bep20Abi'
import { createContract, useCurrentAccount, useWeb3 } from './web3Client'

export const tokensReduser = (state, action) => {
  switch (action.type) {
    case 'ADD_TOKEN':
      return {
        ...state,
        [action.symbol]: action.balance,
      }
    case 'DELETE_TOKEN':
      let newState = { ...state }
      delete newState[action.symbol]
      return newState

    default:
      return state
  }
}

function App() {
  let web3 = useWeb3()
  let selectedAccount = useCurrentAccount()
  const [balance, setBalance] = useState(0)

  let balances = JSON.parse(localStorage.getItem('tokens') || {})

  const [tokens, dispatch] = useReducer(tokensReduser, balances)

  useEffect(() => {
    localStorage.setItem('tokens', JSON.stringify(tokens))
  }, [tokens])

  const riseContract = createContract(
    web3,
    bep20Abi,
    '0xC17c30e98541188614dF99239cABD40280810cA3'
  )
  window.rise = riseContract

  const addToken = async address => {
    const tokenContract = createContract(web3, bep20Abi, address)
    const symbol = await tokenContract.methods.symbol().call()

    let balance = await tokenContract.methods.balanceOf(selectedAccount).call()
    balance = web3.utils.fromWei(balance, 'ether')

    dispatch({ type: 'ADD_TOKEN', symbol, balance })
  }

  const getBalance = async () => {
    const balance = await riseContract.methods.balanceOf(selectedAccount).call()
    setBalance(web3.utils.fromWei(balance))
  }

  const [inputValue, changeValue] = useState('')

  // '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c'

  return (
    <div className='App'>
      <div className='accountBar'>{selectedAccount}</div>
      <button onClick={() => getBalance()}>getBalance</button>
      <div>{balance}</div>

      <div className='balances'>
        <input onChange={e => changeValue(e.target.value)} value={inputValue} />
        <button onClick={() => addToken(inputValue)}>addToken</button>
        <div>
          {Object.keys(tokens).map((symbol, i) => (
            <div key={`token${symbol}${i}`}>
              <span>
                {symbol}: {tokens[symbol]}
              </span>
              <button
                onClick={() => dispatch({ type: 'DELETE_TOKEN', symbol })}>
                delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
