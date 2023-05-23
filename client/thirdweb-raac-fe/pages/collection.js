import { useAddress } from "@thirdweb-dev/react";

export default function Collection() {

  const address = useAddress()
  console.log(address)

  return (
    <div>
      <main>
        Collection
      </main>
    </div>
  );
}
