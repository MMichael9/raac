import { Web3Button, useAddress, useContract, useContractRead, useNFTs, ThirdwebNftMedia } from "@thirdweb-dev/react";
import { useEffect } from 'react';
import NFT from './../artifacts/contracts/RAAC.sol/RAAC.json';
import styles from "../styles/Mint.module.css";

const nft_contract = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function Mint() {

  const address = useAddress()
  const { contract } = useContract(nft_contract, NFT.abi)
  // Load the NFT metadata from the contract using a hook
  const { data, isLoading, error } = useNFTs(contract);
  console.log(data)

  useEffect(() => {
    // Check if data is available before accessing its properties
    if (data) {
      // Perform necessary operations with data
      console.log(data);
    }
  }, [data]);


  return (
    <div>
      <main>
        <div className={styles.mint}>
        <Web3Button
          contractAddress={nft_contract}
          contractAbi={NFT.abi}
          action={async (contract) => {
            try {
              console.log(contract)
              const tx = await contract.call('safeMint', [address, "2"])
              console.log(tx)
              if (tx.receipt.status === 1) alert('Transaction Success')
            } catch (e) {
              alert(e)
              console.log(e)
            }

          }}
          //action={(contract) => console.log(contract)}
        >
          Mint Token
        </Web3Button>
        </div>
        <div className={styles.collection}>
          {data ? (
            data.map((item, index) => (
              <div key={index}>
                <h2>{item.metadata.name}</h2>
                <p>{item.metadata.description}</p>
                <img src={item.metadata.image} alt={item.metadata.name} style={{ width: '240px', height: '240px' }} />
                <p>Token Id: {item.metadata.id}</p>
                {/* Display other information as needed */}
              </div>
            ))
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </main>
    </div>
  );
}
