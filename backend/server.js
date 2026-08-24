import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { httpServerHandler } from 'cloudflare:node';
import candidateRoutes from './routes/candidateRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

<<<<<<< HEAD
// CORS - Frontend ke liye allow
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
=======
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
>>>>>>> bfa7733bc1ca36379340e1bb17b4c79b26470854

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/candidate', candidateRoutes);
app.use('/api/admin', adminRoutes);

<<<<<<< HEAD
// Health check
=======
>>>>>>> bfa7733bc1ca36379340e1bb17b4c79b26470854
app.get('/', (req, res) => {
  res.json({ message: 'Candidate System API is running on Cloudflare Workers' });
});

<<<<<<< HEAD
// MongoDB connection
=======
>>>>>>> bfa7733bc1ca36379340e1bb17b4c79b26470854
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('DB Connection Error:', err);
  }
}

<<<<<<< HEAD
// Har request se pehle DB connect
=======
>>>>>>> bfa7733bc1ca36379340e1bb17b4c79b26470854
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.listen(3000);
<<<<<<< HEAD
export default httpServerHandler({ port: 3000 });
=======
export default httpServerHandler({ port: 3000 });
>>>>>>> bfa7733bc1ca36379340e1bb17b4c79b26470854
