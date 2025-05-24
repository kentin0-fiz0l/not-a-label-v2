import express from 'express';
import { createLogger } from '@not-a-label/utils';
import { errorHandler } from './middleware/error-handler';
import { authenticateRequest } from './middleware/auth';
import { careerRouter } from './routes/career';
import { contentRouter } from './routes/content';
import { analysisRouter } from './routes/analysis';
import { conversationRouter } from './routes/conversations';
import { prisma } from './lib/prisma';
import { initializeAIProviders } from './lib/ai-providers';
import { startQueueProcessor } from './services/queue-processor';

const app = express();
const logger = createLogger('ai-service');
const port = process.env.PORT || 3004;

app.use(express.json({ limit: '10mb' }));

// Initialize AI providers
initializeAIProviders();

// Start background queue processor
startQueueProcessor();

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', service: 'ai-service' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', service: 'ai-service' });
  }
});

// Protected routes
app.use(authenticateRequest);

// AI Routes
app.use('/career', careerRouter);
app.use('/content', contentRouter);
app.use('/analysis', analysisRouter);
app.use('/conversations', conversationRouter);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`AI Service running on port ${port}`);
});