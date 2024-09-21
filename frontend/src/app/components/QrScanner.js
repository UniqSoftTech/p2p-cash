"use client";

import React, { useState } from 'react';
import { useZxing } from 'react-zxing';
import { parseSGQR } from './SGQRParser'; // Import SGQRParser

const QrScanner = () => {
    const [result, setResult] = useState("");
    const { ref } = useZxing({
      onDecodeResult(result) {
        const qrData = result.getText();
        console.log("qrData", qrData)
        const parsedData = parseSGQR(qrData); // Use SGQRParser to parse the QR data
        setResult(JSON.stringify(parsedData, null, 2)); // Convert parsed data to formatted JSON string
      },
    });

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
