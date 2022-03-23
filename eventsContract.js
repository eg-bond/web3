function eventsContract(web3, accounts) {
  // Create an instance of events contract
  let eventsInstance = new web3.eth.Contract(
    events_abi,
    '0x804AB316621a64836c8C4259B0c7a3B968E50A87',
    { from: accounts[0] }
  )

  // Subscribe to EventName event
  function subscribe(EventName) {
    eventsInstance.events[EventName]()
      // Fires once after the subscription successfully connected. Returns the subscription id
      .on('connected', Id => console.log(Id))
      // Fires on each incoming event with the event object as argument
      .on('data', event => console.log(event))
      // Fires when an error in the subscription occours
      .on('error', err => console.log(err))
  }

  // We can also subscribe to all contract events through .allEvents function
  function subscribeToAll() {
    eventsInstance.events
      .allEvents()
      .on('connected', Id => console.log(Id))
      .on('data', event => console.log(event))
      .on('error', err => console.log(err))
  }
  //-------------------------------------------------

  subscribe('Incremented')
  subscribe('IncrementedIndexed')

  // Getting logs of Incremented event.
  // filter property won't work, because increment here is't indexed
  // so this function will just return all event logs from block '0'
  eventsInstance
    .getPastEvents('Incremented', {
      filter: { increment: [4, 5, 6] },
      fromBlock: 0,
      toBlock: 'latest',
    })
    .then(console.log)

  // Here there only be returned the event logs with increment 4, 5 and 6 (if these increments exists).
  eventsInstance
    .getPastEvents('IncrementedIndexed', {
      filter: { increment: [4, 5, 6] },
      fromBlock: 0,
      toBlock: 'latest',
    })
    .then(console.log)

  return eventsInstance
}
