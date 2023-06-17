const {expect} = require("chai")
const {ethers, network} = require("hardhat")
const axios = require('axios');

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
const WETH_10 = "0xf4BB2e28688e89fCcE3c0580D37d36A7672E8A9F"
const THREECRV = "0x6c3f90f043a72fa612cbac8115ee7e52bde6e490"

const DAI_WHALE = ""
const USDT_WHALE = "0x44418b66538138E046C1d080c70E81Ab5de5E076"
const THREECRV_WHALE = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B"

const curveAddress = '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7'
const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${curveAddress}&apikey=`

const tokens_to_transfer = 100 * (10 ** 6); // represents 100 USDT

describe("Test Mainnet", () => {

    let contract
    let accounts
    let dai
    let usdt
    let curve
    let curveToken
    
    let acc1
    let usdtWhale
    let curveWhale

    before(async () => {
        accounts = await ethers.getSigners(1)
        acc1 = accounts[0]

        dai = await ethers.getContractAt("IERC20", DAI)
        usdt = await ethers.getContractAt("IERC20", USDT)
        curveToken = await ethers.getContractAt("IERC20", THREECRV)

        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [USDT_WHALE]
        })

        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [THREECRV_WHALE]
        })

        usdtWhale = await ethers.getSigner(USDT_WHALE)
        curveWhale = await ethers.getSigner(THREECRV_WHALE)
        //console.log(usdtWhale)
        const usdtBal = await usdt.balanceOf(usdtWhale.address)
        const curveBal = await curveToken.balanceOf(curveWhale.address)

        console.log('whale usdt balance', usdtBal)
        console.log('whale 3crv balance', curveBal)

        const res = await axios.get(url)
        const curvePoolAbi = JSON.parse(res.data.result)
        curve = await ethers.getContractAt(curvePoolAbi, curveAddress)
    });

    it('tests transfering USDT from whale to signer 1', async() => {
        const usdtInitialWhaleBal = await usdt.balanceOf(usdtWhale.address)
        expect(usdtInitialWhaleBal).to.be.greaterThan(0)

        const usdtAccBal = await usdt.balanceOf(acc1.address)
        expect(usdtAccBal).to.be.equal(0)

        await usdt.connect(usdtWhale).transfer(acc1.address, tokens_to_transfer, {gasLimit: ethers.utils.hexlify(1000000)})

        expect(tokens_to_transfer).to.be.equal(await usdt.balanceOf(acc1.address))
        expect(usdtInitialWhaleBal).to.be.greaterThan(await usdt.balanceOf(usdtWhale.address))
    })

    it('tries to send USDT to curve pool', async() => {
        // await usdt.connect(usdtWhale).transfer(accounts[0].address, tokens_to_transfer, 
        //     {gasLimit: ethers.utils.hexlify(1000000)})

        const usdtBal = await usdt.balanceOf(acc1.address)
        
        //console.log(usdtBal)

        // const owner = await curve.connect(acc1).owner({
        //     gasLimit: ethers.utils.hexlify(1000000)
        // })

        // const fee = await curve.connect(acc1).fee({
        //     gasLimit: ethers.utils.hexlify(1000000)
        // })

        // console.log('---------------------')
        // console.log('owner: ' + owner)
        // console.log('fee: ' + fee)
        // console.log('---------------------')
        
        const test = await curveToken.balanceOf(acc1.address)
        console.log('3crv total before: ', test)

        //need to approve curve contract to spend our tokens
        const approveTxn = await usdt.approve(curveAddress, tokens_to_transfer)

        let param1, param2;

        param1 = [0,0, usdtBal]
        param2 = 1

        const txn = await curve.connect(acc1).add_liquidity(param1, param2, {
            gasLimit: ethers.utils.hexlify(1000000)
        })

        const testafter = await curveToken.balanceOf(acc1.address)
        console.log('3crv total after: ', testafter)
    })
})