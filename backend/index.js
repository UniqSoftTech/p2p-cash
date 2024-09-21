import express from 'express';
import { createServer } from 'https';
import { WebSocketServer } from 'ws';
import crypto from 'crypto';
import forge from 'node-forge';

const app = express();

// Generate a self-signed certificate
function generateCertificate() {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  const attrs = [{
    name: 'commonName',
    value: 'example.org'
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
    cert: forge.pki.certificateToPem(cert),
    privateKey: forge.pki.privateKeyToPem(keys.privateKey)
  };
}

const credentials = generateCertificate();
const server = createServer(credentials, app);
const wss = new WebSocketServer({ server });

const port = process.env.PORT || 5050;

app.use(express.json());

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
  console.log('Warning: Using a self-signed certificate. Not suitable for production.');
});

// Add error handling for the WebSocket server
wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

// Error handling for the HTTPS server
server.on('error', (error) => {
  console.error('HTTPS server error:', error);
});