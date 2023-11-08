"use client";
import {useEffect, useRef, useState} from "react";
import WalletAndMarket from "./WalletAndMarket";
import {PandaSigner} from "scrypt-ts";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import ItemViewWallet from "./ItemViewWallet";

export default function WindowTabs() {
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const signerRef = useRef<PandaSigner>();

  // useEffect(() => {
  //   const signer = signerRef.current as PandaSigner;
  //   console.log("signer in tabs", signer);
  //   if (signer) {
  //     setIsConnected(true);
  //   }
  // }, []);

  // const signer = signerRef.current as PandaSigner;

  return (
    <section className="h-screen w-screen flex items-center flex-col pt-[20-vh]">
      <WalletAndMarket />

      <Tabs defaultValue="wallet" className="w-full flex flex-col items-center">
        <TabsList>
          <TabsTrigger value="wallet">wallet</TabsTrigger>
          <TabsTrigger value="market">market</TabsTrigger>
        </TabsList>
        <TabsContent value="wallet">
          <ItemViewWallet />
        </TabsContent>
        <TabsContent value="market">Change your market here.</TabsContent>
      </Tabs>
    </section>
  );
}
