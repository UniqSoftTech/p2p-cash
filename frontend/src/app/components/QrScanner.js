"use client";

import React, { useState, useRef } from "react";
import { useZxing } from "react-zxing";
import { parseSGQR } from "./SGQRParser"; // Import SGQRParser

const QrScanner = () => {
  const [result, setResult] = useState("");
  const videoRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [parseData, setParseData] = useState("");

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
          className="rounded-lg shadow-lg w-full h-auto"
        />
      </div>

      <p className="text-center text-sm sm:text-base md:text-lg text-gray-400">
        <span className="font-bold">Last result:</span>
        <pre className="bg-gray-900 p-2 rounded-md text-white whitespace-pre-wrap max-w-xs md:max-w-md lg:max-w-lg overflow-auto">
          {result || "Please scan the QR code..."}
        </pre>
      </p>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-md">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-xl shadow-xl max-w-md w-full border border-blue-500/50">
            <h2 className="text-2xl font-extrabold mb-6 text-white tracking-wide text-center">
              Enter Amount
            </h2>
            <form onSubmit={handleSubmit}>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 border border-gray-700 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all duration-200 ease-in-out placeholder-gray-400 text-lg"
                placeholder="Enter amount"
                required
              />
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-500 hover:shadow-blue-500/50 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
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
