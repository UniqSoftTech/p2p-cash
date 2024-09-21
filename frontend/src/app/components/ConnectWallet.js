"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { MetaMaskSDK } from "@metamask/sdk"; // Import MetaMask SDK
import useWalletAddress from "../hooks/useWallet"; // Custom hook to store wallet address

function App() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const { storeWalletAddress } = useWalletAddress();
  const router = useRouter(); // Router instance

  useEffect(() => {
    // Initialize MetaMask SDK for both web and mobile
    const MMSDK = new MetaMaskSDK({
      injectProvider: true, // Inject MetaMask provider
      useDeeplink: true, // Automatically handle deep links for mobile
    });

    const ethereum = MMSDK.getProvider(); // MetaMask Provider
    window.ethereum = ethereum; // Set it globally
  }, []);

  // Function to connect/disconnect the MetaMask wallet
  async function connectWallet() {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = await provider.getSigner();
        const _walletAddress = await signer.getAddress();

        setConnected(true);
        setWalletAddress(_walletAddress);
        storeWalletAddress(_walletAddress);
        router.push(`/home?walletAddress=${_walletAddress}`);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install it to continue.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center text-white">
      <button
        onClick={connectWallet}
        className={`px-6 py-2 text-lg font-bold text-white rounded-full transition-all 
        ${
          connected
            ? "bg-red-500 hover:bg-red-600"
            : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-pink-500 hover:to-indigo-500"
        } focus:outline-none shadow-lg transform hover:scale-105`}
      >
        {connected ? "Disconnect Wallet" : "Connect Wallet"}
      </button>
    </div>
  );
}

export default App;
