export const tokensReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_ALL_BALANCES':
      return { ...action.newBalances }
    case 'ADD_TOKEN':
      let newState1 = JSON.parse(JSON.stringify(state))
      if (newState1[action.chainName]) {
        newState1[action.chainName][action.address] = {
          symbol: action.symbol,
          balance: action.balance,
        }
      } else {
        newState1[action.chainName] = {}
        newState1[action.chainName][action.address] = {
          symbol: action.symbol,
          balance: action.balance,
        }
      }
      return newState1

    case 'DELETE_TOKEN':
      let newState = { ...state }
      delete newState[action.chainName][action.address]
      return newState

    case 'UPDATE_BALANCE':
      let newState2 = JSON.parse(JSON.stringify(state))
      newState2[action.chainName][action.address].balance = action.balance
      return newState2

    default:
      return state
  }
}
