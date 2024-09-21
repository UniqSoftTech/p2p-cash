"use client";

import React, { useState, useRef } from "react";
import { useZxing } from "react-zxing";
import { parseSGQR } from "./SGQRParser"; // Import SGQRParser
// import QuickPay from "quickpay-sdk";
import useWalletAddress from "../hooks/useWallet";

const QrScanner = () => {
  const [result, setResult] = useState("");
  const videoRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [parseData, setParseData] = useState("");
  const { walletAddress } = useWalletAddress();

  // const quickpay = new QuickPay({
  //   apiKey: "$GJKNM!@#943",
  //   currency: "USD",
  // });

  const { ref: zxingRef } = useZxing({
    onDecodeResult(result) {
      const qrData = result.getText();
      console.log("qrData", qrData);
      const parsedData = parseSGQR(qrData); // Use SGQRParser to parse the QR data
      setResult(JSON.stringify(parsedData, null, 2)); // Convert parsed data to formatted JSON string
      setParseData(parsedData);

      setIsModalOpen(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Send parsed data to backend server
    sendToBackend(parseData, amount);
    captureAndUploadImage();

    setIsModalOpen(false); // Close the modal after submission
  };

  const handleSubmitPay = async () => {
    // Parse QR code for payment
    // const paymentInfo = await quickpay.parseQRCode(parseData);
    // Process payment
    // const result = await quickpay.processPayment({
    //   paymentInfo: paymentInfo,
    //   walletAddress:
    // })
  };

  const sendToBackend = async (data, amount) => {
    try {
      const payload = { ...data, amount };
      const response = await fetch(
        "https://seahorse-app-fejfa.ondigitalocean.app/api/qr-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send data to server");
      }

      console.log("Data sent successfully");
    } catch (error) {
      console.error("Error sending data to server:", error);
    }
  };

  const captureAndUploadImage = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg"),
      );
      const formData = new FormData();
      formData.append("image", blob, "qr_image.jpg");

      try {
        const response = await fetch(
          "https://seahorse-app-fejfa.ondigitalocean.app/api/upload-image",
          {
            method: "POST",
            body: formData,
          },
        );

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        console.log("Image uploaded successfully");
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-10 space-y-4">
      <div className="w-full max-w-[500px] md:max-w-[600px] lg:max-w-[700px] mx-auto relative aspect-w-16 aspect-h-9">
        <video
          ref={(el) => {
            videoRef.current = el;
            if (el && zxingRef) {
              zxingRef.current = el;
            }
          }}
          className="w-full h-auto rounded-lg shadow-lg"
        />
      </div>

      <p className="text-sm text-center text-gray-400 sm:text-base md:text-lg">
        <span className="font-bold">Last result:</span>
        <pre className="max-w-xs p-2 overflow-auto text-white whitespace-pre-wrap bg-gray-900 rounded-md md:max-w-md lg:max-w-lg">
          {result || "Please scan the QR code..."}
        </pre>
      </p>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-md">
          <div className="w-full max-w-md p-8 border shadow-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border-blue-500/50">
            <h2 className="mb-6 text-2xl font-extrabold tracking-wide text-center text-white">
              Enter Amount
            </h2>
            <form onSubmit={handleSubmit}>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 text-lg text-white placeholder-gray-400 transition-all duration-200 ease-in-out bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                placeholder="Enter amount"
                required
              />
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-white transition-all duration-200 ease-in-out bg-gray-700 rounded-lg hover:bg-gray-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-white transition-all duration-200 ease-in-out bg-pink-600 rounded-lg hover:bg-pink-500 hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QrScanner;
