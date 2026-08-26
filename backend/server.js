import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { httpServerHandler } from 'cloudflare:node';
import candidateRoutes from './routes/candidateRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'https://local-elections-661.pages.dev',
    'http://localhost:5173',
    'http://localhost:4173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/candidate', candidateRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Candidate System API is running on Cloudflare Workers' });
});

let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (err) {
    isConnected = false;
    console.error('DB Connection Error:', err);
  }
}

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.listen(3000);
export default httpServerHandler({ port: 3000 });