import { useAddress } from "@thirdweb-dev/react";

export default function List() {

  const address = useAddress()
  console.log(address)

  return (
    <div>
      <main>
        List
      </main>
    </div>
  );
}
