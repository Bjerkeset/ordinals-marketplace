import Link from "next/link";

export default function TopNavbar() {
  return (
    <nav className="w-full flex m-1 gap-2 justify-center">
      <div className=" py-1 px-2">
        <Link className="hover:underline" href="/">
          Home
        </Link>
      </div>
      <div className=" py-1 px-2">
        <Link className="hover:underline" href="/mint">
          Mint
        </Link>
      </div>
    </nav>
  );
}
