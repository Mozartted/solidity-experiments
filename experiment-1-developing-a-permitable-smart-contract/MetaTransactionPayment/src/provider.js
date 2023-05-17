const ethers = require("ethers")
const web3 = require("web3")
const {config} = require("./config")

// console.log(config)
const host = `http://${config.GANACHE_LOCAL_HOST}:${config.GANACHE_LOCAL_PORT}`
// const web3Provider = new web3.providers.HttpProvider(host)
// const provider = new ethers.providers.Web3Provider(web3Provider)
const provider =new ethers.providers.JsonRpcProvider(host)

console.log(config.RELAYER_PRIVATE)

// using the provider generate signers for the different users and recipients.
const relayerAccount = new ethers.Wallet(config.RELAYER_PRIVATE)
const relayerSigner = (new ethers.Wallet(config.RELAYER_PRIVATE)).connect(provider)

// console.log(config)
const mainAccountSigner = (new ethers.Wallet(config.MAIN_ACCOUNT_PRIVATE)).connect(provider)
const mainAccount = new ethers.Wallet(config.MAIN_ACCOUNT_PRIVATE)

// console.log(config)
const spenderAccountSigner = (new ethers.Wallet(config.SPENDER_PRIVATE)).connect(provider)
const spenderAccount = new ethers.Wallet(config.SPENDER_PRIVATE)

const mainRecipientAccount = (new ethers.Wallet(config.MAIN_ACCOUNT_PRIVATE)).connect(provider)

module.exports = {
    relayerAccount,
    relayerSigner,
    mainAccount,
    mainAccountSigner,
    mainRecipientAccount,
    spenderAccount,
    spenderAccountSigner
}