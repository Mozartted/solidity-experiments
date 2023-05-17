const MetaCoin = artifacts.require("MetaCoinWithPermit");
const ethers = require("ethers")

contract('MetaCoin', (accounts) => {
  it('should put 10000 MetaCoin in the first account', async () => {
    const metaCoinInstance = await MetaCoin.at("0x337ef8Ca342D99099C6EF7603037ca59e4c0db43")
    let amount = ethers.utils.parseUnits('450000', metaCoinInstance.decimal_place)
    console.log(amount)
    const balance = await metaCoinInstance.mint(accounts[0], amount, {from: accounts[0]});

    console.log(balance.valueOf())
    const response = await metaCoinInstance.balanceOf(accounts[0], { from: accounts[0] })
    console.log(response.toString())
    // console.log(ethers.utils.formatUnits(response, metaCoinInstance.decimal_place))

    assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
  });
  // it('should call a function that depends on a linked library', async () => {
  //   const metaCoinInstance = await MetaCoin.deployed();
  //   const metaCoinBalance = (await metaCoinInstance.getBalance.call(accounts[0])).toNumber();
  //   const metaCoinEthBalance = (await metaCoinInstance.getBalanceInEth.call(accounts[0])).toNumber();

  //   assert.equal(metaCoinEthBalance, 2 * metaCoinBalance, 'Library function returned unexpected function, linkage may be broken');
  // });
  // it('should send coin correctly', async () => {
  //   const metaCoinInstance = await MetaCoin.deployed();

  //   // Setup 2 accounts.
  //   const accountOne = accounts[0];
  //   const accountTwo = accounts[1];

  //   // Get initial balances of first and second account.
  //   const accountOneStartingBalance = (await metaCoinInstance.getBalance.call(accountOne)).toNumber();
  //   const accountTwoStartingBalance = (await metaCoinInstance.getBalance.call(accountTwo)).toNumber();

  //   // Make transaction from first account to second.
  //   const amount = 10;
  //   await metaCoinInstance.sendCoin(accountTwo, amount, { from: accountOne });

  //   // Get balances of first and second account after the transactions.
  //   const accountOneEndingBalance = (await metaCoinInstance.getBalance.call(accountOne)).toNumber();
  //   const accountTwoEndingBalance = (await metaCoinInstance.getBalance.call(accountTwo)).toNumber();


  //   assert.equal(accountOneEndingBalance, accountOneStartingBalance - amount, "Amount wasn't correctly taken from the sender");
  //   assert.equal(accountTwoEndingBalance, accountTwoStartingBalance + amount, "Amount wasn't correctly sent to the receiver");
  // });
});
