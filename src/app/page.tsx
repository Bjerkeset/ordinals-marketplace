// "use client";
import InscribeNFT from "@/components/InscribeNFT";
import WalletAndMarket from "@/components/WalletAndMarket";
import {Button} from "@/components/ui/button";
// import {loadWalletItems} from "@/lib/wallet";

export default function Home() {
  const handleClick = async () => {
    console.log("clicked");
    // loadWalletItems();
  };
  return (
    <main>
      <WalletAndMarket />
      {/* <Button onClick={handleClick}></Button> */}
    </main>
  );
}
