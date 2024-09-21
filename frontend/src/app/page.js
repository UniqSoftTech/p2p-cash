"use client";
import dynamic from "next/dynamic";
import VirtualCard from "./assets/virtual_card.png";
import Background from "./assets/bg.jpg";
import Logo from "./assets/sgqr.png";
import WalletConnect from "./components/ConnectWallet";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative p-4 min-h-screen flex flex-col justify-between font-[family-name:var(--font-geist-sans)]">
      <header className="relative z-10 flex items-center justify-center p-4 md:justify-between rounded-2xl">
        <Image
          src={Logo}
          alt="logo"
          width={200}
          height={150}
          className="items-center justify-center"
        />
      </header>

      {/* Main content */}
      <div className="relative flex flex-col items-start justify-center flex-1 gap-6 px-16">
        <h2 className="text-4xl font-bold text-center text-white sm:text-5xl md:text-4xl">
          P2P Payment Solution
        </h2>
        <p className="max-w-[550px] text-white">
          Connect your wallet and experience seamless payments! Simply scan the
          SG QR code to make instant transactions. Your next step into the
          future of payments starts here.
        </p>
        <div className="relative z-30">
          <WalletConnect />
        </div>
      </div>

      {/* Background Circle and Image */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="bg-neutral-800 overflow-hidden h-[1000px] border-2 border-neutral-800/60 w-[1000px] absolute right-[-300px] top-[-200px] rounded-full z-[-10]">
          <Image src={Background} className="w-full h-full" alt="bg" />
        </div>
        <Image
          src={VirtualCard}
          alt="Virtual Card"
          width={500}
          height={500}
          className="absolute hidden md:block right-10 top-20 max-w-[90%] md:max-w-none z-10"
        />
      </div>
    </div>
  );
}
