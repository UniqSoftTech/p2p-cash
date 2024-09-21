"use client";

import { ethers } from "ethers";
import { useState } from "react";
import Web3Modal from "web3modal";

function App() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions: {},
  });

  // Function to connect/disconnect the wallet
  async function connectWallet() {
    if (!connected) {
      const instance = await web3Modal.connect();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const _walletAddress = await signer.getAddress();

      setConnected(true);
      setWalletAddress(_walletAddress);
    } else {
      setConnected(false);
      setWalletAddress("");
      web3Modal.clearCachedProvider();
    }
  }

  return (
    <div>
      <button onClick={connectWallet}>
        {connected ? "Disconnect Wallet" : "Connect Wallet"}
      </button>
      <h3>Address</h3>
      <h4>{walletAddress}</h4>
    </div>
  );
}

export default App;
