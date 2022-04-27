import { useContext, useEffect, useMemo, useReducer } from 'react'
import { erc20Abi } from '../abis/erc20Abi'
import { createContract, getNativeCoinSymbol } from '../web3Client'
import { Web3Context } from '../Web3Provider'
import { createSlice } from '@reduxjs/toolkit'

const emptyState = {
  ethereum: {},
  binance: {},
  polygon: {},
  fantom: {},
  ganache: {},
  nativeCoin: {},
}

const balancesSlice = createSlice({
  name: 'balances',
  initialState: {},
  reducers: {
    userChanged(state, action) {
      state = action.payload
    },
    updateNativeBalance(state, action) {
      const { symbol, balance } = action.payload
      state.nativeCoin = { symbol, balance }
    },
    updateTokenBalances(state, action) {
      return { ...state, ...action.payload }
    },
    addToken(state, action) {
      const { chainName, address, symbol, balance } = action.payload
      state[chainName][address] = { symbol, balance }
    },
    deleteToken(state, action) {
      const { chainName, address } = action.payload
      delete state[chainName][address]
    },
  },
})

const reducer = balancesSlice.reducer
const actions = balancesSlice.actions

export const useBalancesReducer = selectedAccount => {
  const { web3 } = useContext(Web3Context)

  //store
  const [state, dispatch] = useReducer(
    reducer,
    //initial state from LocalStorage
    getBalancesFromLS(selectedAccount)
  )

  // update LocalStorage if state changed
  useEffect(() => {
    localStorage.setItem(selectedAccount, JSON.stringify(state))
  }, [state])
  //--------------------------------------------

  // thunks
  const userChanged = selectedAccount => {
    const newBalances = getBalancesFromLS(selectedAccount)
    dispatch(actions.userChanged(newBalances))
  }

  const updateNativeBalance = async chainName => {
    const balance = await fetchNativeBalance(web3, selectedAccount)
    const symbol = getNativeCoinSymbol(chainName)

    dispatch(actions.updateNativeBalance({ balance, symbol }))
  }

  const updateTokenBalances = async chainName => {
    const balances = await fetchTokenBalances(
      chainName,
      selectedAccount,
      state,
      web3
    )
    dispatch(actions.updateTokenBalances(balances))
  }

  const updateAllBalances = async chainName => {
    await updateNativeBalance(chainName)
    await updateTokenBalances(chainName)
  }

  const addToken = async (address, chainName) => {
    const tokenContract = createContract(web3, erc20Abi, address)
    const symbol = await tokenContract.methods.symbol().call()

    let balance = await tokenContract.methods
      .balanceOf(selectedAccount)
      .call()
      .then(balance => web3.utils.fromWei(balance, 'ether'))

    dispatch(actions.addToken({ symbol, balance, address, chainName }))
  }

  const deleteToken = (address, chainName) => {
    dispatch(actions.deleteToken({ address, chainName }))
  }

  return {
    balances: state,
    userChanged,
    updateAllBalances,
    addToken,
    deleteToken,
    updateNativeBalance,
  }
}

// returns LocalStorage balances combined with emptyState blank
function getBalancesFromLS(account) {
  const LSdata = JSON.parse(localStorage.getItem(account) || '{}')
  return { ...emptyState, ...LSdata }
}

// fetches native coin balance of current chain
async function fetchNativeBalance(web3, address) {
  const balance = await web3.eth.getBalance(address)
  return web3.utils.fromWei(balance)
}

// fetches all balances for added tokens of current chain
async function fetchTokenBalances(
  currentChainName,
  selectedAccount,
  state,
  web3
) {
  if (noCoinsAdded(currentChainName, state)) {
    return
  }

  // make a copy of state and delete nativeCoin field
  const newState = JSON.parse(JSON.stringify(state))
  delete newState.nativeCoin

  const addBalance = (address, balance) => {
    newState[currentChainName][address].balance = balance
  }

  // promises array with fetch requests
  let fetchRequests = []

  Object.keys(state[currentChainName]).forEach(address => {
    const tokenContract = createContract(web3, erc20Abi, address)

    let fetchTokenBalance = tokenContract.methods
      .balanceOf(selectedAccount)
      .call()
      // normalize balance
      .then(balance => web3.utils.fromWei(balance, 'ether'))
      // add balance to newState
      .then(normalizedBalance => addBalance(address, normalizedBalance))

    fetchRequests.push(fetchTokenBalance)
  })

  // waiting for all fetch requests to complete
  await Promise.all(fetchRequests)

  return newState
}

function noCoinsAdded(chainName, state) {
  if (Object.keys(state[chainName]).length === 0) {
    return true
  }
  return false
}
