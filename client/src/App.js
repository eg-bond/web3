import React, { useEffect, useReducer, useState } from 'react'
import './App.css'
import { bep20Abi } from './bep20Abi'
import { erc20Abi } from './erc20Abi'
import eventsContractBuild from 'truffleBuild/contracts/Events.json'
import coinContractBuild from 'truffleBuild/contracts/SomeCoin.json'
import {
  createContract,
  useContract,
  useCurrentAccount,
  useWeb3,
} from './web3Client'

export const tokensReduser = (state, action) => {
  switch (action.type) {
    case 'ADD_TOKEN':
      return {
        ...state,
        [action.address]: { symbol: action.symbol, balance: action.balance },
      }
    case 'DELETE_TOKEN':
      let newState = { ...state }
      delete newState[action.address]
      return newState
    case 'UPDATE_BALANCE':
      debugger
      return {
        ...state,
        [action.address]: { ...state[action.address], balance: action.balance },
      }

    default:
      return state
  }
}

function App() {
  let web3 = useWeb3()
  let selectedAccount = useCurrentAccount()

  // useEffect(() => {
  //   eventsContract(web3)
  // }, [])

  // native coin balance
  const [balance, setBalance] = useState(0)

  // getting native coin balance
  const getBalance = async () => {
    if (!!selectedAccount) {
      const balance = await web3.eth.getBalance(selectedAccount)
      setBalance(web3.utils.fromWei(balance))
    }
  }

  // initial token balances to show
  let balances = JSON.parse(localStorage.getItem('tokens') || '{}')

  const [tokens, dispatch] = useReducer(tokensReduser, balances)

  // fetch for native coin balance of current account if MM account changed
  useEffect(() => {
    getBalance()
  }, [selectedAccount])

  // update LS if tokens state changed
  useEffect(() => {
    localStorage.setItem('tokens', JSON.stringify(tokens))
  }, [tokens])

  // const networkId = useNetworkId(web3)
  // console.log(networkId)

  const eventsContract = useContract(
    web3,
    eventsContractBuild.abi,
    eventsContractBuild.networks['5777'].address
  )

  const SomeCoinContract = useContract(
    web3,
    coinContractBuild.abi,
    coinContractBuild.networks['5777'].address
  )

  const riseContract = useContract(
    web3,
    bep20Abi,
    '0xC17c30e98541188614dF99239cABD40280810cA3'
  )
  const riseContractV2 = useContract(
    web3,
    bep20Abi,
    '0x0cD022ddE27169b20895e0e2B2B8A33B25e63579'
  )

  const nbuContract = useContract(
    web3,
    erc20Abi,
    '0xEB58343b36C7528F23CAAe63a150240241310049'
  )

  const getEvents = () => {
    nbuContract
      .getPastEvents('Transfer', {
        filter: { to: ['0x0fc00d2771762196a6ba66ec768764d2201afc08'] },
        fromBlock: 'earliest',
        toBlock: 'latest',
      })
      .then(console.log)
  }

  // eventsContract.events.IncrementedIndexed((err, event) => console.log(event))

  window.web3 = web3
  window.rise = riseContract
  window.eventsC = eventsContract

  // SomeCoin contract address
  // 0xEbA9c9Ab25b51CC6ADF6ce7D79bfCc89Ea6fE38D

  const addToken = async address => {
    const tokenContract = createContract(web3, bep20Abi, address)
    const symbol = await tokenContract.methods.symbol().call()

    let balance = await tokenContract.methods.balanceOf(selectedAccount).call()
    balance = web3.utils.fromWei(balance, 'ether')

    dispatch({ type: 'ADD_TOKEN', symbol, balance, address })
  }

  useEffect(() => {
    Object.keys(tokens).map(address => {
      const tokenContract = createContract(web3, erc20Abi, address)
      tokenContract.events.Transfer(
        {
          filter: {
            from: ['0x6923175AFD91cDaC22dD3E0F1253C8b04eDAD75F'],
          },
        },
        () => {
          console.log('balance updated')
          updateTokenBalance(tokenContract)
        }
      )
      // tokenContract.events.Transfer(
      //   {
      //     filter: {
      //       to: [selectedAccount],
      //     },
      //   },
      //   () => {
      //     console.log('balance updated')
      //     updateTokenBalance(tokenContract)
      //   }
      // )
    })

    return () => {
      // unsubscribe
    }
  }, [])
  console.log(selectedAccount)
  const updateTokenBalance = async contract => {
    // debugger
    let balance = await contract.methods
      .balanceOf('0x6923175AFD91cDaC22dD3E0F1253C8b04eDAD75F')
      .call()
    let address = contract._address
    balance = web3.utils.fromWei(balance, 'ether')

    dispatch({
      type: 'UPDATE_BALANCE',
      balance,
      address,
    })
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
          {Object.keys(tokens).map(address => (
            <div key={address}>
              <span>
                {tokens[address].symbol}: {tokens[address].balance}
              </span>
              <button
                onClick={() => dispatch({ type: 'DELETE_TOKEN', address })}>
                delete
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => getEvents()}>getEvents</button>
      </div>
    </div>
  )
}

export default App
