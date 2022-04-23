import { useEffect, useState } from 'react'
import { networks } from '../helpers/networks'
import { chains } from '../web3Client'

const changeNetwork = async ({ networkName }) => {
  try {
    if (!window.ethereum) throw new Error('No crypto wallet found')
    if (networkName == 'ethereum') {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${Number(1).toString(16)}` }],
      })
    } else {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{ ...networks[networkName] }],
      })
    }
  } catch (err) {
    console.log(err)
  }
}

export const useNetworkSwitch = web3 => {
  const [currentChainName, changeChainName] = useState('')

  const handleNetworkSwitch = async networkName => {
    await changeNetwork({ networkName })
    changeChainName(networkName)
  }

  const onNetworkChanged = chainId => {
    const id = web3.utils.hexToNumber(chainId)
    changeChainName(chains[id])
  }

  useEffect(() => {
    web3.eth.getChainId().then(id => changeChainName(chains[id]))
    window.ethereum.on('chainChanged', onNetworkChanged)

    return () => {
      window.ethereum.removeListener('chainChanged', onNetworkChanged)
    }
  }, [])

  return [currentChainName, handleNetworkSwitch]
}
