import React from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import WalletInit from './Wallet'
import SomeComponent from './SomeComponent'

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
        <Route path='somth' element={<SomeComponent />} />
      </Routes>
    </div>
  )
}

export default App
