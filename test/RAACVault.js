const { expect } = require('chai');
const { ethers } = require('hardhat');
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('RAAC Vault Contract', () => {

    let acc1, acc2, acc3, acc4
    let raacNFT, raacVault

    beforeEach(async () => {
        //setup
        [acc1, acc2, acc3, acc4] = await ethers.getSigners()

        // deploy
        const RAACNFT = await ethers.getContractFactory('RAAC')
        raacNFT = await RAACNFT.deploy()

        // mint
        let txn = await raacNFT.connect(acc1).safeMint(acc2.address, "0")
        await txn.wait()

        const Vault = await ethers.getContractFactory('RAACVault')
        raacVault = await Vault.deploy(raacNFT.address, {value: tokens(100)})

        // approve
        txn = await raacNFT.connect(acc2).approve(raacVault.address, 0)
        await txn.wait()
    })

    describe('Deployment', () => {

        it('returns RAAC NFT address', async () => {
            const result = await raacVault.raacInterface()
            expect(result).to.be.equal(raacNFT.address)
        })

        it('returns RAAC Vault initial ETH balance', async () => {
            const result = await raacVault.getContractBalance()
            expect(result).to.be.equal(tokens(100))
        })
    })

    describe('Deposit', () => {

        it('checks if acc2 owns NFT', async () => {
            const result = await raacNFT.ownerOf(0)
            expect(await raacNFT.balanceOf(acc2.address)).to.be.equal(1)
            expect(result).to.be.equal(acc2.address)
        })

        it('allows NFT holder to deposit', async () => {
            const result = raacVault.connect(acc2).stakeNFT(0)

            expect(raacVault.address).to.be.equal(await raacNFT.ownerOf(0)) // contract now owns token
            expect(acc2.address).to.be.equal(await raacVault.originalOwner(0)) // updates original owner mapping
            await expect(result).to.emit(raacVault, "NFTDeposit")
            .withArgs(acc2.address, raacVault.address, 0);
        })

    })

    describe('Withdraw', () => {

        it('checks if acc2 owns NFT', async () => {
            const result = await raacNFT.ownerOf(0)
            expect(await raacNFT.balanceOf(acc2.address)).to.be.equal(1)
            expect(result).to.be.equal(acc2.address)
        })

        it('allows NFT holder to deposit and withdraw', async () => {
            const result = await raacVault.connect(acc2).stakeNFT(0)

            expect(raacVault.address).to.be.equal(await raacNFT.ownerOf(0)) // contract now owns token
            expect(acc2.address).to.be.equal(await raacVault.originalOwner(0)) // updates original owner mapping
            await expect(result).to.emit(raacVault, "NFTDeposit")
            .withArgs(acc2.address, raacVault.address, 0);

            const withdraw = await raacVault.connect(acc2).withdrawNFT(0)

            expect(acc2.address).to.be.equal(await raacNFT.ownerOf(0))
            await expect(withdraw).to.emit(raacVault, "NFTWithdraw")
            .withArgs(acc2.address, 0)
        })
    })

    describe('Borrow', () => {

        beforeEach(async () => {
            const result = await raacVault.connect(acc2).stakeNFT(0)
        })

        it('allows NFT staker to borrow', async () => {
            expect(tokens(100)).to.be.equal(await raacVault.getContractBalance())
            expect(0).to.be.equal(await raacVault.debts(acc2.address))
            const result = await raacVault.connect(acc2).borrow(0)

            expect(tokens(80)).to.be.equal(await raacVault.getContractBalance())
            expect(tokens(20)).to.be.equal(await raacVault.debts(acc2.address))
            await expect(result).to.emit(raacVault, "BorrowAgainstNFT")
            .withArgs(acc2.address, 0, tokens(20))
        })

    })

    describe('Repay', () => {

        beforeEach(async () => {
            const result = await raacVault.connect(acc2).stakeNFT(0)
            const borrow = await raacVault.connect(acc2).borrow(0)
        })

        it('allows NFT staker to repay', async () => {
        })

    })

})
