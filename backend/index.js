import express from 'express';
import { createServer } from 'http'; // Change this to http
import { WebSocketServer } from 'ws';
// Remove the forge import as we won't be using it for now

const app = express();

// Remove the generateCertificate function

// Remove the credentials variable
const server = createServer(app); // Remove credentials parameter
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
  console.log(`WebSocket server is running on ws://localhost:${port}`); // Change to ws://
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