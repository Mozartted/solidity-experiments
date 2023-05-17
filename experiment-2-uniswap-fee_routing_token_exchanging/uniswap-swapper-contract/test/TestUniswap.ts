require("dotenv").config()
import { expect } from "chai"
import hre from "hardhat"
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers"
// import Ethers from "@typechain/ethers-v5";
// import { ethers } from "hardhat"
import { Signer, utils } from "ethers"
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json"
import * as ethers from "@nomiclabs/hardhat-ethers"

let DAI_WHALE = <string>process.env.DAI_WHALE;
let DAI = <string>process.env.DAI
let WBTC = <string>process.env.WBTC
let AMOUNT_OUT_MIN = 1

describe("Test Uniswap", function () {
  let daiSigner: Signer
  let testAccount: Signer
  let feeAccount: Signer;
  this.beforeEach(async () => {
    let letAccountSigners = await hre.ethers.getSigners()
    testAccount = letAccountSigners[0]
    feeAccount = letAccountSigners[1]
    daiSigner = await hre.ethers.getImpersonatedSigner(DAI_WHALE)
  })

  async function deployTestUniswap() {
    let feeAddress = feeAccount.getAddress();
    const TestUniswapContract = await hre.ethers.getContractFactory("TestUniswap");
    const TestUniswap = await TestUniswapContract.deploy(feeAddress);
    return {
      testUniswap: TestUniswap
    }
  }

  it("Should swap tokens", async () => {
    console.log(`ETH balance in dai account is ${ hre.ethers.utils.formatEther(await daiSigner.getBalance()) }`)
    const AMOUNT_IN = utils.parseUnits('1000000', 18)
    console.log("Amount IN 1000000 DAI")
    const tokenIn = DAI
    const tokenOut = WBTC
    const TO = await testAccount.getAddress()
    const feeAddess = await feeAccount.getAddress()
    const {testUniswap} = await loadFixture(deployTestUniswap)

    let tokenInContract = new hre.ethers.Contract(tokenIn, IERC20.abi, hre.ethers.getDefaultProvider())
    console.log(`DAI balance in dai account is ${ hre.ethers.utils.formatUnits(await tokenInContract.balanceOf(DAI_WHALE), 18)}`)
    let tokenOutContract = new hre.ethers.Contract(tokenOut, IERC20.abi, hre.ethers.getDefaultProvider())
    tokenOutContract =  tokenOutContract.connect(daiSigner)
    tokenInContract =  tokenInContract.connect(daiSigner)
    // console.log(daiSigner);
    console.log("TEST UNiswap contract address : ", testUniswap.address)
    let testUniswapContract = testUniswap.connect(daiSigner);
    await tokenInContract.approve(testUniswapContract.address, AMOUNT_IN)
    await testUniswapContract.swap(
      DAI,
      WBTC,
      AMOUNT_IN,
      AMOUNT_OUT_MIN,
      TO
    )

    console.log(`Balance in out ${hre.ethers.utils.formatEther(await tokenOutContract.balanceOf(TO))} WBTC`)
    console.log(`Fee Balance of Fee Addess: ${hre.ethers.utils.formatEther(await tokenInContract.balanceOf(feeAddess))} DAI`)
  })

  it("Should deploy and upgrade", async () => {
    const Box = await hre.ethers.getContractFactory("Box");
    const BoxV2 = await hre.ethers.getContractFactory("BoxV2");

    const instance = await hre.upgrades.deployProxy(Box, [42]);
    const upgraded = await hre.upgrades.upgradeProxy(instance.address, BoxV2);

    const value = await upgraded.value();
    expect(value.toString()).to.equal('42');
  })
})