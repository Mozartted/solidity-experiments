const ethSigUtil = require('eth-sig-util');
const { TypedDataUtils } = require('eth-sig-util');
const { bufferToHex } = require('ethereumjs-util');

const MetaCoinContractAddress = process.env.METACOIN_CONTRACT
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
        name: "deadline",
        type: "uint256",
    }
]



const DomainDataMetaCoin = {
    name: "MetaCoinWithPermit",
    version: "1",
    chainId: 1337,
    verifyingContract: MetaCoinContractAddress
}

const ForwarderDomain = {
        name: 'Defender',
        version: '1',
        chainId: 4,
        verifyingContract: ForwarderAddress
    }
const ForwardRequest = [
  { name: 'from', type: 'address' },
  { name: 'to', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'gas', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'data', type: 'bytes' },
];

const createMetaCoinPermitMessageData = function () {

  const typeData = {
    types: {
      EIP712Domain: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "version",
          type: "string",
        },
        {
          name: "chainId",
          type: "uint256",
        },
        {
          name: "verifyingContract",
          type: "address",
        },
      ],
      Permit: MetaCoinPermitType
    },
    primaryType: "Permit",
    domain: DomainDataMetaCoin,
    message: message,
  }
  const typedDataJsoned = JSON.stringify(typeData);

  return {
    typedData: typeData,
  };
};

const createForwardRequestCall = function () {
    const TypedData = {
        domain: ForwarderDomain,
        primaryType: 'ForwardRequest',
        types: {
            EIP712Domain: EIP712DomainType,
            ForwardRequest: ForwardRequest
        },
        message: {}
    };
}

function getMetaTxTypeData(chainId, verifyingContract) {
    let {typedData} = createMetaCoinPermitMessageData()
    typedData.domain.chainId = chainId
    typedData.domain.verifyingContract = verifyingContract
    return typedData
};

async function signTypedData(signer, from, data) {
  // If signer is a private key, use it to sign
  if (typeof(signer) === 'string') {
    const privateKey = Buffer.from(signer.replace(/^0x/, ''), 'hex');
    return ethSigUtil.signTypedMessage(privateKey, { data });
  }

  // Otherwise, send the signTypedData RPC call
  // Note that hardhatvm and metamask require different EIP712 input
  const isHardhat = data.domain.chainId == 31337;
  const [method, argData] = isHardhat
    ? ['eth_signTypedData', data]
    : ['eth_signTypedData_v4', JSON.stringify(data)]
  return await signer.send(method, [from, argData]);
}

async function buildRequest(forwarder, input) {
  const nonce = await forwarder.getNonce(input.from).then(nonce => nonce.toString());
  return { value: 0, gas: 1e6, nonce, ...input };
}

async function buildTypedData(forwarder, request) {
  const chainId = await forwarder.provider.getNetwork().then(n => n.chainId);
  const typeData = getMetaTxTypeData(chainId, forwarder.address);
  return { ...typeData, message: request };
}

async function signMetaTxRequest(signer, forwarder, input) {
  const request = await buildRequest(forwarder, input);
  const toSign = await buildTypedData(forwarder, request);
  const signature = await signTypedData(signer, input.from, toSign);
  return { signature, request };
}

const signData = async function (provider, signerAccount, typeData) {
    const result = await provider.send("eth_signTypedData_v4", [signerAccount, typeData]);
    console.log(result)
  
    const r = result.result.slice(0, 66);
    const s = "0x" + result.result.slice(66, 130);
    const v = Number("0x" + result.result.slice(130, 132));
    
    return { v, r, s };
};

module.exports = { 
  signMetaTxRequest,
  buildRequest,
  buildTypedData,
};