import express from 'express';
import { createServer } from 'http';
import cors from 'cors'; // Add this import
import multer from 'multer'; // Add this import

const app = express();
const server = createServer(app);

const port = process.env.PORT || 5050;

app.use(express.json());
app.use(cors({
  origin: ['https://p2p-agent.vercel.app', 'https://p2p-cash.vercel.app', 'http://localhost:3000']
}));

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Store the latest data
let latestData = null;

app.post('/api/qr-data', (req, res) => {
  const payload = req.body;
  console.log('Received payload:', payload);
  
  // Store the latest data
  latestData = payload;
  rawData = JSON.parse(payload.rawData);
  latestData.amount = payload.amount || 0;
  latestData.currency = payload.currency || 'SGD';
  latestData.recipient = rawData[2].value || '';
  
  res.status(200).json({ message: 'Payload received successfully' });
});

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Add a new endpoint for receiving images
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded' });
  }
  
  console.log('Received image:', req.file);
  
  // Here you can process the image or save its information
  // For now, we'll just send back some basic file info
  res.status(200).json({
    message: 'Image uploaded successfully',
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size
  });
});

// Add a new endpoint for polling
app.get('/api/poll-data', (req, res) => {
  if (latestData) {
    res.json(latestData);
  } else {
    res.status(204).send(); // No Content
  }
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}).on('error', (error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});

// Error handling for the HTTP server
server.on('error', (error) => {
  console.error('HTTP server error:', error);
});