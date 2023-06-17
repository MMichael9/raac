import styles from "../styles/Collection.module.css";
import { useContract, useNFTs } from "@thirdweb-dev/react";
import { useEffect } from 'react';
import NFT from './../artifacts/contracts/RAAC.sol/RAAC.json';
const nft_contract = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function Collection() {

    const { contract } = useContract(nft_contract, NFT.abi)
    
    // Load the NFT metadata from the contract using a hook
    const { data, isLoading, error } = useNFTs(contract, {count: 10});

  return (
    <div className={styles.collection}>
        {data ? (
        data.map((item, index) => (
            <div key={index}>
            <h2>{item.metadata.name}</h2>
            <img src={item.metadata.image} alt={item.metadata.name} style={{ width: '300px', height: '180px' }} />
            <p className={styles.owner}>Owner: {item.owner}</p>
            {/* Display other information as needed */}
            </div>
        ))
        ) : (
        <p>Loading...</p>
        )}
    </div>
  );
}
