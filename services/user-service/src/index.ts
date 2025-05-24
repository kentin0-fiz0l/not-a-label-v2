import express from 'express';
import { createLogger } from '@not-a-label/utils';
import { errorHandler } from './middleware/error-handler';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/users';
import { profileRouter } from './routes/profiles';
import { prisma } from './lib/prisma';

const app = express();
const logger = createLogger('user-service');
const port = process.env.PORT || 3002;

app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', service: 'user-service' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', service: 'user-service' });
  }
});

// Routes
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/profiles', profileRouter);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`User Service running on port ${port}`);
});