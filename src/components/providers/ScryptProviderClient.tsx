"use client";
import {OrdinalLock} from "@/contracts/ordinalsMarketplace";
import artifact from "../../../artifacts/ordinalsMarketplace.json";

export default function ScryptProviderClient() {
  OrdinalLock.loadArtifact(artifact);
  return <></>;
}
