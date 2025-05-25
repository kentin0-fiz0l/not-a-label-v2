import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import os from 'os';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user statistics
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        lastActive: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    // Get track statistics
    const totalTracks = await prisma.track.count();
    const uploadedTracks = await prisma.track.count({
      where: { status: 'processing' },
    });
    const distributedTracks = await prisma.track.count({
      where: { status: 'distributed' },
    });

    // Get revenue statistics (placeholder - implement based on your payment system)
    const revenue = {
      total: 125000,
      thisMonth: 15000,
      pending: 3500,
    };

    // Get system statistics
    const cpuUsage = os.loadavg()[0] * 100 / os.cpus().length;
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;
    const uptime = process.uptime();

    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
      },
      tracks: {
        total: totalTracks,
        uploaded: uploadedTracks,
        distributed: distributedTracks,
      },
      revenue,
      system: {
        cpu: Math.round(cpuUsage),
        memory: Math.round(memoryUsage),
        disk: 45, // Placeholder - implement disk usage check
        uptime: Math.round(uptime / 3600), // Convert to hours
      },
    });
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}