"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [paymentRequest, setPaymentRequest] = useState(null);

  useEffect(() => {
    setPaymentRequest({
      qrcode: 'test'
    });
  }, []);

  const handleAccept = async () => {
    if (paymentRequest && paymentRequest.qrcode) {
      try {
        await PaymentModule.openPaymentApp(paymentRequest.qrcode);
      } catch (error) {
        console.error('Failed to open payment app:', error);
        // Fallback to opening the App Store
        window.location.href = 'https://apps.apple.com/app/dbs-digibank';
      }
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
        {paymentRequest && (
          <div>
            <p>Payment request received</p>
            <button onClick={handleAccept}>Accept Payment</button>
          </div>
        )}
      </main>
    </div>
  );
}