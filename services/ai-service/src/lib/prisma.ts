import { PrismaClient } from '@prisma/client';
import { createLogger } from '@not-a-label/utils';

const logger = createLogger('ai-service:prisma');

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  logger.info('Disconnecting from database');
  await prisma.$disconnect();
});