import { useState } from "react";

// Hook to store and retrieve wallet address
export default function useWalletAddress() {
  const [walletAddress, setWalletAddress] = useState("");

  const storeWalletAddress = (address) => {
    setWalletAddress(address);
  };

  return { walletAddress, storeWalletAddress };
}
