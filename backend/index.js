import express from 'express';
import { createServer } from 'http';
import cors from 'cors'; // Add this import
import multer from 'multer'; // Add this import
import path from 'path'; // Add this import
import fs from 'fs/promises'; // Change to use promises version
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { existsSync } from 'fs'; // Add this import

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  latestData.amount = payload.amount || 0;
  latestData.currency = payload.currency || 'SGD';
  
  res.status(200).json({ message: 'Payload received successfully' });
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    // Use a more persistent naming strategy
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

// Add a cleanup function to remove old files
async function cleanupOldFiles() {
  try {
    const files = await fs.readdir(uploadsDir);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // milliseconds in an hour

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);
      if (now - stats.mtime.getTime() > oneHour) {
        await fs.unlink(filePath);
        console.log(`Deleted old file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old files:', error);
  }
}

// Run cleanup every hour
setInterval(cleanupOldFiles, 60 * 60 * 1000);

// Update the image upload endpoint
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded' });
  }
  
  console.log('Received image:', req.file);
  
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  
  // Update latestData with image information
  if (latestData) {
    latestData.image = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: imageUrl
    };
  } else {
    latestData = {
      image: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: imageUrl
      }
    };
  }
  console.log(latestData)

  res.status(200).json({
    message: 'Image uploaded successfully',
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    url: imageUrl
  });
});

// The poll-data endpoint remains the same
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