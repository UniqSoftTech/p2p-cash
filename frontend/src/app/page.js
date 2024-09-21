import dynamic from "next/dynamic";
import VirtualCard from "./assets/virtual_card.png";
import Background from "./assets/bg.jpg";
import WalletConnect from "./components/ConnectWallet";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative p-4 min-h-screen flex flex-col justify-between font-[family-name:var(--font-geist-sans)]">
      <header className="rounded-2xl p-4 flex justify-between items-center z-10 relative">
        <h1 className="text-white text-3xl font-bold">P2P Cash</h1>
      </header>

      <div className="relative flex-1 flex flex-col items-start justify-center z-10 px-16 gap-6">
        <h2 className="text-white text-center text-4xl sm:text-5xl md:text-4xl font-bold">
          P2P Payment Solution
        </h2>
        <p className="max-w-[550px]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
          vestibulum lacus non est laoreet, sit amet tempor lacus egestas. Proin
          ut lacus at ante blandit maximus.
        </p>
        <WalletConnect />
      </div>

      {/* Background Circle and Image */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="bg-neutral-800 overflow-hidden h-[1000px] border-2 border-neutral-800/60 w-[1000px] absolute right-[-300px] top-[-200px] rounded-full">
          <Image src={Background} className="w-full h-full" alt="bg" />
        </div>
        <Image
          src={VirtualCard}
          alt="Virtual Card"
          width={500}
          height={500}
          className="absolute hidden md:block right-10 top-20 max-w-[90%] md:max-w-none"
        />
      </div>
    </div>
  );
}
