const ethers = require("ethers")
const {config} = require("../config")
const address = config.EXTENDED_FORWARDER_CONTRACT
const abi =  [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "typeHash",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "typeStr",
          "type": "string"
        }
      ],
      "name": "RequestTypeRegistered",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "GENERIC_PARAMS",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "typeHashes",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "stateMutability": "payable",
      "type": "receive",
      "payable": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        }
      ],
      "name": "getNonce",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "gas",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "nonce",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            }
          ],
          "internalType": "struct ExtendedForwarder.ForwardRequest",
          "name": "req",
          "type": "tuple"
        },
        {
          "internalType": "bytes32",
          "name": "domainSeparator",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "requestTypeHash",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "suffixData",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "sig",
          "type": "bytes"
        }
      ],
      "name": "verify",
      "outputs": [],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "gas",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "nonce",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            }
          ],
          "internalType": "struct ExtendedForwarder.ForwardRequest",
          "name": "req",
          "type": "tuple"
        },
        {
          "internalType": "bytes32",
          "name": "domainSeparator",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "requestTypeHash",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "suffixData",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "sig",
          "type": "bytes"
        }
      ],
      "name": "execute",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        },
        {
          "internalType": "bytes",
          "name": "ret",
          "type": "bytes"
        }
      ],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "typeName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "typeSuffix",
          "type": "string"
        }
      ],
      "name": "registerRequestType",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "gas",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "nonce",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            }
          ],
          "internalType": "struct ExtendedForwarder.ForwardRequest",
          "name": "req",
          "type": "tuple"
        },
        {
          "internalType": "bytes32",
          "name": "requestTypeHash",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "suffixData",
          "type": "bytes"
        }
      ],
      "name": "_getEncoded",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "stateMutability": "pure",
      "type": "function",
      "constant": true
    }
  ];

function createInstance(provider) {
  return new ethers.Contract(address, abi, provider);
}

module.exports = {
    createInstance
}
