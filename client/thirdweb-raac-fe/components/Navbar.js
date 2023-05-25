import Link from "next/link";
import styles from "../styles/Navbar.module.css";
import { ConnectWallet } from "@thirdweb-dev/react";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">RAAC</Link>
      </div>
      <div className={styles.links}>
        <Link href="/mint">Mint</Link>
        <Link href="/stake">Stake</Link>
        <Link href="/list">List</Link>
      </div>
      <div className={styles.actions}>
        <ConnectWallet />
      </div>
    </nav>
  );
}
