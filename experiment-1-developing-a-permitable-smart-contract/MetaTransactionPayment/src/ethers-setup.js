

// a sample request
const SECOND = 1000;
const fromAddress = "0x9EE5e175D09895b8E1E28c22b961345e1dF4B5aE";
// JavaScript dates have millisecond resolution
// const expiry = Math.trunc((Date.now() + 120 * SECOND) / SECOND);
// const nonce = 1;
const spender = "0xE1B48CddD97Fa4b2F960Ca52A66CeF8f1f8A58A5";
// the message the forwarder would forward this neds to be encrypted with a sig
const message = {
    owner: mainAccountSigner.address,
    spender: mainRecipientAccount.address,
    value: ethers.utils.parseUnits('300', 18),
    // nonce: nonce,
    deadline: Math.trunc((Date.now() + 120 * SECOND) / SECOND)
    // allowed: true,
};



// const permitParamsStructure = 
// // generate a signed version of the contract.