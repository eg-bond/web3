import React, { useContext } from 'react'
import { useNetworkSwitch } from '../../hooks/useNetworkSwitch'
import { Web3Context } from '../../Web3Provider'
import WalletStorage from './WalletStorage'

function WalletInit() {
  const { web3, selectedAccount } = useContext(Web3Context)
  const [currentChainName, handleNetworkSwitch] = useNetworkSwitch(web3)
  window.web3 = web3
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

export default WalletInit
