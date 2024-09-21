"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Polling...');
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    const pollInterval = 5000; // Poll every 5 seconds
    let pollTimer;

    const pollData = async () => {
      try {
        const response = await fetch('https://seahorse-app-fejfa.ondigitalocean.app/api/poll-data');
        if (response.status === 200) {
          const data = await response.json();
          setPaymentRequest(data);
          setConnectionStatus('Data received');
          console.log('Payment request received:', data);
          
          // Set image source if available
          if (data.image && data.image.filename) {
            setImageSrc(`https://seahorse-app-fejfa.ondigitalocean.app/uploads/${data.image.filename}`);
          }
        } else if (response.status === 204) {
          setConnectionStatus('No new data');
          // Remove this line to keep the existing paymentRequest
          // setPaymentRequest(null);
        }
      } catch (error) {
        console.error('Polling error:', error);
        setConnectionStatus('Connection error. Retrying...');
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
        console.error('Failed to open payment app:', error);
        // Fallback to opening the App Store
        window.location.href = 'https://apps.apple.com/app/com.dbs.sg.dbsmbanking';
      }
    }
  };

  const handleSaveImage = () => {
    if (imageSrc) {
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = 'payment_image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      <Head>
        <title>Agent - Home</title>
        <meta name="description" content="Agent app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1>Welcome to Agent</h1>
        <p>Connection status: {connectionStatus}</p>
        {paymentRequest && (
          <div>
            <h2>Payment Request Details</h2>
            <p>Amount: {paymentRequest.amount}</p>
            <p>Currency: {paymentRequest.merchantId}</p>
            <p>Recipient: {paymentRequest.recipient}</p>
            <p>Description: {paymentRequest.description}</p>
            {imageSrc && (
              <div>
                <Image src={imageSrc} alt="Payment Image" width={300} height={300} />
                <button onClick={handleSaveImage}>Save Image</button>
              </div>
            )}
            <button onClick={handleAccept}>Accept Payment</button>
          </div>
        )}
      </main>
    </div>
  );
}