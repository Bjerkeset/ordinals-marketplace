"use client";

import {useEffect, useRef, useState} from "react";
import {
  Addr,
  GorillapoolProvider,
  PandaSigner,
  PubKey,
  UTXO,
  bsv,
  findSig,
} from "scrypt-ts";
import {Button} from "@/components/ui/button";
import {
  OneSatApis,
  OrdiMethodCallOptions,
  OrdiNFTP2PKH,
  OrdiProvider,
  Ordinal,
} from "scrypt-ord";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import ItemViewWallet from "./ItemViewWallet";
import {OrdinalLock} from "@/contracts/ordinalsMarketplace";
import ItemViewMarket from "./ItemViewMarket";

import artifact from "../../artifacts/ordinalsMarketplace.json";
OrdinalLock.loadArtifact(artifact);

export default function WalletAndMarket() {
  const signerRef = useRef<PandaSigner>();
  const [walletItems, setWalletItems] = useState([]);
  const [connectedOrdiAddress, setConnectedOrdiAddress] = useState(undefined);
  const [isConnected, setIsConnected] = useState(false);
  const [marketItems, setMarketItems] = useState([]);

  useEffect(() => {
    loadWalletItems();
  }, []);

  useEffect(() => {
    loadMarketItems();
  }, []);

  async function loadMarketItems() {
    // const signerRef = useRef<PandaSigner>();

    const marketItemsRaw = localStorage.getItem("marketItems");
    if (marketItemsRaw) {
      const marketItems = JSON.parse(marketItemsRaw);
      setMarketItems(marketItems);
    }
  }

  async function loadWalletItems() {
    const signer = signerRef.current as PandaSigner;

    if (signer) {
      try {
        const connectedOrdiAddress = await signer.getOrdAddress();
        setConnectedOrdiAddress(connectedOrdiAddress);

        const connectedOrdiAddressString = connectedOrdiAddress.toString();

        const url = `https://testnet.ordinals.gorillapool.io/api/txos/address/${connectedOrdiAddressString}/unspent?bsv20=false`;
        const response = await fetch(url);
        const data = await response.json();
        console.log("data", data);
        const filteredData = data.filter(
          (e) => e.origin.data.insc.file.type !== "application/bsv-20"
        );
        // .filter((e) => marketItems[e.origin.outpoint] == undefined);

        console.log("filteredData", filteredData);
        setWalletItems(filteredData);
      } catch (error) {
        console.error(error);
      }
    }
  }

  function storeMarketItem(
    ordLockTx: bsv.Transaction,
    price: number,
    seller: string,
    item: any
  ) {
    let marketItems: any = localStorage.getItem("marketItems");
    if (!marketItems) {
      marketItems = {};
    } else {
      marketItems = JSON.parse(marketItems);
    }

    marketItems[item.origin.outpoint] = {
      txId: ordLockTx.id,
      vout: 0,
      price: price,
      item: item,
    };
    localStorage.setItem("marketItems", JSON.stringify(marketItems));
    setMarketItems(marketItems);
  }

  function removeStoredMarketItem(originOutpoint: string) {
    let marketItems: any = localStorage.getItem("marketItems");
    if (!marketItems) {
      marketItems = {};
    } else {
      marketItems = JSON.parse(marketItems);
    }

    delete marketItems[originOutpoint];

    localStorage.setItem("marketItems", JSON.stringify(marketItems));
    setMarketItems(marketItems);
  }

  const handleConnect = async () => {
    // const provider = new OrdiProvider(bsv.Networks.testnet);
    const provider = new GorillapoolProvider(bsv.Networks.testnet);
    const signer = new PandaSigner(provider);

    signerRef.current = signer;
    const {isAuthenticated, error} = await signer.requestAuth();
    if (!isAuthenticated) {
      throw new Error(`Unauthenticated: ${error}`);
    }

    setConnectedOrdiAddress(await signer.getOrdAddress());
    setIsConnected(true);
    loadWalletItems();
  };

  const handleList = async (idx: number, priceSats: number) => {
    const signer = signerRef.current as PandaSigner;

    const item = walletItems[idx];
    const outpoint = item.outpoint;

    // Represents the existing Ordinal already on the on-chain in our wallet.  // Create a P2PKH object from a UTXO.
    OneSatApis.setNetwork(bsv.Networks.testnet);
    const utxo: UTXO = await OneSatApis.fetchUTXOByOutpoint(outpoint);
    const p2pkh = OrdiNFTP2PKH.fromUTXO(utxo);

    // Represents the next iteration, which is an OrdinalLock contract. // Construct recipient smart contract - the ordinal lock.
    const ordPubKey = await signer.getOrdPubKey();
    const seller = PubKey(ordPubKey.toByteString());
    const amount = BigInt(priceSats);

    const ordLock = new OrdinalLock(seller, amount);
    await ordLock.connect(signer);

    // Unlock deployed ordinal output. // Unlock deployed NFT and send it to the recipient ordinal lock contract.
    await p2pkh.connect(signer);
    const {tx: transferTx} = await p2pkh.methods.unlock(
      (sigResp) => findSig(sigResp, ordPubKey),
      seller,
      {
        transfer: ordLock,
        pubKeyOrAddrToSign: ordPubKey,
      } as OrdiMethodCallOptions<OrdiNFTP2PKH>
    );
    console.log("Transfered NFT: ", transferTx.id);

    // Store reference in local storage.
    storeMarketItem(transferTx, priceSats, seller, item);
  };

  const handleBuy = async (marketItem: any) => {
    const signer = signerRef.current as PandaSigner;
    await signer.connect();

    const tx = await signer.provider.getTransaction(marketItem.txId); //Fetch tx of deployed ordinal lock.
    const instance = OrdinalLock.fromTx(tx, 0); // Create an smart contract instance from the tx. 0 = output index.
    await instance.connect(signer);

    const buyerPublicKey = await signer.getOrdPubKey();
    const receiverAddr = Addr(buyerPublicKey.toAddress().toByteString());

    const callRes = await instance.methods.purchase(receiverAddr);
    console.log("callRes TX: ", callRes.tx);

    // Remove reference from local storage.
    removeStoredMarketItem(marketItem.item.origin.outpoint);
  };

  const handleCancel = async (marketItem: any) => {
    const signer = signerRef.current as PandaSigner;
    await signer.connect();

    const tx = await signer.provider.getTransaction(marketItem.txId); //Fetch tx of deployed ordinal lock.
    const instance = OrdinalLock.fromTx(tx, 0); // Create an smart contract instance from the tx. 0 = output index.

    await instance.connect(signer);

    const sellerPublicKey = await signer.getOrdPubKey(); // Get the public key of the seller.

    const callRes = await instance.methods.cancel(
      (sigResps) => findSig(sigResps, sellerPublicKey),
      {
        pubKeyOrAddrToSign: sellerPublicKey,
      } as OrdiMethodCallOptions<OrdinalLock>
    );
    console.log("callRes TX: ", callRes.tx);

    // Remove reference from local storage.
    removeStoredMarketItem(marketItem.item.origin.outpoint);
  };

  return (
    <div className="">
      {isConnected ? (
        <div className="">You are connected</div>
      ) : (
        <div className="">
          <Button onClick={handleConnect}>Connect Panda Wallet</Button>
        </div>
      )}
      <Tabs defaultValue="wallet" className="w-full flex flex-col items-center">
        <TabsList>
          <TabsTrigger value="wallet">wallet</TabsTrigger>
          <TabsTrigger value="market">market</TabsTrigger>
        </TabsList>
        <TabsContent value="wallet">
          {walletItems.map((item, idx) => {
            return (
              <ItemViewWallet
                key={idx}
                item={item}
                idx={idx}
                onList={handleList}
              />
            );
          })}
        </TabsContent>
        <TabsContent value="market">
          {Object.entries(marketItems).map(([key, val], idx) => {
            const isMyListing = val.item.owner == connectedOrdiAddress;
            return (
              <ItemViewMarket
                key={idx}
                marketItem={val}
                idx={idx}
                isMyListing={isMyListing}
                onBuy={handleBuy}
                onCancel={handleCancel}
              />
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
