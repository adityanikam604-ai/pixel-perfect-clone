import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import patientRoutes from './routes/patientRoutes';
import logRoutes from './routes/logRoutes';
import alertRoutes from './routes/alertRoutes';
import investigationRoutes from './routes/investigationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import userRoutes from './routes/userRoutes';
import { db } from '../src/lib/db-store';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'MedGuard Security Core',
    timestamp: new Date().toISOString(),
  });
});

// Demo Data Reset Endpoint
app.post('/api/reset', (req: Request, res: Response) => {
  db.reset();
  res.json({ message: 'Synthetic dataset and audit state reset successfully.' });
});

// API Routes per PRD Section 36
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/access-logs', logRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/investigations', investigationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[MedGuard Backend Error]:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

// Start Server if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[MedGuard Server] Running on http://localhost:${PORT}`);
    console.log(`[MedGuard Server] API Endpoints available under http://localhost:${PORT}/api/`);
  });
}

export default app;
