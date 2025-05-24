import { createLogger } from '@not-a-label/utils';

const logger = createLogger('api-gateway:registry');

interface ServiceConfig {
  name: string;
  url: string;
  healthCheck: string;
}

class ServiceRegistry {
  private services: Map<string, ServiceConfig> = new Map();

  constructor() {
    this.initializeServices();
  }

  private initializeServices() {
    const services: ServiceConfig[] = [
      {
        name: 'user-service',
        url: process.env.USER_SERVICE_URL || 'http://localhost:3002',
        healthCheck: '/health',
      },
      {
        name: 'music-service',
        url: process.env.MUSIC_SERVICE_URL || 'http://localhost:3003',
        healthCheck: '/health',
      },
      {
        name: 'ai-service',
        url: process.env.AI_SERVICE_URL || 'http://localhost:3004',
        healthCheck: '/health',
      },
      {
        name: 'analytics-service',
        url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3005',
        healthCheck: '/health',
      },
      {
        name: 'distribution-service',
        url: process.env.DISTRIBUTION_SERVICE_URL || 'http://localhost:3006',
        healthCheck: '/health',
      },
      {
        name: 'notification-service',
        url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3007',
        healthCheck: '/health',
      },
      {
        name: 'payment-service',
        url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3008',
        healthCheck: '/health',
      },
    ];

    services.forEach(service => {
      this.services.set(service.name, service);
      logger.info(`Registered service: ${service.name} at ${service.url}`);
    });
  }

  getService(name: string): string {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found in registry`);
    }
    return service.url;
  }

  getAllServices(): ServiceConfig[] {
    return Array.from(this.services.values());
  }

  async checkServiceHealth(name: string): Promise<boolean> {
    const service = this.services.get(name);
    if (!service) {
      return false;
    }

    try {
      const response = await fetch(`${service.url}${service.healthCheck}`);
      return response.ok;
    } catch (error) {
      logger.error(`Health check failed for ${name}`, { error });
      return false;
    }
  }

  async checkAllServices(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [name] of this.services) {
      results[name] = await this.checkServiceHealth(name);
    }
    
    return results;
  }
}

export const serviceRegistry = new ServiceRegistry();