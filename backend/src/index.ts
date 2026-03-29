import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import modulesRouter from './routes/modules';
import usersRouter from './routes/users';
import analyticsRouter from './routes/analytics';
import authRouter from './routes/auth';
import candidatesRouter from './routes/candidates';
import mentorsRouter from './routes/mentors';
import progressRouter from './routes/progress';
import quizRouter from './routes/quiz';
import reportsRouter from './routes/reports';
import teamRouter from './routes/team';
import adminRouter from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allow all origins - handles preflight OPTIONS automatically
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.options('*', cors()); // Respond to ALL preflight requests
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/modules', modulesRouter);
app.use('/api/users', usersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/candidates', candidatesRouter);
app.use('/api/mentors', mentorsRouter);
app.use('/api/progress', progressRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/team', teamRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend Server is running on http://localhost:${PORT}`);
  console.log(`Test the health endpoint: http://localhost:${PORT}/api/health`);
});
