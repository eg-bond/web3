import React, { useRef, useState } from 'react'

import { CopyToClipboard } from 'react-copy-to-clipboard'

function SavedAddresses({ savedAddresses, changeAddressName, deleteAddress }) {
  const popupInput = useRef(null)
  const [popup, showPopup] = useState(false)
  const [name, setName] = useState('')

  const payload = useRef({})

  const changeAddressNameHandler = (type, id) => {
    showPopup(true)
    popupInput.current.focus()
    payload.current = { type, id }
  }

  const dispatchAction = () => {
    changeAddressName({ ...payload.current, name })
    showPopup(false)
    setName('')
  }

  const keyDown = key => {
    if (key === 'Enter') {
      dispatchAction()
    }
  }

  return (
    <div className='savedAddresses'>
      <div>Saved Addresses</div>
      <div className='mine'>
        My addresses
        {savedAddresses.my_addresses.map((item, id) => (
          <div key={`my_addresses_${id}`}>
            {item.name}: {item.address}
            <CopyToClipboard text={item.address}>
              <button>Copy</button>
            </CopyToClipboard>
            <button
              onClick={() => changeAddressNameHandler('my_addresses', id)}>
              Change address name
            </button>
            <button onClick={() => deleteAddress('my_addresses', id)}>
              delete
            </button>
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
            <button
              onClick={() => changeAddressNameHandler('my_addresses', id)}>
              Change address name
            </button>
            <button onClick={() => deleteAddress('other_addresses', id)}>
              delete
            </button>
          </div>
        ))}
      </div>

      <div className='popup' style={{ opacity: popup ? '100' : '0' }}>
        <input
          ref={popupInput}
          type='text'
          placeholder='newAddressName'
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => keyDown(e.key)}
        />
        <button disabled={!popup} onClick={dispatchAction}>
          Change name
        </button>
        <button disabled={!popup} onClick={() => showPopup(false)}>
          Exit
        </button>
      </div>
    </div>
  )
}

export default SavedAddresses
