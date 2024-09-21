import express from 'express';
import { createServer } from 'https';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import forge from 'node-forge';

const app = express();

// Function to generate a self-signed certificate
function generateCertificate() {
  const pki = forge.pki;
  const keys = pki.rsa.generateKeyPair(2048);
  const cert = pki.createCertificate();

  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  const attrs = [{
    name: 'commonName',
    value: 'localhost'
  }, {
    name: 'countryName',
    value: 'US'
  }, {
    shortName: 'ST',
    value: 'Virginia'
  }, {
    name: 'localityName',
    value: 'Blacksburg'
  }, {
    name: 'organizationName',
    value: 'Test'
  }, {
    shortName: 'OU',
    value: 'Test'
  }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey);

  return {
    key: pki.privateKeyToPem(keys.privateKey),
    cert: pki.certificateToPem(cert)
  };
}

let credentials;
try {
  credentials = generateCertificate();
  console.log('Certificate generated successfully');
} catch (error) {
  console.error('Failed to generate certificate:', error);
  process.exit(1);
}

let server;
try {
  server = createServer(credentials, app);
  console.log('HTTPS server created successfully');
} catch (error) {
  console.error('Failed to create HTTPS server:', error);
  process.exit(1);
}

const wss = new WebSocketServer({ server });

const port = process.env.PORT || 5050;

app.use(express.json());

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

wss.on('connection', (ws) => {
  console.log('a user connected', ws.id);

  // Add a ping-pong mechanism to keep the connection alive
  ws.on('ping', () => {
    ws.emit('pong');
  });

  ws.on('disconnect', () => {
    console.log('user disconnected');
  });

  ws.on('message', (msg) => {
    console.log('message: ' + msg);
    wss.emit('message', msg);
  });
});

app.post('/api/qr-data', (req, res) => {
  const payload = req.body;
  console.log('Received payload:', payload);
  
  // Emit the payload to all connected clients
  wss.emit('new_data', payload);
  
  res.status(200).json({ message: 'Payload received and broadcast successfully' });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`WebSocket server is running on wss://localhost:${port}`);
}).on('error', (error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});

// Add error handling for the WebSocket server
wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

// Error handling for the HTTPS server
server.on('error', (error) => {
  console.error('HTTPS server error:', error);
});