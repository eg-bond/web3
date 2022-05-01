import React, { useEffect } from 'react'
import { useBalancesReducer } from '../../store/balancesReducer'
import { useAddressesReducer } from '../../store/addressesReducer'
import Wallet from './Wallet'

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
  const {
    savedAddresses,
    addMyAddress,
    addOtherAddress,
    changeAddressName,
    deleteAddress,
  } = useAddressesReducer()

  // fetch for native coin balance of current account if chain changed
  useEffect(() => {
    updateAllBalances(currentChainName)
  }, [currentChainName])

  // fetch for native coin balance of current account if MM account changed
  useEffect(() => {
    addMyAddress(selectedAccount)
    userChanged(selectedAccount)
    updateAllBalances(currentChainName)
  }, [selectedAccount])

  return (
    <Wallet
      web3={web3}
      selectedAccount={selectedAccount}
      currentChainName={currentChainName}
      handleNetworkSwitch={handleNetworkSwitch}
      addToken={addToken}
      balances={balances}
      deleteToken={deleteToken}
      updateAllBalances={updateAllBalances}
      savedAddresses={savedAddresses}
      changeAddressName={changeAddressName}
      deleteAddress={deleteAddress}
      addOtherAddress={addOtherAddress}
    />
  )
}

export default WalletStorage
// export default React.memo(WalletStorage)
