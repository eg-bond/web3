import React, { createContext } from 'react'
import { useCurrentAccount, useWeb3 } from './web3Client'

export const Web3Context = createContext()

export const Web3Provider = ({ children }) => {
  const web3 = useWeb3()
  let selectedAccount = useCurrentAccount()

  return (
    <Web3Context.Provider value={{ web3, selectedAccount }}>
      {children}
    </Web3Context.Provider>
  )
}

export default Web3Provider
