require("dotenv").config({ debug: true })
// const ganache = require("ganache")
const {utils, BigNumber,constants} = require("ethers")
const {mainAccount, mainAccountSigner, relayerSigner, spenderAccountSigner, relayerAccount} = require("./src/provider")
const { signPermitMeta, encodeMetaTransactionData, getDomainSeparator } = require("./src/permit-signer")
const { signForwardMeta } = require("./src/forwarder-signer")
const { config } = require("./src/config")
const {createInstance: createMetaCoinInstance} = require("./src/modules/MetacoinWithPermit")

const SECOND = 1000
const getPermitData = async (message, extra = {}) => {
    const permitDataSigned = await signPermitMeta(mainAccountSigner, mainAccount, message, extra)
    console.log(permitDataSigned)

    // const encodedSig = await encodeMetaTransactionData([
    //     permitDataSigned.owner,
    //     permitDataSigned.spender,
    //     permitDataSigned.value,
    //     permitDataSigned.deadline,
    //     permitDataSigned.v,
    //     permitDataSigned.r,
    //     permitDataSigned.s
    // ])
    // console.log(encodedSig)
    // return encodedSig
    return permitDataSigned
}

const main = async () => {

    const metacoinContract = await createMetaCoinInstance(relayerSigner.provider)
    const metaCoinContract = metacoinContract.connect(relayerSigner)
    let allowance1 = await metaCoinContract.allowance(mainAccount.address, relayerAccount.address)
    let balance = await metaCoinContract.balanceOf(mainAccount.address)
    console.log("Relayer allowance: ", allowance1.toString())
    console.log("Main account balance: ", balance.toString())


    const value = utils.parseEther((20000).toString())


    const deadline = constants.MaxUint256
    try {
        
        // check domain seperator 
        const contractName =  await metaCoinContract.name()
        // const contractVersion =  await metaCoinContract.version()
        console.log(contractName)
        const domainSeparator = await metaCoinContract.DOMAIN_SEPARATOR()
        const checkDomainSeperator = await getDomainSeparator({
            name: contractName,
            version: '1',
            chainId: 405,
            verifyingContract: config.METACOIN_CONTRACT
        })

        console.log("Domain separator contract: ", domainSeparator)
        console.log("Domain separator calculate: ", checkDomainSeperator)
        if (domainSeparator !== checkDomainSeperator) {
            throw new Error(`domain seperators don't match ${domainSeparator}, ${checkDomainSeperator}`)
        }
        const messageData = {
            owner: mainAccount.address,
            spender: config.RELAYER_ADDRESS,
            // value: ethers.utils.parseUnits((300e18).toLocaleString('fullwide', {useGrouping:false}), 18).toNumber(),
            value: value,
            deadline: deadline,
            nonce: await metaCoinContract.nonces(mainAccount.address)
        }
        const permitDataSigned = await getPermitData(messageData, {chainId: 405, name: contractName})

        console.log("SIGNED PERMIT DATA", permitDataSigned) 
        // let respoonse = await metaCoinContract.permit(messageData.owner, messageData.spender, messageData.value, messageData.deadline, permitDataSigned.v, permitDataSigned.r, permitDataSigned.s)

        let encodedPermitRequest = encodeMetaTransactionData([
            messageData.owner,
            messageData.spender,
            messageData.value,
            messageData.deadline,
            permitDataSigned.v,
            permitDataSigned.r,
            permitDataSigned.s
        ], relayerSigner.provider)
        console.log(encodedPermitRequest)


        const forwarderData = {
            to: config.METACOIN_CONTRACT,
            data: encodedPermitRequest,
            gas: 1e6
        }
        
        await signForwardMeta(mainAccountSigner, mainAccount, forwarderData, relayerSigner)

        // with the permission set, use the spender to send tokens from owner to another address
        // const metacoinContract = await createMetaCoinInstance(relayerSigner.provider)
        // const metaCoinContract = metacoinContract.connect(relayerSigner)

        // send 300 tokens to base recipient account.
        // let respoonse = await metaCoinContract['permit(address,address,uint256,uint256,uint8,bytes32,bytes32)'](
        //     messageData.owner,
        //     messageData.spender,
        //     messageData.value,
        //     messageData.deadline,
        //     permitDataSigned.v,
        //     permitDataSigned.r,
        //     permitDataSigned.s
        // )
        
        // Permission results processed here

        // let resultingAns = await respoonse.wait()
        // console.log("PERMIT RESULT", resultingAns)
        let allowance = await metaCoinContract.allowance(mainAccount.address, relayerAccount.address)
        let balance2 = await metaCoinContract.balanceOf(mainAccount.address)
        console.log("Relayer allowance: ", allowance.toString())
        console.log("Main account balance: ", balance2.toString())
        console.log(value.toString())
        console.log(deadline.toString())
        const tx = await metaCoinContract.transferFrom(mainAccount.address, config.BASE_ACCOUNT_RECIPIENT, utils.parseEther("20000"))

        // console.log(tx)

        let result = await tx.wait()
        console.log("RESULT :", result)

    } catch (error) {
        console.log(error.message)
        console.log(error.stack)
    }
}

main()