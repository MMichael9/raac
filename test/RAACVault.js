const { expect } = require('chai');
const { ethers } = require('hardhat');

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
        raacVault = await Vault.deploy(raacNFT.address)

        // approve
        txn = await raacNFT.connect(acc2).approve(raacVault.address, 0)
        await txn.wait()
    })

    describe('Deployment', () => {

        it('returns RAAC nft address', async () => {
            const result = await raacVault.raacInterface()
            expect(result).to.be.equal(raacNFT.address)
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

    })

})
