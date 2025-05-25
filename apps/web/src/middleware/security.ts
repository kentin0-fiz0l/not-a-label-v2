import { NextRequest, NextResponse } from 'next/server';
import { CacheManager } from '@/packages/shared/src/lib/cache';
import crypto from 'crypto';

// Rate limit configurations
const RATE_LIMITS = {
  // API endpoints
  '/api/auth': { limit: 5, window: 900 }, // 5 requests per 15 minutes
  '/api/upload': { limit: 10, window: 3600 }, // 10 uploads per hour
  '/api/ai': { limit: 20, window: 3600 }, // 20 AI requests per hour
  '/api': { limit: 100, window: 60 }, // 100 requests per minute (general)
  
  // Public pages
  '/': { limit: 60, window: 60 }, // 60 requests per minute
};

// Get client identifier (IP + User-Agent hash)
function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const hash = crypto.createHash('md5').update(`${ip}:${userAgent}`).digest('hex');
  return hash;
}

// Get rate limit config for path
function getRateLimitConfig(pathname: string): { limit: number; window: number } {
  // Find the most specific matching route
  const matchingRoute = Object.keys(RATE_LIMITS)
    .filter(route => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length)[0];
  
  return RATE_LIMITS[matchingRoute as keyof typeof RATE_LIMITS] || RATE_LIMITS['/'];
}

// Security headers
const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https: blob:",
    "connect-src 'self' https://api.openai.com https://api.anthropic.com https://www.google-analytics.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

// CORS configuration
const ALLOWED_ORIGINS = [
  'https://not-a-label.art',
  'https://www.not-a-label.art',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
].filter(Boolean);

export async function securityMiddleware(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  const origin = request.headers.get('origin');
  
  // Apply CORS for API routes
  if (pathname.startsWith('/api')) {
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }
  
  // Rate limiting
  const clientId = getClientIdentifier(request);
  const { limit, window } = getRateLimitConfig(pathname);
  const rateLimitKey = `${pathname}:${clientId}`;
  
  const { allowed, remaining, resetAt } = await CacheManager.checkRateLimit(
    rateLimitKey,
    limit,
    window
  );
  
  if (!allowed) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': resetAt.toString(),
        'Retry-After': Math.ceil((resetAt - Date.now()) / 1000).toString(),
      },
    });
  }
  
  // Continue with request
  const response = NextResponse.next();
  
  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', resetAt.toString());
  
  // CORS headers for API routes
  if (pathname.startsWith('/api') && origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }
  
  return response;
}

// DDoS protection middleware
export async function ddosProtection(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const now = Date.now();
  
  // Track request timestamps
  const timestampKey = `ddos:timestamps:${clientId}`;
  const timestamps = await CacheManager.get<number[]>(timestampKey) || [];
  
  // Remove old timestamps (older than 1 minute)
  const recentTimestamps = timestamps.filter(ts => now - ts < 60000);
  recentTimestamps.push(now);
  
  // Check for suspicious patterns
  if (recentTimestamps.length > 300) { // More than 300 requests per minute
    // Block client for 1 hour
    await CacheManager.set(`ddos:blocked:${clientId}`, true, 3600);
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  // Check if client is blocked
  const isBlocked = await CacheManager.get<boolean>(`ddos:blocked:${clientId}`);
  if (isBlocked) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  // Update timestamps
  await CacheManager.set(timestampKey, recentTimestamps, 60);
  
  return NextResponse.next();
}