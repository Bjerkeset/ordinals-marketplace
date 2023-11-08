"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import {use, useEffect, useState} from "react";
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {Label} from "./ui/label";

interface ItemProps {
  marketItem: any;
  idx: number;
  isMyListing: boolean;
  onBuy: (marketItem: any) => void;
  onCancel: (marketItem: any) => void;
}

export default function ItemViewMarket({
  marketItem,
  idx,
  isMyListing,
  onBuy,
  onCancel,
}: ItemProps) {
  const [textData, setTextData] = useState<string | null>(null);

  useEffect(() => {
    if (marketItem.item.origin.data.insc.file.type === "text/plain") {
      const url = `https://testnet.ordinals.gorillapool.io/content/${marketItem.item.origin.outpoint}`;
      fetch(url)
        .then((response) => response.text())
        .then((data) => {
          setTextData(data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [marketItem]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        {/* If the NFT is an image */}
        {marketItem.item.origin.data.insc.file.type.startsWith("image/") && (
          <Image
            src={`https://testnet.ordinals.gorillapool.io/content/${marketItem.item.origin.outpoint}`}
            alt={`Content #${marketItem.item.origin.num}`}
            width={250}
            height={250}
          />
        )}
        {/* If the NFT is text */}
        {marketItem.item.origin.data.insc.file.type === "text/plain" && (
          <p>{textData || "loading..."}</p>
        )}
        {marketItem.item.origin.num ? (
          <p className="text-muted-foreground">
            #{marketItem.item.origin.num}{" "}
          </p>
        ) : (
          <div>
            <p className="text-muted-foreground">Pending...</p>
            <p className="text-muted-foreground text-sm">
              Displayed when included in a block
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <b>Price:</b> <p> {marketItem.price / 10 ** 8} BSV</p>
        {isMyListing ? (
          <Button onClick={() => onCancel(marketItem)}>Cancel</Button>
        ) : (
          <Button onClick={() => onBuy(marketItem)}>Buy</Button>
        )}
      </CardFooter>
    </Card>
  );
}
