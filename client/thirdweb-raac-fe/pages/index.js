import { useAddress } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";

export default function Home() {

  const address = useAddress()
  console.log(address)

  return (
    <div className={styles.container}>
      <main className={styles.main}>
      </main>
    </div>
  );
}
