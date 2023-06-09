import { Web3Button, useAddress, useContract, useContractRead, useNFTs, ThirdwebNftMedia } from "@thirdweb-dev/react";
import NFT from './../artifacts/contracts/RAAC.sol/RAAC.json';
import Vault from './../artifacts/contracts/RAACVault.sol/RAACVault.json';
import styles from "../styles/Stake.module.css";

import ShowDebt from "../components/ShowDebt";
import UserCollection from "../components/UserCollection";
import VaultCollection from "../components/VaultCollection";

const nft_contract = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const nft_vault_contract = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export default function Stake() {

  const address = useAddress()
  console.log(address)

  return (
    <div className={styles.container}>
      <main>
        <div className={styles.currentInfo}>
          <ShowDebt />
        </div>
        <h3>Your Regna Minima NFTs</h3>
        <UserCollection />
        <h3 className={styles.vault}>Vaulted Regna Minima NFTs</h3>
        <VaultCollection />
      </main>
    </div>
  );
}
