import React, { useRef, useState } from 'react'
import { createContract, getNativeCoinSymbol } from '../../web3Client'
import { erc20Abi } from '../../abis/erc20Abi'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import SavedAddresses from '../SavedAddresses/SavedAddresses'

function Wallet({
  web3,
  selectedAccount,
  currentChainName,
  handleNetworkSwitch,
  addToken,
  balances,
  deleteToken,
  addOtherAddress,
  savedAddresses,
  changeAddressName,
  deleteAddress,
}) {
  const [sendingWindow, showSendingWindow] = useState(false)
  const [tokenAddressToSend, setAddress] = useState('')
  const [symbolToSend, setSymbol] = useState('')

  const handleTransferWindow = (symbol = '', address = 'native') => {
    if (address === 'native') {
      setAddress('native')
      setSymbol(getNativeCoinSymbol(currentChainName))
    } else {
      setAddress(address)
      setSymbol(symbol)
    }
    showSendingWindow(true)
  }

  const getAddressName = () => {
    const addressItem = savedAddresses.my_addresses.filter(
      item => item.address === selectedAccount
    )
    return addressItem[0].name
  }
  return (
    <div className='App'>
      <SwitchChain
        handleNetworkSwitch={handleNetworkSwitch}
        currentChainName={currentChainName}
      />
      <div className='accountBar'>
        {getAddressName()}: {selectedAccount}
      </div>
      <Balances
        balances={balances}
        currentChainName={currentChainName}
        addToken={addToken}
        deleteToken={deleteToken}
        handleTransferWindow={handleTransferWindow}
      />
      {sendingWindow && (
        <TransferFunds
          web3={web3}
          selectedAccount={selectedAccount}
          savedAddresses={savedAddresses}
          tokenAddressToSend={tokenAddressToSend}
          symbolToSend={symbolToSend}
          showSendingWindow={showSendingWindow}
          addOtherAddress={addOtherAddress}
        />
      )}
      <SavedAddresses
        savedAddresses={savedAddresses}
        changeAddressName={changeAddressName}
        deleteAddress={deleteAddress}
      />
    </div>
  )
}

function SwitchChain({ currentChainName, handleNetworkSwitch }) {
  return (
    <div className='chain'>
      <div className='chainName'>{currentChainName}</div>
      <button onClick={() => handleNetworkSwitch('ethereum')}>
        Switch to Ethereum
      </button>
      <button onClick={() => handleNetworkSwitch('polygon')}>
        Switch to Polygon
      </button>
      <button onClick={() => handleNetworkSwitch('binance')}>
        Switch to BSC
      </button>
      <button onClick={() => handleNetworkSwitch('fantom')}>
        Switch to Fantom
      </button>
    </div>
  )
}

function Balances({
  balances,
  currentChainName,
  addToken,
  deleteToken,
  handleTransferWindow,
}) {
  const [inputValue, changeValue] = useState('')

  return (
    <div className='balances'>
      <div className='nativeBalance'>
        <span>{balances.nativeCoin.symbol}: </span>
        <span>{balances.nativeCoin.balance} </span>
        <button onClick={() => handleTransferWindow()}>Send</button>
      </div>

      <div className='tokenBalances'>
        {Object.keys(balances[currentChainName] || {}).map(address => (
          <div key={address}>
            <span>
              {balances[currentChainName][address].symbol}:{' '}
              {balances[currentChainName][address].balance}
            </span>
            <button onClick={() => deleteToken(address, currentChainName)}>
              delete
            </button>
            <button
              onClick={() =>
                handleTransferWindow(
                  balances[currentChainName][address].symbol,
                  address
                )
              }>
              send
            </button>
          </div>
        ))}
      </div>
      <input onChange={e => changeValue(e.target.value)} value={inputValue} />
      <button onClick={() => addToken(inputValue, currentChainName)}>
        addToken
      </button>
      {/* <button onClick={() => getEvents()}>getEvents</button> */}
    </div>
  )
}

