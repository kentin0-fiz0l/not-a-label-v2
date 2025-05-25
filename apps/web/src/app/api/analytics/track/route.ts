import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await getServerSession(authOptions);
    
    // Get client info
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Store analytics event
    const event = await prisma.analyticsEvent.create({
      data: {
        name: body.name,
        properties: body.properties || {},
        userId: body.userId || session?.user?.id,
        sessionId: body.sessionId,
        ipAddress: ip,
        userAgent,
        timestamp: body.timestamp || new Date(),
      },
    });

    // Process specific events
    switch (body.name) {
      case 'track_playback':
        await updateTrackStats(body.properties.track_id, 'plays');
        break;
      case 'track_share':
        await updateTrackStats(body.properties.track_id, 'shares');
        break;
      case 'track_like':
        await updateTrackStats(body.properties.track_id, 'likes');
        break;
    }

    // Update user activity
    if (session?.user?.id) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { lastActive: new Date() },
      });
    }

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

async function updateTrackStats(trackId: string, stat: 'plays' | 'shares' | 'likes') {
  try {
    await prisma.track.update({
      where: { id: trackId },
      data: {
        [stat]: { increment: 1 },
      },
    });
  } catch (error) {
    console.error(`Failed to update track ${stat}:`, error);
  }
}