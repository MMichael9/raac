const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe('NFT Contract', function() {

    // Can use beforeEach instead
    async function deployTokenFixture() {

        // Deploy contract
        const NFT = await ethers.getContractFactory("RAAC");
        const [owner, addr1, addr2] = await ethers.getSigners();

        const hardhatNFT = await NFT.deploy();
        await hardhatNFT.deployed()

        return {NFT, hardhatNFT, owner, addr1, addr2} // return deployed contract and accounts
    }

        // Deploy
        describe("Deployment", function() {

            it("checks contract owner", async function() {
                const{ hardhatNFT, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);

                expect(await hardhatNFT.owner()).to.equal(owner.address)
            })

            it("checks total supply is zero", async function() {
                const{ hardhatNFT, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);

                expect(await hardhatNFT.totalSupply()).to.equal(0)
            })

            it("can pause contract", async function() {
                const{ hardhatNFT, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);

                const pause = await hardhatNFT.connect(owner).pause()

                expect(await hardhatNFT.paused()).to.equal(true)
            })

            it("can unpause contract", async function() {
                const{ hardhatNFT, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);

                const pause = await hardhatNFT.connect(owner).pause()
                const unpause = await hardhatNFT.connect(owner).unpause()

                expect(await hardhatNFT.paused()).to.equal(false)
            })

            it("reverts if non-owner pauses contract", async function() {
                const{ hardhatNFT, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);

                await expect(hardhatNFT.connect(addr1).pause()).to.be.revertedWith("Ownable: caller is not the owner")
            })
        });


        describe("Minting", function() {

            it('mints an NFT', async function() {
                const{ hardhatNFT, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
                const tokenUri = "ipfs/1"

                expect(await hardhatNFT.connect(owner).safeMint(addr1.address, tokenUri)).to.emit(hardhatNFT, 'Transfer')
                expect(await hardhatNFT.balanceOf(addr1.address)).to.equal(1)
                expect(await hardhatNFT.totalSupply()).to.equal(1)
            });

            it('mints multiple nfts and confirms balanceOf', async function() {
                const{ hardhatNFT, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
                const tokenUri1 = "ipfs/1"
                const tokenUri2 = "ipfs/2"

                await hardhatNFT.connect(owner).safeMint(addr1.address, tokenUri1);
                expect(await hardhatNFT.balanceOf(addr1.address)).to.equal(1);

                await hardhatNFT.connect(owner).safeMint(addr1.address, tokenUri2);
                expect(await hardhatNFT.balanceOf(addr1.address)).to.equal(2);
                expect(await hardhatNFT.totalSupply()).to.equal(2)
            });
        })
})