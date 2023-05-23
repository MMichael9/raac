import Link from "next/link";
import styles from "../styles/Navbar.module.css";
import { ConnectWallet } from "@thirdweb-dev/react";

export default function Navbar() {

  return (
    <div className={styles.navbar}>
        <ConnectWallet />
        <Link href="/">Home</Link>
        <Link href="/mint">Mint</Link>
        <Link href="/collection">View Collection</Link>
        <Link href="/stake">Stake</Link>
    </div>
  );
}