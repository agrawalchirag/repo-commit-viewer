import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import githubRouter from './routes/github';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS
app.use(cors({
  origin: '*', // For development, allow all. In production, this can be restricted.
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON bodies
app.use(express.json());

// Logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount GitHub routes
app.use('/api', githubRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`GitHub Token Loaded: ${process.env.GITHUB_TOKEN ? 'Yes' : 'No'}`);
});
