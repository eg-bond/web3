import { useEffect, useMemo, useReducer } from 'react'

export const addressesReducer = (state, action) => {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...action.accounts }
    case 'ADD_ADDRESS':
      return { ...state, [action.name]: action.address }

    default:
      return state
  }
}

export const useAddressesReducer = () => {
  const initialState = useMemo(
    () => JSON.parse(localStorage.getItem('my_accounts') || '{}'),
    []
  )
  const [state, dispatch] = useReducer(addressesReducer, initialState)

  // Sync with LocalStorage when state is changed
  useEffect(() => {
    localStorage['my_accounts'] = JSON.stringify({ ...state })
  }, [state])

  const addAddress = address => {
    const accountsList = Object.values(state)
    if (accountsList.includes(address)) {
      return
    }

    const name = `my_account_${accountsList.length + 1}`
    dispatch({ type: 'ADD_ADDRESS', name, address })
  }

  return { accounts: state, addAddress }
}
