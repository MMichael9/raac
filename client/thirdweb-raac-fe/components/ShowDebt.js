import { Web3Button, useAddress, useContract, useContractRead, useNFTs, ThirdwebNftMedia } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import NFT from './../artifacts/contracts/RAAC.sol/RAAC.json';
import Vault from './../artifacts/contracts/RAACVault.sol/RAACVault.json';
import styles from "../styles/ShowDebt.module.css";

import UserCollection from "../components/UserCollection";
import VaultCollection from "../components/VaultCollection";

const nft_contract = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const nft_vault_contract = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export default function ShowDebt() {

  const address = useAddress()

  const { contract } = useContract(nft_vault_contract, Vault.abi);

  // Read contract with arguments
  const { data, isLoading, error } = useContractRead(contract, "debts", [address]);

  if (error) {
    console.error("failed to read contract", error);
  }

  return (
    <div>{isLoading ? <p>Loading...</p> : <p>Total Debt: {ethers.utils.formatEther(data._hex)} ETH</p>}</div>
  );
}
