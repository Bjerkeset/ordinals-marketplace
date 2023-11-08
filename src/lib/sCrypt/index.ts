import {
  Addr,
  GorillapoolProvider,
  PandaSigner,
  Scrypt,
  ScryptProvider,
  bsv,
  sha256,
  toByteString,
} from "scrypt-ts";

import {HashLockNFT} from "@/contracts/hashLockNFT";
import {OrdiNFTP2PKH, OrdiProvider} from "scrypt-ord";
import artifact from "../../../artifacts/hashLockNFT.json";

HashLockNFT.loadArtifact(artifact);

export const inscribeNFT = async function (
  secretMessage: string,
  text: string
) {
  const provider = new GorillapoolProvider(bsv.Networks.testnet); // Similar to GorillaProvider
  const signer = new PandaSigner(provider);
  const {isAuthenticated, error} = await signer.requestAuth();
  if (!isAuthenticated) {
    throw new Error(error);
  }
  //   const text = "Test ordinals NFT 1.0";

  const message = toByteString(secretMessage, true);
  const hash = sha256(message);

  const instance = new HashLockNFT(hash);

  await instance.connect(signer);

  const inscriptionTx = await instance.inscribeText(text);
  console.log("Inscribed NFT: ", inscriptionTx.id);
};
