import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redis } from '@/packages/shared/src/lib/cache';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const health = {
    database: false,
    redis: false,
    storage: false,
    email: false,
    payments: false,
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  // Check Redis
  try {
    await redis.ping();
    health.redis = true;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  // Check storage (check if upload directory is writable)
  try {
    const fs = require('fs').promises;
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    await fs.access(uploadDir, fs.constants.W_OK);
    health.storage = true;
  } catch (error) {
    console.error('Storage health check failed:', error);
  }

  // Check email service (placeholder - implement based on your email provider)
  health.email = true; // Assume working for now

  // Check payment service (placeholder - implement based on your payment provider)
  health.payments = true; // Assume working for now

  return NextResponse.json(health);
}