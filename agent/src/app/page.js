"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  useEffect(() => {
    let socket;
    setPaymentRequest({
      qrcode: 'https://seahorse-app-fejfa.ondigitalocean.app/qrcode',
      amount: 100,
      currency: 'USD',
      description: 'Payment for goods',
    });
    const connectWebSocket = () => {
      socket = new WebSocket('ws://seahorse-app-fejfa.ondigitalocean.app');

      socket.onopen = () => {
        console.log('WebSocket connection established');
        setConnectionStatus('Connected');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'paymentRequest') {
            setPaymentRequest(data.payload);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Connection error. Retrying...');
        setTimeout(connectWebSocket, 5000); // Retry after 5 seconds
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
        setConnectionStatus('Disconnected. Retrying...');
        setTimeout(connectWebSocket, 5000); // Retry after 5 seconds
      };
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
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
            <p>Payment request received</p>
            <button onClick={handleAccept}>Accept Payment</button>
          </div>
        )}
      </main>
    </div>
  );
}