"use client";

import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider"; // Import WalletConnect
import useWalletAddress from "../hooks/useWallet";
import { useRouter } from "next/navigation";

function App() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [web3Modal, setWeb3Modal] = useState(null);
  const { storeWalletAddress } = useWalletAddress();
  const router = useRouter(); // Get the router instance

  useEffect(() => {
    if (typeof window !== "undefined") {
      const providerOptions = {
        walletconnect: {
          package: WalletConnectProvider, // required
          options: {
            infuraId: "YOUR_INFURA_PROJECT_ID", // Required for WalletConnect (replace with your Infura ID)
          },
        },
      };

      const modal = new Web3Modal({
        cacheProvider: false,
        providerOptions, // Add WalletConnect options
      });
      setWeb3Modal(modal);
    }
  }, []);

  // Function to connect/disconnect the wallet
  async function connectWallet() {
    if (typeof window !== "undefined") {
      if (!connected) {
        try {
          const instance = await web3Modal.connect();
          const provider = new ethers.BrowserProvider(instance);
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
        setConnected(false);
        setWalletAddress("");
        storeWalletAddress("");
        web3Modal.clearCachedProvider(); // Clear cache to allow re-connection
      }
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