function TransferFunds({
  web3,
  selectedAccount,
  savedAddresses,
  tokenAddressToSend,
  symbolToSend,
  showSendingWindow,
  addOtherAddress,
}) {
  const [addressToSend, changeAddress] = useState('')
  const [amountToSend, changeAmount] = useState('')
  const [saveAddressCheckbox, switchCheckbox] = useState(false)
  const [addressName, setName] = useState('')
  const addressNameRef = useRef(null)

  const transfer = ({
    type = 'native',
    tokenAddressToSend,
    addressToSend,
    amountToSend,
  }) => {
    let contract
    const value = web3.utils.toWei(amountToSend, 'ether')

    if (type === 'token') {
      contract = createContract(web3, erc20Abi, tokenAddressToSend)
    }

    switch (type) {
      case 'native':
        web3.eth.sendTransaction({
          from: selectedAccount,
          to: addressToSend,
          value,
        })
        break
      case 'token':
        contract.methods
          .transfer(addressToSend, value)
          .send({ from: selectedAccount })
        break
      default:
        throw new Error(`Unknown transfer type: "${type}"`)
    }
  }

  const handleCheckbox = () => {
    switchCheckbox(!saveAddressCheckbox)
    if (!saveAddressCheckbox) {
      addressNameRef.current.focus()
    }
  }

  const handleTransfer = ({
    type = 'native',
    tokenAddressToSend,
    addressToSend,
    amountToSend,
  }) => {
    transfer({
      type,
      tokenAddressToSend,
      addressToSend,
      amountToSend,
    })
    addOtherAddress({ address: addressToSend, name: addressName })
    setName('')
    showSendingWindow(false)
  }

  return (
    <div className='transferFunds'>
      <div>Sending {symbolToSend}</div>
      <div>
        <input
          onChange={e => changeAddress(e.target.value)}
          value={addressToSend}
          placeholder={'Address to send'}
        />
        <input
          onChange={e => changeAmount(e.target.value)}
          value={amountToSend}
          placeholder={'Amount to send'}
        />
        {tokenAddressToSend === 'native' ? (
          <button
            onClick={() => handleTransfer({ addressToSend, amountToSend })}>
            send {symbolToSend}
          </button>
        ) : (
          <button
            onClick={() =>
              handleTransfer({
                type: 'token',
                tokenAddressToSend,
                addressToSend,
                amountToSend,
              })
            }>
            send {symbolToSend}
          </button>
        )}
        <button onClick={() => showSendingWindow(false)}>Close window</button>
      </div>
      <div>
        saveAddress
        <input
          type='checkbox'
          checked={saveAddressCheckbox}
          onChange={() => handleCheckbox(!saveAddressCheckbox)}
        />
        <input
          ref={addressNameRef}
          type='text'
          placeholder='AddressName'
          value={addressName}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div className='savedAddresses'>
        <div className='mine'>
          My addresses
          {savedAddresses.my_addresses.map((item, id) => (
            <div key={`my_addresses_${id}`}>
              {item.name}: {item.address}
              <CopyToClipboard text={item.address}>
                <button>Copy</button>
              </CopyToClipboard>
            </div>
          ))}
        </div>
        <div className='other'>
          Other addresses
          {savedAddresses.other_addresses.map((item, id) => (
            <div key={`my_addresses_${id}`}>
              {item.name}: {item.address}
              <CopyToClipboard text={item.address}>
                <button>Copy</button>
              </CopyToClipboard>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Wallet

// subscribe to transfer events for added tokens

// const subscribeToTransfers = () => {
//   if (tokens[currentChainName]) {
//     Object.keys(tokens[currentChainName]).map(address => {
//       // console.log(address)
//       if (!selectedAccount) {
//         console.log('not subscribed')
//         return
//       }
//       const tokenContract = createContract(web3, erc20Abi, address)
//       tokenContract.events.Transfer(
//         {
//           filter: {
//             from: [selectedAccount],
//           },
//         },
//         () => {
//           console.log('balance updated')
//           updateTokenBalance(tokenContract)
//         }
//       )
//       tokenContract.events.Transfer(
//         {
//           filter: {
//             to: [selectedAccount],
//           },
//         },
//         () => {
//           console.log('balance updated')
//           updateTokenBalance(tokenContract)
//         }
//       )
//     })
//   }
// }

// useEffect(() => {
//   subscribeToTransfers()

//   return () => {
//     // console.log('unsub')
//     web3.eth.clearSubscriptions()
//   }
// }, [tokens, currentChainName])

//----------------------------------------------
