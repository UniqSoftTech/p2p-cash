"use client";
import { useSDK } from "@metamask/sdk-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function App() {
  const { sdk, connected, connecting, account } = useSDK();
  console.log("🚀 ~ App ~ connected:", connected);
  console.log("🚀 ~ App ~ account:", account);
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState("");

  // Handle MetaMask connection
  const handleConnect = async () => {
    // if (!connected) {
    try {
      await sdk?.connect();
      setWalletAddress(account); // account is provided by useMetaMask hook
      router.push(`/home?walletAddress=${account}`);
    } catch (error) {
      console.error("Failed to connect:", error);
    }
    // } else {
    //   if (sdk) {
    //     await sdk.disconnect(); // Disconnect if already connected
    //     await sdk.terminate();
    //     setWalletAddress("");
    //   }
    // }
  };

  return (
    <div className="flex flex-col items-center justify-center text-white">
      <button
        onClick={handleConnect}
        className={`px-6 py-2 text-lg font-bold text-white rounded-full transition-all 
        ${"bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-pink-500 hover:to-indigo-500"} focus:outline-none shadow-lg transform hover:scale-105`}
      >
        {"Connect Wallet"}
      </button>
    </div>
  );
}

export default App;
