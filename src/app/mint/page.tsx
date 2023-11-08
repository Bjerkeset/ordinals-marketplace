import InscribeNFT from "@/components/InscribeNFT";
import MintForm from "@/components/MintForm";

export default function page() {
  return (
    <div className="flex flex-col items-center max-w-7xl">
      <InscribeNFT />
      <MintForm />
    </div>
  );
}
