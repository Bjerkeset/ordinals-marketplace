"use client";
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
import {Button} from "./ui/button";
import {HashLockNFT} from "@/contracts/hashLockNFT";
import {OrdiNFTP2PKH, OrdiProvider} from "scrypt-ord";
import artifact from "../../artifacts/hashLockNFT.json";
HashLockNFT.loadArtifact(artifact);

export default function MintNFT() {
  const inscribeNFT = async function () {
    const provider = new GorillapoolProvider(bsv.Networks.testnet); // Similar to GorillaProvider
    const signer = new PandaSigner(provider);
    const {isAuthenticated, error} = await signer.requestAuth();
    if (!isAuthenticated) {
      throw new Error(error);
    }

    const text = "Test ordinals NFT 1.0";

    const message = toByteString("secret string", true);
    const hash = sha256(message);

    const instance = new HashLockNFT(hash);

    await instance.connect(signer);

    const inscriptionTx = await instance.inscribeText(text);
    console.log("Inscribed NFT: ", inscriptionTx.id);
  };

  ///////////////Transfere NFT//////////////
  async function transferNFT() {
    const txId =
      "d9c510cb3f80cebd5510ab4e75d16b4e6ee957d3485383c4896e5865e5794cd4";
    const atOutputIndex = 0;

    const provider = new GorillapoolProvider(bsv.Networks.testnet);
    const signer = new PandaSigner(provider);
    console.log("signer: ", signer);
    const {isAuthenticated, error} = await signer.requestAuth();
    if (!isAuthenticated) {
      throw new Error(error);
    }
    await signer.connect(provider);

    const tx = await signer.connectedProvider.getTransaction(txId);

    const instance = HashLockNFT.fromTx(tx, atOutputIndex);
    console.log("instance: ", instance);
    await instance.connect(signer);

    const message = toByteString("secret string", true);
    let recipientAddress = await signer.getOrdAddress();
    console.log("Recipient Address string: ", recipientAddress.toString());

    const {tx: transferTx} = await instance.methods.unlock(message, {
      transfer: new OrdiNFTP2PKH(Addr(recipientAddress.toByteString())),
    });

    console.log("Transferred NFT: ", transferTx.id);
    return transferTx.id;
  }

  ///////////View NFTs////////////
  const viewNFTs = async function () {
    const provider = new GorillapoolProvider(bsv.Networks.testnet); // Similar to GorillaProvider
    const signer = new PandaSigner(provider);
    console.log("signer: ", signer);
    const {isAuthenticated, error} = await signer.requestAuth();
    if (!isAuthenticated) {
      throw new Error(error);
    }
    let ordinalsCollection = await signer.getOrdinals();
    console.log("ordinalsCollection: ", ordinalsCollection);
  };

  return (
    <div>
      <Button onClick={inscribeNFT}>Inscribe</Button>
      <Button onClick={transferNFT}>Send NFT</Button>
      <Button onClick={viewNFTs}>Get Ordinals Collection</Button>
    </div>
  );
}
