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
  item: any;
  idx: number;
  onList: (idx: number, priceSats: number) => void;
}

export default function ItemViewWallet({item, idx, onList}: ItemProps) {
  const [textData, setTextData] = useState<string | null>(null);
  const [isListing, setIsLising] = useState<boolean>(false);
  const [price, setPrice] = useState<string>("");

  useEffect(() => {
    if (item.origin.data.insc.file.type === "text/plain") {
      const url = `https://testnet.ordinals.gorillapool.io/content/${item.origin.outpoint}`;
      fetch(url)
        .then((response) => response.text())
        .then((data) => {
          setTextData(data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [item]);

  //Intermediary function to handle price input.
  const handleListForSale = async () => {
    if (isListing) {
      const priceFloat = parseFloat(price);
      if (!isNaN(priceFloat) && priceFloat >= 0.00000001) {
        const priceSats = Math.round(priceFloat * 10 ** 8);
        onList(idx, priceSats);
        setIsLising(false);
        setPrice("");
      } else {
        console.error("Invalid price entered");
      }
    } else {
      setIsLising(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        {/* If the NFT is an image */}
        {item.origin.data.insc.file.type.startsWith("image/") && (
          <Image
            src={`https://testnet.ordinals.gorillapool.io/content/${item.origin.outpoint}`}
            alt={`Content #${item.origin.num}`}
            width={250}
            height={250}
          />
        )}
        {/* If the NFT is text */}
        {item.origin.data.insc.file.type === "text/plain" && (
          <p>{textData || "loading..."}</p>
        )}
        {item.origin.num ? (
          <p className="text-muted-foreground">#{item.origin.num} </p>
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
        {isListing && (
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="price">Set Price "bsv"</Label>
            <Input
              type="number"
              id="price"
              placeholder=""
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        )}
        <Button className="mt-auto mx-1" onClick={handleListForSale}>
          {isListing ? "confirm" : "List For Sale"}
        </Button>
      </CardFooter>
    </Card>
  );
}
