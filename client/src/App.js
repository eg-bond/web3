import React from 'react'
import { Link } from 'react-router-dom'

function App() {
  return (
    <div>
      <h1>Bookkeeper</h1>
      <nav
        style={{
          borderBottom: 'solid 1px',
          paddingBottom: '1rem',
        }}>
        <Link to='/wallet'>Wallet</Link> | <Link to='/somth'>Expenses</Link>
      </nav>
    </div>
  )
}

export default App
