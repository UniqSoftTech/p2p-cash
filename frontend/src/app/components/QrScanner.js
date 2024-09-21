"use client";

import React, { useState } from 'react';
import { useZxing } from 'react-zxing';
import { parseSGQR } from './SGQRParser'; // Import SGQRParser

const QrScanner = () => {
    const [result, setResult] = useState("");

    const { ref } = useZxing({
      onDecodeResult(result) {
        const qrData = result.getText();
        console.log("qrData", qrData);
        const parsedData = parseSGQR(qrData); // Use SGQRParser to parse the QR data
        setResult(JSON.stringify(parsedData, null, 2)); // Convert parsed data to formatted JSON string

        // Send parsed data to backend server
        sendToBackend(parsedData);
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

    return (
        <>
          <video ref={ref} />
          <p>
            <span>Last result:</span>
            <pre>{result}</pre>
          </p>
        </>
      );
};

export default QrScanner;
