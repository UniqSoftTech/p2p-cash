"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";

export default function Home() {
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Polling...");
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    const pollInterval = 5000; // Poll every 5 seconds
    let pollTimer;

    const pollData = async () => {
      try {
        const response = await fetch(
          "https://seahorse-app-fejfa.ondigitalocean.app/api/poll-data",
        );
        if (response.status === 200) {
          const data = await response.json();
          setPaymentRequest(data);
          setConnectionStatus("Data received");
          console.log("Payment request received:", data);

          // Set image source if available
          if (data.image && data.image.filename) {
            setImageSrc(data.image.url);
          }
        } else if (response.status === 204) {
          setConnectionStatus("No new data");
          // Remove this line to keep the existing paymentRequest
          // setPaymentRequest(null);
        }
      } catch (error) {
        console.error("Polling error:", error);
        setConnectionStatus("Connection error. Retrying...");
      }
    };

    const startPolling = () => {
      pollData(); // Initial poll
      pollTimer = setInterval(pollData, pollInterval);
    };

    startPolling();

    return () => {
      if (pollTimer) {
        clearInterval(pollTimer);
      }
    };
  }, []);

  const handleAccept = async () => {
    if (paymentRequest && paymentRequest.qrcode) {
      try {
        const iosAppUrl = `com.dbs.sg.dbsmbanking://`;
        window.location.href = iosAppUrl;
      } catch (error) {
        console.error("Failed to open payment app:", error);
        // Fallback to opening the App Store
        window.location.href =
          "https://apps.apple.com/app/com.dbs.sg.dbsmbanking";
      }
    }
  };

  const handleSaveImage = () => {
    if (imageSrc) {
      const link = document.createElement("a");
      link.href = imageSrc;
      link.download = "qr_image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center py-10">
      <Head>
        <title>Web3 Agent - Accept Payment</title>
        <meta
          name="description"
          content="Web3 Agent app for accepting payments"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full max-w-3xl text-center space-y-6">
        <h1 className="text-4xl font-extrabold tracking-wide bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Payment Agent
        </h1>
        <p className="text-lg text-gray-400">
          Connection status: {connectionStatus}
        </p>

        {paymentRequest && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Payment Request Details</h2>
            <div className="space-y-2">
              <p className="text-xl">
                Amount:{" "}
                <span className="text-blue-400">
                  {paymentRequest.amount} {paymentRequest.currency}
                </span>
              </p>
              <p className="text-xl">
                Recipient:{" "}
                <span className="text-blue-400">
                  {paymentRequest.recipient}
                </span>
              </p>
              <p className="text-lg text-gray-400">
                Description: {paymentRequest.description}
              </p>
            </div>

            {imageSrc && (
              <div className="mt-6">
                <Image
                  src={imageSrc}
                  alt="Payment QR"
                  width={300}
                  height={300}
                  className="mx-auto rounded-lg border border-gray-600"
                />
                <button
                  onClick={handleSaveImage}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 focus:ring-4 focus:ring-blue-300"
                >
                  Save QR Image
                </button>
              </div>
            )}

            <button
              onClick={handleAccept}
              className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 focus:ring-4 focus:ring-purple-300 transition-all duration-300"
            >
              Accept Payment
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
