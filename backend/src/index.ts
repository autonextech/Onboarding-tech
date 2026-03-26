import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import modulesRouter from './routes/modules';
import usersRouter from './routes/users';
import analyticsRouter from './routes/analytics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/modules', modulesRouter);
app.use('/api/users', usersRouter);
app.use('/api/analytics', analyticsRouter);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Backend API is running correctly.',
    database: 'mocked',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend Server is running on http://localhost:${PORT}`);
  console.log(`Test the health endpoint: http://localhost:${PORT}/api/health`);
});
