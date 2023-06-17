import styles from "../styles/Collection.module.css";
import { Web3Button, useAddress, useContract, useOwnedNFTs } from "@thirdweb-dev/react";
import { useEffect } from 'react';

import NFT from './../artifacts/contracts/RAAC.sol/RAAC.json';
const nft_contract = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

import Vault from './../artifacts/contracts/RAACVault.sol/RAACVault.json';
const nft_vault_contract = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export default function UserCollection() {

    const address = useAddress();

    const { contract: nft } = useContract(nft_contract, NFT.abi);
    const { contract: vault } = useContract(nft_vault_contract, Vault.abi);

    // Load the NFT metadata from the contract using a hook
    const { data, isLoading, error } = useOwnedNFTs(nft, address);

    async function stake(id) {
        if (!address) return;
    
        try {
            // The contract requires approval to be able to transfer the regna minima nft
            const isApproved = await nft.call('isApprovedForAll', [address, nft_vault_contract])

            if (!isApproved) {
                const approveTx = await nft.call('setApprovalForAll', [nft_vault_contract, true])
            }
            const tx = await vault.call('stakeNFT', [id])
            if (tx.receipt.status === 1) alert('Transaction Success')
        } catch (e) {
            alert(e)
            console.log(e)
        }
    }

  return (
    <div className={styles.collection}>
        {data ? (
        data.map((item, index) => (
            <div key={index}>
            <h2>{item.metadata.name}</h2>
            <img src={item.metadata.image} alt={item.metadata.name} style={{ width: '300px', height: '180px' }} />
            {/* <p className={styles.owner}>Owner: {item.owner}</p> */}
            {/* Display other information as needed */}
            <div className={styles.web3BtnDiv}>
                <Web3Button
                contractAddress={nft_vault_contract}
                contractAbi={Vault.abi}
                action={() => stake(item.metadata.id)}
                className={styles.depositBtn}
                >
                Deposit NFT
                </Web3Button>
            </div>
            </div>
        ))
        ) : (
        <p>Loading...</p>
        )}
    </div>
  );
}
