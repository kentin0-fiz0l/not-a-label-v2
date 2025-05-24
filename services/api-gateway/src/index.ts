import express from 'express';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createLogger } from '@not-a-label/utils';
import { authMiddleware } from './middleware/auth';
import { rateLimiter } from './middleware/rate-limit';
import { errorHandler } from './middleware/error-handler';
import { serviceRegistry } from './services/registry';
import { healthRouter } from './routes/health';

const app = express();
const logger = createLogger('api-gateway');
const port = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(express.json());

// Health check
app.use('/health', healthRouter);

// Rate limiting
app.use(rateLimiter);

// Authentication for protected routes
app.use('/api/*', authMiddleware);

// Service proxies
app.use('/api/users', createProxyMiddleware({
  target: serviceRegistry.getService('user-service'),
  changeOrigin: true,
  pathRewrite: { '^/api/users': '' },
}));

app.use('/api/music', createProxyMiddleware({
  target: serviceRegistry.getService('music-service'),
  changeOrigin: true,
  pathRewrite: { '^/api/music': '' },
}));

app.use('/api/ai', createProxyMiddleware({
  target: serviceRegistry.getService('ai-service'),
  changeOrigin: true,
  pathRewrite: { '^/api/ai': '' },
}));

app.use('/api/analytics', createProxyMiddleware({
  target: serviceRegistry.getService('analytics-service'),
  changeOrigin: true,
  pathRewrite: { '^/api/analytics': '' },
}));

app.use('/api/distribution', createProxyMiddleware({
  target: serviceRegistry.getService('distribution-service'),
  changeOrigin: true,
  pathRewrite: { '^/api/distribution': '' },
}));

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`API Gateway running on port ${port}`);
});