import { Router } from 'express';
import { serviceRegistry } from '../services/registry';

const router = Router();

router.get('/', async (req, res) => {
  const serviceHealth = await serviceRegistry.checkAllServices();
  const allHealthy = Object.values(serviceHealth).every(status => status);

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: serviceHealth,
  });
});

export { router as healthRouter };