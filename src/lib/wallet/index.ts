import {OrdiProvider} from "scrypt-ord";
import {PandaSigner, bsv} from "scrypt-ts";

export async function loadWalletItems() {
  const provider = new OrdiProvider(bsv.Networks.testnet);
  const signer = new PandaSigner(provider);
  console.log("signer", signer);
  const connectedOrdiAddress = await signer.getOrdAddress();
  console.log("connectedOrdiAddress", connectedOrdiAddress);

  if (signer) {
    try {
      const connectedOrdiAddressString = connectedOrdiAddress.toString();
      console.log("connectedOrdiAddressString", connectedOrdiAddressString);
      const url = `https://testnet.ordinals.gorillapool.io/api/txos/address/${connectedOrdiAddressString}/unspent?bsv20=false`;
      const response = await fetch(url);
      const data = await response.json();
      console.log("data", data);
      const filteredData = data.filter(
        (e) => e.origin.data.insc.file.type !== "application/bsv-20"
      );
      console.log("filteredData", filteredData);
      //   .filter((e) => marketItems[e.origin.outpoint] == undefined);
      //   setWalletItems(filteredData);
    } catch (error) {
      console.error(error);
    }
  }
}
