import { createSlice } from '@reduxjs/toolkit'
import { useEffect, useReducer } from 'react'

const emptyState = {
  my_addresses: [],
  other_addresses: [],
  resent_addresses: [],
}

const savedAddressesSlice = createSlice({
  name: 'saved_addresses',
  initialState: {},
  reducers: {
    // initialize(state, action) {
    //   state = action.payload
    // },
    addMyAddress(state, action) {
      const { name, address } = action.payload
      state.my_addresses.push({ name, address })
    },
    addOtherAddress(state, action) {
      const { name, address } = action.payload
      state.other_addresses.push({ name, address })
    },
    deleteAddress(state, action) {
      const { category, id } = action.payload
      state[category].splice(id, 1)
    },
    changeAddressName(state, action) {
      const { type, id, name } = action.payload
      state[type][id].name = name
    },
  },
})

const reducer = savedAddressesSlice.reducer
const actions = savedAddressesSlice.actions

export const useAddressesReducer = () => {
  // store
  const [state, dispatch] = useReducer(reducer, getSavedAddressesFromLS())

  // Sync with LocalStorage when state is changed
  useEffect(() => {
    localStorage['my_addresses'] = JSON.stringify(state.my_addresses)
    localStorage['other_addresses'] = JSON.stringify(state.other_addresses)
    // localStorage['my_accounts'] = JSON.stringify({ ...state })
  }, [state])

  const addMyAddress = address => {
    const accountsList = state.my_addresses.map(item => item.address)
    if (accountsList.includes(address)) {
      return
    }
    const name = `my_address_${accountsList.length + 1}`

    dispatch(actions.addMyAddress({ name, address }))
  }

  const addOtherAddress = ({ address, name = '' }) => {
    const accountsList = Object.values(state.other_addresses)
    if (accountsList.includes(address)) {
      return
    }

    dispatch(actions.addOtherAddress({ name, address }))
  }

  const deleteAddress = (category, id) => {
    dispatch(actions.deleteAddress({ category, id }))
  }

  const changeAddressName = ({ type, id, name }) => {
    dispatch(actions.changeAddressName({ type, id, name }))
  }

  return {
    savedAddresses: state,
    addMyAddress,
    addOtherAddress,
    changeAddressName,
    deleteAddress,
  }
}

function getSavedAddressesFromLS() {
  const my_addresses = JSON.parse(localStorage.getItem('my_addresses') || '[]')
  const other_addresses = JSON.parse(
    localStorage.getItem('other_addresses') || '[]'
  )
  return { my_addresses, other_addresses }
}
