import React, { useEffect } from 'react'

function SomeComponent({ someProp }) {
  console.log('render')
  useEffect(() => {
    console.log(someProp)
  }, [])

  return <div>Some Other page</div>
}

export default SomeComponent
