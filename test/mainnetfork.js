const {expect} = require("chai")
const {ethers, network} = require("hardhat")
const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");
const axios = require('axios');

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
const WETH_10 = "0xf4BB2e28688e89fCcE3c0580D37d36A7672E8A9F"
const THREECRV = "0x6c3f90f043a72fa612cbac8115ee7e52bde6e490"
const CRV = "0xD533a949740bb3306d119CC777fa900bA034cd52"
const CVX = "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b"
const CVXLP = "0x30D9410ED1D5DA1F6C8391af5338C93ab8d4035C"

const DAI_WHALE = ""
const USDT_WHALE = "0x44418b66538138E046C1d080c70E81Ab5de5E076"
const THREECRV_WHALE = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B"

const curveAddress = '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7'
const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${curveAddress}&apikey=9QJ9XVGBHDXJE7715S92VNYV9D4Z5VRH9T`

const convexAddress = '0xF403C135812408BFbE8713b5A23a04b3D48AAE31'
const convexRewardAddress = '0x689440f2Ff927E1f24c72F1087E1FAF471eCe1c8'
const urlConvex = `https://api.etherscan.io/api?module=contract&action=getabi&address=${convexAddress}&apikey=9QJ9XVGBHDXJE7715S92VNYV9D4Z5VRH9T`
const urlConvexReward = `https://api.etherscan.io/api?module=contract&action=getabi&address=${convexRewardAddress}&apikey=9QJ9XVGBHDXJE7715S92VNYV9D4Z5VRH9T`

const tokens_to_transfer = 100 * (10 ** 6); // represents 100 USDT

