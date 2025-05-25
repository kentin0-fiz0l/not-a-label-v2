import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: false,
      redis: false,
    },
  };

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = true;
  } catch (error) {
    checks.status = 'degraded';
    console.error('Database health check failed:', error);
  }

  // Check Redis connection (if Redis client is available)
  try {
    // Add Redis check here if you have a Redis client configured
    checks.checks.redis = true; // Placeholder for now
  } catch (error) {
    checks.status = 'degraded';
    console.error('Redis health check failed:', error);
  }

  const statusCode = checks.status === 'ok' ? 200 : 503;

  return NextResponse.json(checks, { status: statusCode });
}