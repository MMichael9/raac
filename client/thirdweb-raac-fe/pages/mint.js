import { Web3Button, useAddress, useContract, useContractRead, useNFTs, ThirdwebNftMedia } from "@thirdweb-dev/react";
import { useEffect } from 'react';
import NFT from './../artifacts/contracts/RAAC.sol/RAAC.json';
import styles from "../styles/Mint.module.css";
import Collection from "../components/Collection";

const nft_contract = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function Mint() {

  const address = useAddress()
  const { contract } = useContract(nft_contract, NFT.abi)

  const { data, isLoading, error } = useContractRead(contract, 'totalSupply')

  return (
    <div>
      <main>
        <div className={styles.mint}>
        <Web3Button
          contractAddress={nft_contract}
          contractAbi={NFT.abi}
          action={async (contract) => {
            try {
              const tx = await contract.call('safeMint', [address, "0"])
              console.log(tx)
              if (tx.receipt.status === 1) alert('Transaction Success')
            } catch (e) {
              alert(e)
              console.log(e)
            }

          }}
        >
          Mint Token
        </Web3Button>
        </div>
        <h3 className={styles.nftHeader}>Regna Minima NFT Collection</h3>
        <Collection />
      </main>
    </div>
  );
}
