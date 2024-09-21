"use client";

import React, { useState, useRef } from 'react';
import { useZxing } from 'react-zxing';
import { parseSGQR } from './SGQRParser'; // Import SGQRParser

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
        const response = await fetch('https://seahorse-app-fejfa.ondigitalocean.app/api/qr-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to send data to server');
        }

        console.log('Data sent successfully');
      } catch (error) {
        console.error('Error sending data to server:', error);
      }
    };

    const captureAndUploadImage = async () => {
      if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
        
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
        const formData = new FormData();
        formData.append('image', blob, 'qr_image.jpg');

        try {
          const response = await fetch('https://seahorse-app-fejfa.ondigitalocean.app/api/upload-image', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to upload image');
          }

          console.log('Image uploaded successfully');
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    };

    return (
        <>
          <video 
            ref={(el) => { 
              videoRef.current = el;
              if (el && zxingRef) {
                zxingRef.current = el;
              }
            }} 
          />
          <p>
            <span>Last result:</span>
            <pre>{result}</pre>
          </p>
        </>
      );
};

export default QrScanner;
