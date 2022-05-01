import React from 'react'
import { Link, Route, Routes } from 'react-router-dom'

import './App.css'
import WalletInit from './Components/Wallet/WalletInit'

import SomeComponent from './SomeComponent'
const someProp = 'prop'
function App() {
  return (
    <div>
      <div>
        <h1>Navigation</h1>
        <nav
          style={{
            borderBottom: 'solid 1px',
            paddingBottom: '1rem',
          }}>
          <Link to='/'>Wallet</Link>
          <Link to='/somth'>SomthElse</Link>
        </nav>
      </div>
      <Routes>
        <Route path='/' element={<WalletInit />} />
        <Route path='somth' element={<SomeComponent someProp={someProp} />} />
      </Routes>
    </div>
  )
}

export default App
