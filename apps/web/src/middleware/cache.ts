import { NextRequest, NextResponse } from 'next/server';
import { CacheManager, CacheTTL } from '@/packages/shared/src/lib/cache';

// Routes that should be cached
const CACHEABLE_ROUTES = [
  '/api/tracks',
  '/api/artists',
  '/api/trending',
  '/api/search',
  '/api/analytics/public',
];

// Cache key generator
function generateCacheKey(request: NextRequest): string {
  const url = new URL(request.url);
  const params = Array.from(url.searchParams.entries()).sort();
  return `api:${url.pathname}:${JSON.stringify(params)}`;
}

// Determine cache TTL based on route
function getCacheTTL(pathname: string): number {
  if (pathname.includes('/trending')) return CacheTTL.SHORT;
  if (pathname.includes('/analytics')) return CacheTTL.MEDIUM;
  if (pathname.includes('/search')) return CacheTTL.SHORT;
  return CacheTTL.MEDIUM;
}

export async function cacheMiddleware(request: NextRequest) {
  // Only cache GET requests
  if (request.method !== 'GET') {
    return NextResponse.next();
  }

  const pathname = new URL(request.url).pathname;
  
  // Check if route should be cached
  const shouldCache = CACHEABLE_ROUTES.some(route => pathname.startsWith(route));
  if (!shouldCache) {
    return NextResponse.next();
  }

  const cacheKey = generateCacheKey(request);
  
  // Try to get from cache
  const cached = await CacheManager.get<{
    body: any;
    headers: Record<string, string>;
  }>(cacheKey);

  if (cached) {
    // Return cached response
    return new NextResponse(JSON.stringify(cached.body), {
      status: 200,
      headers: {
        ...cached.headers,
        'X-Cache': 'HIT',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  }

  // Continue with request
  const response = NextResponse.next();
  
  // Cache successful responses
  if (response.status === 200) {
    const body = await response.json();
    const ttl = getCacheTTL(pathname);
    
    await CacheManager.set(
      cacheKey,
      {
        body,
        headers: Object.fromEntries(response.headers.entries()),
      },
      ttl
    );
    
    // Add cache headers
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('Cache-Control', `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`);
  }

  return response;
}