import express from 'express';
import { Server } from 'socket.io';

const app = express();
const http = require('http').createServer(app);
const io = new Server(http);
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('message', (msg) => {
    console.log('message: ' + msg);
    io.emit('message', msg);
  });
});

http.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});