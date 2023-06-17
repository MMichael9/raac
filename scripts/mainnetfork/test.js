const hre = require("hardhat");
const { ethers } = require("hardhat");
const axios = require('axios');

require('dotenv').config()

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const provider = new ethers.providers.getDefaultProvider('http://127.0.0.1:8545/')
const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const curveAddress = '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7'
const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${curveAddress}&apikey=`


async function main() {
    const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')
    const connectedWallet = wallet.connect(provider)
    //console.log(connectedWallet)

    //ERC20
    const ERC20ABI = require('../../abi.json');
    const wethContract = new ethers.Contract(wethAddress, ERC20ABI, provider)
    const name = await wethContract.symbol()
    const decimals = await wethContract.decimals()

    console.log('---------------------')
    console.log('contract name: ' + name)
    console.log('token decimals: ' + decimals)
    console.log('---------------------')

    let test = ethers.utils.parseUnits('0.01', 18).toString()
    console.log(test)

    const transaction = await wethContract.connect(connectedWallet).approve(
        curveAddress,
        ethers.utils.parseUnits('0.01', 18).toString()
    )
    const receipt = await transaction.wait()
    console.log('---------------------')
    console.log('block number: ' + receipt.blockNumber)
    console.log('---------------------')

    const res = await axios.get(url)
    const curvePoolAbi = JSON.parse(res.data.result)

    console.log(curvePoolAbi)


    const curveContract = new ethers.Contract(curveAddress, curvePoolAbi, provider)

    // const owner = await curveContract.connect(connectedWallet).owner({
    //     gasLimit: ethers.utils.hexlify(1000000)
    // })

    // const fee = await curveContract.connect(connectedWallet).fee({
    //     gasLimit: ethers.utils.hexlify(1000000)
    // })

    // console.log('---------------------')
    // console.log('owner: ' + owner)
    // console.log('fee: ' + fee)
    // console.log('---------------------')

}

main()