import Redis from 'ioredis';

// Redis client with connection pooling
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Cache key prefixes
export const CacheKeys = {
  USER: 'user:',
  ARTIST: 'artist:',
  TRACK: 'track:',
  ANALYTICS: 'analytics:',
  SESSION: 'session:',
  API_RATE: 'rate:',
  TRENDING: 'trending:',
  SEARCH: 'search:',
} as const;

// Cache TTL values (in seconds)
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
} as const;

export class CacheManager {
  /**
   * Get value from cache
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  static async set(key: string, value: any, ttl: number = CacheTTL.MEDIUM): Promise<boolean> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  static async delete(key: string | string[]): Promise<boolean> {
    try {
      const keys = Array.isArray(key) ? key : [key];
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Clear cache by pattern
   */
  static async clearPattern(pattern: string): Promise<boolean> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache clear pattern error:', error);
      return false;
    }
  }

  /**
   * Cache wrapper for async functions
   */
  static async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = CacheTTL.MEDIUM
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }

  /**
   * Invalidate related caches
   */
  static async invalidate(type: keyof typeof CacheKeys, id: string): Promise<void> {
    const patterns = [
      `${CacheKeys[type]}${id}*`,
      `${CacheKeys.SEARCH}*${id}*`,
      `${CacheKeys.TRENDING}*`,
    ];

    await Promise.all(patterns.map(pattern => this.clearPattern(pattern)));
  }

  /**
   * Rate limiting check
   */
  static async checkRateLimit(
    identifier: string,
    limit: number = 100,
    window: number = 3600
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const key = `${CacheKeys.API_RATE}${identifier}`;
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, window);
    }
    
    const ttl = await redis.ttl(key);
    const resetAt = Date.now() + (ttl * 1000);
    
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetAt,
    };
  }

  /**
   * Distributed lock for critical sections
   */
  static async acquireLock(
    resource: string,
    ttl: number = 5000
  ): Promise<{ acquired: boolean; unlock?: () => Promise<void> }> {
    const lockKey = `lock:${resource}`;
    const lockId = `${Date.now()}_${Math.random()}`;
    
    const acquired = await redis.set(lockKey, lockId, 'PX', ttl, 'NX');
    
    if (acquired) {
      return {
        acquired: true,
        unlock: async () => {
          const currentValue = await redis.get(lockKey);
          if (currentValue === lockId) {
            await redis.del(lockKey);
          }
        },
      };
    }
    
    return { acquired: false };
  }
}

// Export redis client for advanced usage
export { redis };