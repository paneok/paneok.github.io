import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import charactersRouter from './routes/characters.js';
import programsRouter from './routes/programs.js';
import ordersRouter from './routes/orders.js';
import calculatorRouter from './routes/calculator.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/characters', charactersRouter);
app.use('/api/programs', programsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/calculator', calculatorRouter);

// API route to get holiday photos dynamically from images/fotoprazdnik folder
app.get('/api/holiday-photos', (req, res) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const photosDir = path.join(__dirname, '..', '..', 'images', 'fotoprazdnik');
  
  fs.readdir(photosDir, (err, files) => {
    if (err) {
      console.error('Error reading holiday photos folder:', err);
      return res.status(500).json({ error: 'Failed to read photos folder', details: err.message });
    }
    
    const photoFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
    });
    
    photoFiles.sort();
    res.json(photoFiles);
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
