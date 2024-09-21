import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';

const app = express();
const http = createServer(app);
const io = new Server(http, {
  cors: {
    origin: "*", // Be more specific in production
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'] // Add polling as a fallback
});

const port = process.env.PORT || 5050;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  // Add a ping-pong mechanism to keep the connection alive
  socket.on('ping', () => {
    socket.emit('pong');
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('message', (msg) => {
    console.log('message: ' + msg);
    io.emit('message', msg);
  });
});

app.post('/api/qr-data', (req, res) => {
  const payload = req.body;
  console.log('Received payload:', payload);
  
  // Emit the payload to all connected clients
  io.emit('new_data', payload);
  
  res.status(200).json({ message: 'Payload received and broadcast successfully' });
});

http.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`WebSocket server is running on ws://localhost:${port}`);
});

// Add error handling for the Socket.IO server
io.on('connect_error', (error) => {
  console.error('Socket.IO connection error:', error);
});

// Error handling for the HTTP server
http.on('error', (error) => {
  console.error('HTTP server error:', error);
});