describe("Test Mainnet", () => {

    let contract
    let accounts
    let dai, usdc, usdt
    let crv,cvx
    let curve
    let curveLPToken
    let convexLPToken
    let convex
    let convexReward
    
    let acc1
    let usdtWhale
    let curveWhale

    before(async () => {
        accounts = await ethers.getSigners(1)
        acc1 = accounts[0]

        dai = await ethers.getContractAt("IERC20", DAI)
        usdc = await ethers.getContractAt("IERC20", USDC)
        usdt = await ethers.getContractAt("IERC20", USDT)
        curveLPToken = await ethers.getContractAt("IERC20", THREECRV)
        convexLPToken = await ethers.getContractAt("IERC20", CVXLP)
        crv = await ethers.getContractAt("IERC20", CRV)
        cvx = await ethers.getContractAt("IERC20", CVX)

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
        const curveBal = await curveLPToken.balanceOf(curveWhale.address)

        console.log('whale usdt balance', usdtBal)
        console.log('whale 3crv balance', curveBal)

        const res = await axios.get(url)
        const curvePoolAbi = JSON.parse(res.data.result)
        curve = await ethers.getContractAt(curvePoolAbi, curveAddress)

        const res2 = await axios.get(urlConvex)
        const convexPoolAbi = JSON.parse(res2.data.result)
        convex = await ethers.getContractAt(convexPoolAbi, convexAddress)

        const res3 = await axios.get(urlConvexReward)
        const convexRewardAbi = JSON.parse(res3.data.result)
        convexReward = await ethers.getContractAt(convexRewardAbi, convexRewardAddress)
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

    it('tries to send USDT to curve pool and deposits and withdraws', async() => {

        // get USDT/3CRV balance of account
        const usdtBal = await usdt.balanceOf(acc1.address)
        const crvlpBal = await curveLPToken.balanceOf(acc1.address)

        console.log(usdtBal)
        console.log(crvlpBal)

        // check balances are valid
        expect(tokens_to_transfer).to.be.equal(usdtBal)
        expect(0).to.be.equal(crvlpBal)

        // ----CURVE-----

        //need to approve curve LP Pool contract to spend our tokens
        // - curveAddress is the address of the LP POOL
        // - call approve on USDT ()
        const approveTxn = await usdt.approve(curveAddress, tokens_to_transfer)

        let amounts // THIS IS PARAMETER ONE IN CURVE LP ADD_LIQUIDITY --> AMOUNTS OF TOKENS TO SEND TO CURVE
        let min_amount_recieve // PARAMETER TWO --> MIN AMOUNT OF LP TOKEN TO RECIEVE (SETTING TO 1 FOR NOW..)

        const virtual_price = await curve.connect(acc1).get_virtual_price()
        console.log(virtual_price)

        // amount variable is an indexed array. each index represents a token 0: DAI, 1: USDC, 2: USDT
        amounts = [0, 0, usdtBal]
        // min amount to recieve should probably be calculated but i am just going to use 1 for now
        min_amount_recieve = 1
        
        //TXN 1
        //SEND AMOUNTS ARRAY AND MIN_RECIEVE TO CURVE LP
        //IN RETURN RECIEVE 3CRV LP TOKENS -- LOCKS AWAY OUR USDT
        const sendToCurve = await curve.connect(acc1).add_liquidity(amounts, min_amount_recieve,{
            gasLimit: ethers.utils.hexlify(1000000)
        })
        //console.log(await sendToCurve.wait())

        const usdtBalAfter = await usdt.balanceOf(acc1.address)
        const crvlpBalAfter = await curveLPToken.balanceOf(acc1.address)

        console.log(usdtBalAfter)
        console.log(crvlpBalAfter)

        //check updated balances are correct and valid 
        //--> this should result in 0 USDT and a x amount of CRV LP Token
        expect(0).to.be.equal(usdtBalAfter)
        expect(crvlpBalAfter).to.be.greaterThan(0)


        // TRY TO PERFORM A WITHDRAW
        await mine(1)
        await time.increase(3600)

        const withdrawFromCurve = await curve.connect(acc1).remove_liquidity(crvlpBalAfter, [1,1,1], {
            gasLimit: ethers.utils.hexlify(1000000)
        })

        // console.log(await dai.balanceOf(acc1.address))
        // console.log(await usdc.balanceOf(acc1.address))
        // console.log(await usdt.balanceOf(acc1.address))
        // console.log(await curveLPToken.balanceOf(acc1.address))

        expect(await dai.balanceOf(acc1.address)).to.be.greaterThan(0)
        expect(await usdc.balanceOf(acc1.address)).to.be.greaterThan(0)
        expect(await usdt.balanceOf(acc1.address)).to.be.greaterThan(0)
        expect(0).to.be.equal(await curveLPToken.balanceOf(acc1.address))

    })

    it('sends USDT to curve pool and withdraws to 1 coin', async() => {
        
        // get USDT/3CRV balance of account
        const usdtBal = await usdt.balanceOf(acc1.address)
        const crvlpBal = await curveLPToken.balanceOf(acc1.address)

        console.log(usdtBal)
        console.log(crvlpBal)
    })

    /*

    it('tries to send USDT to curve and convex pool', async() => {
        // await usdt.connect(usdtWhale).transfer(accounts[0].address, tokens_to_transfer, 
        //     {gasLimit: ethers.utils.hexlify(1000000)})
        
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
        
        const usdtBal = await usdt.balanceOf(acc1.address)
        const crvBal = await curveLPToken.balanceOf(acc1.address)
        console.log('\n\n\n\n\nusdt total before: ', usdtBal)
        console.log('3crv total before: ', crvBal)

        //need to approve curve contract to spend our tokens
        const approveTxn = await usdt.approve(curveAddress, tokens_to_transfer)

        let param1, param2;

        param1 = [0,0, usdtBal]
        param2 = 1

        const txn = await curve.connect(acc1).add_liquidity(param1, param2, {
            gasLimit: ethers.utils.hexlify(1000000)
        })

        const usdtafter = await usdt.balanceOf(acc1.address)
        const crvafter = await curveLPToken.balanceOf(acc1.address)
        console.log('\n\n\n\n\n------add to curve-------')
        console.log('usdt total after: ', usdtafter)
        console.log('3crv total after: ', crvafter)

        console.log('\n\n\n\n\n------add to convex-------\n')
        // console.log(await convex.poolLength())
        console.log(await convex.poolInfo(9))
        console.log(await crv.balanceOf(acc1.address))
        console.log(await cvx.balanceOf(acc1.address))

        const approveConvex = await curveLPToken.approve(convexAddress, crvafter)

        const convexTxn = await convex.connect(acc1).depositAll(9, true, {
            gasLimit: ethers.utils.hexlify(1000000)
        })

        const crvafterConvex = await curveLPToken.balanceOf(acc1.address)
        console.log('3CRV LP total after Convex: ', crvafterConvex)
        const cvxLPafterConvex = await convexLPToken.balanceOf(acc1.address)
        console.log('CVX3CRV LP total after Convex: ', cvxLPafterConvex)

        console.log(await crv.balanceOf(acc1.address))
        console.log(await cvx.balanceOf(acc1.address))

        console.log('reward token: ', await convexReward.rewardToken())
        console.log('balance of: ', await convexReward.balanceOf(acc1.address))
        console.log('total staked: ', await convexReward.totalSupply())
        console.log('total earned: ', await convexReward.earned(acc1.address))

        await time.increase(7 * 24 * 3600)
        console.log('{INCREASE TIME}')

        console.log('total earned: ', await convexReward.earned(acc1.address))

        const convexClaim = await convexReward.connect(acc1).withdrawAll(true,{
            gasLimit: ethers.utils.hexlify(1000000)
        })
        
        console.log('USDT', await usdt.balanceOf(acc1.address))
        console.log('3CRV: ', await curveLPToken.balanceOf(acc1.address))
        console.log('CRV: ', await crv.balanceOf(acc1.address))
        console.log('CVX: ', await cvx.balanceOf(acc1.address))

        const test = await convexLPToken.balanceOf(acc1.address)
        console.log('CVX3CRV LP total after Convex: ', test)
    })
    */
})