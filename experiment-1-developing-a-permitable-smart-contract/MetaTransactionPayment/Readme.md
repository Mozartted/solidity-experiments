# Test Meta Transaction Payments.
> Please note: This codebase is simply an experiemental setup into understanding and testing different scenerios with respect to handling and managing meta transaction processes.

> Please note: This code is not production ready, KEYS and Signatures found here are strictly only for use in local chain setups like Ganache and Hardhat. Please refrain from using them on mainnet or any other live chain.

## Purpose of the experiment.
The aim of this experiment is to sign a meta transaction for our in-built ERC20 token implementing the [EIP-2612 standard.](https://eips.ethereum.org/EIPS/eip-2612).

Components to this system include the following. 
- Signing the transaction using typeData_v4 signature, this can be found within `eth-sig-util`, Metamask also implements via `eth-sig-util`. 
- Using the domain seperator to ensure the contract's domain seperator matches
- Encoding te meta transaction data with an encoder function `encodeMetaTransactionData`
- And signing / forwarding the transaction with a relayer via a signage function. `signForwardMeta`

## Methods breakdown
> Todo