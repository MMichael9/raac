import { useAddress } from "@thirdweb-dev/react";

export default function Stake() {

  const address = useAddress()
  console.log(address)

  return (
    <div>
      <main>
        Stake
      </main>
    </div>
  );
}
