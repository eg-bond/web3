export const events_abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'increment',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'message',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'Incremented',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'increment',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'message',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'IncrementedIndexed',
    type: 'event',
  },
  {
    inputs: [],
    name: 'increaseId',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]
