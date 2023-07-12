const { expect } = require('chai');
const { ethers } = require('hardhat');
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

// WHALE ACCOUNT TO IMPERSONANT (USED TO SEND FUNDS)
const USDT_WHALE = "0x44418b66538138E046C1d080c70E81Ab5de5E076"

// CURVE LP POOL TOKENS
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
const CURVE_TOKEN = "0xD533a949740bb3306d119CC777fa900bA034cd52"
const CONVEX_TOKEN = "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b"
const CURVE_LPTOKEN = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490"
const CONVEX_LPTOKEN = "0x30D9410ED1D5DA1F6C8391af5338C93ab8d4035C"

// CURVE VARIABLES - POOL CONTRACT we are depositing to (in this case, 3pool)
const CURVE_POOL = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7"

// CONVEX VARIABLES - POOL AND REWARD CONTRACT + CONVEX POOL ID
const CONVEX_POOL = "0xF403C135812408BFbE8713b5A23a04b3D48AAE31"
const CONVEX_REWARD = "0x689440f2Ff927E1f24c72F1087E1FAF471eCe1c8"
const ID_CONVEX_POOL = "9"

const tokens_to_transfer = 100 * (10 ** 6); // represents 100 USDT

describe('RAAC Vault Contract', () => {

    let acc1, acc2, acc3, acc4 // accounts
    let raacNFT, raacVault, raacCurve // contracts
    let usdtWhale // account to impersonate
    let dai,usdc, usdt, crv, cvx, crvlp, cvxlp // erc20 tokens used

    before(async () => {
        //setup
        [acc1, acc2, acc3, acc4] = await ethers.getSigners()

        // deploy RAAC
        const RAACNFT = await ethers.getContractFactory('RAAC')
        raacNFT = await RAACNFT.deploy()

        const RAACVAULT = await ethers.getContractFactory('RAACVault')
        raacVault = await RAACVAULT.deploy(raacNFT.address, {value: tokens(100)})

        const RAACCURVE = await ethers.getContractFactory('RAACCurveStrategy')
        raacCurve = await RAACCURVE.deploy(raacVault.address, raacNFT.address)

        //deploy coins
        dai = await ethers.getContractAt("IERC20", DAI)
        usdc = await ethers.getContractAt("IERC20", USDC)
        usdt = await ethers.getContractAt("IERC20", USDT)

        crv = await ethers.getContractAt("IERC20", CURVE_TOKEN)
        cvx = await ethers.getContractAt("IERC20", CONVEX_TOKEN)

        crvlp = await ethers.getContractAt("IERC20", CURVE_LPTOKEN)
        cvxlp = await ethers.getContractAt("IERC20", CONVEX_LPTOKEN)

        //setup accounts
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [USDT_WHALE]
        })

        usdtWhale = await ethers.getSigner(USDT_WHALE)
        const usdtBal = await usdt.balanceOf(usdtWhale.address)
        //console.log('whale usdt balance', usdtBal)

        //mint nft
        let mint = await raacNFT.connect(acc1).safeMint(acc2.address, "0")
        await mint.wait()
        let secondmint = await raacNFT.connect(acc1).safeMint(acc2.address, "1")
        await secondmint.wait()

        // approve
        txn = await raacNFT.connect(acc2).approve(raacVault.address, 0)
        await txn.wait()

        //stake nft
        let stake = await raacVault.connect(acc2).stakeNFT(0)
        await stake.wait()

        //send usdt to raac curve strategy contract
        let usdtsent = await usdt.connect(usdtWhale).transfer(raacCurve.address, tokens_to_transfer, 
            {gasLimit: ethers.utils.hexlify(1000000)})
        await usdtsent.wait()
    })

    describe('Deployment', () => {
        it('checks that accounts, contracts and balances have been setup', async () => {
            //checks if vault contract owns token -- verifies token staked
            expect(raacVault.address).to.be.equal(await raacNFT.ownerOf(0))
            expect(acc2.address).to.be.equal(await raacCurve.getOriginalOwner(0))

            //checks raac curve variables
            expect(raacVault.address).to.be.equal(await raacCurve.vaultInterface())
            expect(raacNFT.address).to.be.equal(await raacCurve.nftInterface())
            expect(CURVE_POOL).to.be.equal(await raacCurve.curveInterface())
            expect(CURVE_LPTOKEN).to.be.equal(await raacCurve.tokenInterface())
            expect(CONVEX_POOL).to.be.equal(await raacCurve.convexInterface())
            expect(CONVEX_REWARD).to.be.equal(await raacCurve.convexRewardsInterface())
            expect(ID_CONVEX_POOL).to.be.equal(await raacCurve.convexPoolId())

            //check usdt balance of raac curve
            expect(tokens_to_transfer).to.be.equal(await usdt.balanceOf(raacCurve.address))
        })
    })

    describe('tests the curve pool add liquidity function', () => {

        it('tests the add liquidity function', async() => {

            console.log('-----INITIAL------')
            console.log('usdt bal: ', await usdt.balanceOf(raacCurve.address))
            console.log('3crv bal: ', await crvlp.balanceOf(raacCurve.address))

            expect(tokens_to_transfer).to.be.equal(await usdt.balanceOf(raacCurve.address))
            expect(0).to.be.equal(await crvlp.balanceOf(raacCurve.address))

            let txn = await raacCurve.connect(acc2).add(0, {
                gasLimit: ethers.utils.hexlify(1000000)
            })

            await expect(txn).to.emit(raacCurve, "AddLiquidity")
            .withArgs(acc2.address, true, tokens(100))
        })

        it('verifies and prints that contract has a balance of 3CRV LP Tokens', async() => {
            console.log('-----AFTER------')
            console.log('usdt bal: ', await usdt.balanceOf(raacCurve.address))
            console.log('3crv bal: ', await crvlp.balanceOf(raacCurve.address))

            expect(0).to.be.equal(await usdt.balanceOf(raacCurve.address))
            expect(await crvlp.balanceOf(raacCurve.address)).to.be.greaterThan(90000000000000000000n)
        })

        it('tries to deposit CRV LP tokens to a Convex Pool', async() => {
            const lpTokenBalance = await crvlp.balanceOf(raacCurve.address)

            let txn = await raacCurve.connect(acc2).boost(0, {
                gasLimit: ethers.utils.hexlify(1000000)
            })

            await expect(txn).to.emit(raacCurve, "BoostInitiated")
            .withArgs(acc2.address, lpTokenBalance)
        })

        it('verifies and prints balance of CVX LP token', async() => {
            const curveLpBalance = await crvlp.balanceOf(raacCurve.address)
            const convexLPBalance = await raacCurve.getConvexBoostedAmount()

            console.log('curve lp:', curveLpBalance)
            console.log('convex lp:', convexLPBalance)

            expect(0).to.be.equal(curveLpBalance)
            expect(convexLPBalance).to.be.greaterThan(90000000000000000000n)
        })
    })

})