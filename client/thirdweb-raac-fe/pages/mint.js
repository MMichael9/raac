import { useAddress } from "@thirdweb-dev/react";

export default function Mint() {

  const address = useAddress()
  console.log(address)

  return (
    <div>
      <main>
        Mint
      </main>
    </div>
  );
}
