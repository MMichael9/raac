import styles from "../styles/Collection.module.css";
import { Web3Button, useAddress, useContract, useContractRead, useOwnedNFTs } from "@thirdweb-dev/react";
import { useEffect, useState } from 'react';
import { ethers } from "ethers";

import NFT from './../artifacts/contracts/RAAC.sol/RAAC.json';
const nft_contract = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

import Vault from './../artifacts/contracts/RAACVault.sol/RAACVault.json';
const nft_vault_contract = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export default function VaultCollection() {

  const address = useAddress()

  const { contract: nft } = useContract(nft_contract, NFT.abi);
  const { contract: vault } = useContract(nft_vault_contract, Vault.abi);

  // Load the NFT metadata from the contract using a hook
  const { data } = useOwnedNFTs(nft, nft_vault_contract);


    async function withdraw(id) {
      console.log(id)
      if (!address) return;

      try {
          const tx = await vault.call('withdrawNFT', [id])
          if (tx.receipt.status === 1) alert('Transaction Success')
      } catch (e) {
          alert(e)
          console.log(e)
      }
    }

    async function borrow(id) {
      console.log(id)
      if (!address) return;

      try {
          const tx = await vault.call('borrow', [id])
          if (tx.receipt.status === 1) alert('Transaction Success')
      } catch (e) {
          alert(e)
          console.log(e)
      }
    }

    async function repay(id) {
      console.log(id)
      if (!address) return;

      try {
        const tx = await vault.call('repay', [id], {value: ethers.utils.parseEther("20")})
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
            <p>{item.metadata.description}</p>
            <img src={item.metadata.image} alt={item.metadata.name} style={{ width: '300px', height: '180px' }} />
            {/* Display other information as needed */}
            <div className={styles.web3BtnDiv}>
                <Web3Button
                contractAddress={nft_vault_contract}
                contractAbi={Vault.abi}
                action={() => withdraw(item.metadata.id)}
                className={styles.withdrawBtn}
                >
                Withdraw
                </Web3Button>
                <Web3Button
                contractAddress={nft_vault_contract}
                contractAbi={Vault.abi}
                action={() => borrow(item.metadata.id)}
                className={styles.borrowBtn}
                >
                Borrow
                </Web3Button>

                <Web3Button
                contractAddress={nft_vault_contract}
                contractAbi={Vault.abi}
                action={() => repay(item.metadata.id)}
                className={styles.repayBtn}
                >
                Repay
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
