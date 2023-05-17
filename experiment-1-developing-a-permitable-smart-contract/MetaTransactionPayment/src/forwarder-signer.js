const ethers = require("ethers")
const { signTypedData, TypedDataUtils } = require("@metamask/eth-sig-util")
const { bufferToHex, privateToAddress, toBuffer } = require('ethereumjs-util')
const { createInstance: createMetacoinInstance } = require("./modules/MetacoinWithPermit")
const { createInstance: createExtendedForwarderInstance } = require("./modules/ExtendedForwarder")
const {config} = require("./config")
const { relayerAccount } = require("./provider")

const EXTENDED_FORWARDER_ADDRESS = config.EXTENDED_FORWARDER_CONTRACT
const EIP712Domain = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' }
];

const ForwardRequestType = [
  { name: 'from', type: 'address' },
  { name: 'to', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'gas', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'data', type: 'bytes' }
]

const GENERIC_PARAMS = 'address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data'

const DomainForward = {
    name: 'Extended Forwarder',
    version: '1',
    chainId: 1,
    verifyingContract: EXTENDED_FORWARDER_ADDRESS
}

const createForwarderTypedDataObject = function (message) {

  const typeData = {
    types: {
      EIP712Domain: EIP712Domain,
      ForwardRequest: ForwardRequestType
    },
    primaryType: "ForwardRequest",
    domain: DomainForward,
    message: message,
  }
  const typedDataJsoned = JSON.stringify(typeData);

  return {
    typedData: typeData,
  };
};

let to;
let data;
let value;
let from;
let nonce;
let gas;



const signatureGenerator = (typeData, account) => {
    console.log(typeData)
    const result = signTypedData({
        privateKey: Buffer.from(account.privateKey.replace(/^0x/, ''), 'hex'),
        data: typeData,
        version: "V4"
    })
    console.log(result)
    const signature = result.substring(2);
    const r = "0x" + signature.substring(0, 64);
    const s = "0x" + signature.substring(64, 128);
    const v = parseInt(signature.substring(128, 130), 16);
  
    return { v, r, s, sig: result};
};


// function to sign a permit meta transaction with the core signer.
const signForwardMeta = async (signer, account, message, relayerSigner) => {

    // const permitFunctionSignature = web3.utils.keccak256("permit(address,address, uint256, uint256, uint8, bytes32, byte32)")

    // let fnParamsPermit = web3.eth.abi.encodeParameters(
    //     ['address', 'address', 'uint256', 'uint256', 'uint8', 'byte32', 'byte32'],
       
    // );
    const typeName = `ForwardRequest(${GENERIC_PARAMS})`
    const typeHash = ethers.utils.id(typeName)
    const signerAddress = await signer.getAddress()
    console.log(relayerSigner.provider)
    let extendedForwaderInstance = createExtendedForwarderInstance(relayerSigner.provider)
    nonce = await extendedForwaderInstance.getNonce(signerAddress)
    let fwd = extendedForwaderInstance.connect(relayerSigner)
    console.log(nonce)
    to =  message.to
    from = signerAddress
    data = message.data
    value = 0
    gas = message.gas
    // value = ethers.utils.parseUnits(message.value.toString(), 18)
    let requestObject = {
         to,
         data,
         from, 
         value,
         nonce: nonce.toString(),
         gas
    }
    
     let typeDataObject = createForwarderTypedDataObject(requestObject)

    let sigs = signatureGenerator(typeDataObject.typedData, account)
    let relayerSig = signatureGenerator(typeDataObject.typedData, relayerAccount)
    console.log("FORWARDER SIGNATURE", sigs.sig)
    // v = sigs.v
    // r = sigs.r
    // s = sigs.s


    // let extendedForwaderInstance = createExtendedForwarderInstance(signer.provider)
    // create domain
    const domainSeparator = TypedDataUtils.hashStruct("EIP712Domain", typeDataObject.typedData.domain, typeDataObject.typedData.types, "V4")
        // console.log(requestObject)
    // const args = [
    //     requestObject,
    //     bufferToHex(domainSeparator),
    //     typeHash,
    //     '0x',
    //     sigs.sig
    // ]
    
    const args = {
        req: requestObject,
        domainSeparator: bufferToHex(domainSeparator),
        typeHash: typeHash,
        suffix: '0x',
        signature: sigs.sig
    }

    console.log(args)
    
    let verifyResponse = await fwd.verify(args.req, args.domainSeparator, args.typeHash, args.suffix, args.signature)
    console.log("VERIFYED RESPONSE")

    let response = await fwd.execute(args.req, args.domainSeparator, args.typeHash, args.suffix, args.signature)
    console.log("EXECUTED", response)

    let result = await response.wait()
    console.log("MINED:", result)
    // const params = [owner, spender, value, deadline, v, r, s]
    // console.log("GENERATED PARAMS", params)
    // let encodedData = extendedForwaderInstance.interface.encodeFunctionData("permit", params )

    // data = permitFunctionSignature + fnParamsPermit.substr(2); // we need the signed owner v r and s
    // console.log(encodedData)
    // return encodedData
}



module.exports = {
    signForwardMeta
}