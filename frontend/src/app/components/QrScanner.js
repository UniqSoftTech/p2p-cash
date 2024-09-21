"use client";

import React, { useState, useRef } from "react";
import { useZxing } from "react-zxing";
import { parseSGQR } from "./SGQRParser"; // Import SGQRParser

const QrScanner = () => {
  const [result, setResult] = useState("");
  const videoRef = useRef(null);

  const { ref: zxingRef } = useZxing({
    onDecodeResult(result) {
      const qrData = result.getText();
      console.log("qrData", qrData);
      const parsedData = parseSGQR(qrData); // Use SGQRParser to parse the QR data
      setResult(JSON.stringify(parsedData, null, 2)); // Convert parsed data to formatted JSON string

      // Send parsed data to backend server
      sendToBackend(parsedData);
      captureAndUploadImage();
    },
  });

  const sendToBackend = async (data) => {
    try {
      const response = await fetch(
        "https://seahorse-app-fejfa.ondigitalocean.app/api/qr-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
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
    </div>
  );
};

export default QrScanner;
