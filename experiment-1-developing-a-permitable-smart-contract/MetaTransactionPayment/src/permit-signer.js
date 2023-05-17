const ethers = require("ethers")
const web3 = require("web3")
// const { signTypedData, signTypedData_v4 } = require("@metamask/eth-sig-util")
const { signTypedData_v4 } = require("eth-sig-util")
const { createInstance: createMetacoinInstance } = require("./modules/MetacoinWithPermit")
const config = require("./config")
const { signERC2612Permit } = require('eth-permit')
const { signData } = require('eth-permit/dist/rpc')
const { TypedDataUtils } = require('ethers-eip712')


const getDomainSeparator = ({name, version, chainId, verifyingContract}) => {
  return  ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(name)),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(version)),
        chainId,
        verifyingContract
      ]
    )
  )
}


const MetaCoinContractAddress = config.config.METACOIN_CONTRACT
const EIP712Domain = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' }
];

const MetaCoinPermitType = [
    {
        name: "owner",
        type: "address",
    },
    {
        name: "spender",
        type: "address",
    },
    {
        name: "value",
        type: "uint256",
    },
    {
        name: 'nonce',
        type: 'uint256'
    },
    {
        name: "deadline",
        type: "uint256",
    }
]

const createMetaCoinPermitMessageData = function (data) {

  const messageUpdated = {
    owner: data.owner,
    spender: data.spender,
    value: data.value.toString(),
    nonce: data.nonce.toString(),
    deadline: data.deadline.toString()
  }
  const typeData = {
    types: {
      EIP712Domain: EIP712Domain,
      Permit: MetaCoinPermitType
    },
    primaryType: "Permit",
    domain: {
        name: data.name,
        version: "1",
        chainId: data.chainId,
        verifyingContract: MetaCoinContractAddress
    },
    message: messageUpdated
  }
  // const typedDataJsoned = JSON.stringify(typeData);

  return {
    typedData: typeData,
    message: messageUpdated
  };
};

let owner;
let spender;
let value;
let deadline;
let v;
let r;
let s;


// const signatureGenerator = async (typedData, account) => {
//     console.log(typedData)
//     // const result = await account._signTypedData(typedData.domain, typedData.types, typedData.message)
//     const digest = TypedDataUtils.encodeDigest(typedData)
//     const digestHex = ethers.utils.hexlify(digest)

//     // const sigs = await signData(wallet.provider, owner, typeDataObject.typedData);
//     // const wallet = ethers.Wallet.createRandom()
//     // const signature = wallet.signMessage(digest)
//     // const result = signTypedData_v4( Buffer.from(account.privateKey.replace(/^0x/, ''), 'hex'), {data: typedData})
//     const result = await account.signMessage(digestHex);
//     console.log("SIGNATURE RESULT", result)
//     const signature = result.substring(2)
//     const r = "0x" + signature.substring(0, 64);
//     const s = "0x" + signature.substring(64, 128);
//     const v = parseInt(signature.substring(128, 130), 16);
  
//     return { v, r, s };
// };


const signPermitMeta = async (signer, account, message, data) => {
    const signerAddress = await signer.getAddress()
    owner = signerAddress
    spender = message.spender
    value = message.value
    deadline = message.deadline
    
  let typeDataObject = createMetaCoinPermitMessageData({
    owner,
    spender,
    value,
    deadline,
    nonce: message.nonce,
    ...data
  })
  
    let typedData = typeDataObject.typedData

    const types = typedData.types
    delete types.EIP712Domain // types should not include EIP712Domain (ref: ethers.js issue)
    console.log("TYPES CALLED HER", typedData.message)
      const digest = await signer._signTypedData(typedData.domain, types, typedData.message)
      const sig = ethers.utils.splitSignature(digest)

    return Object.assign({}, sig, typeDataObject.message)
}

const encodeMetaTransactionData = (params, provider) => {
    let metacoinInstance = createMetacoinInstance(provider)
    console.log("GENERATED PARAMS", params)
    let encodedData = metacoinInstance.interface.encodeFunctionData("permit", params )
    // data = permitFunctionSignature + fnParamsPermit.substr(2); // we need the signed owner v r and s
    console.log(encodedData)
    return encodedData
}


module.exports = {
  signPermitMeta,
  encodeMetaTransactionData,
  getDomainSeparator
}