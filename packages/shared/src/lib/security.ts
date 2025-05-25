import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Encryption utilities
export class SecurityManager {
  private static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;

  /**
   * Encrypt sensitive data
   */
  static encrypt(data: string, key?: string): { encrypted: string; key: string } {
    const encryptionKey = key ? Buffer.from(key, 'hex') : crypto.randomBytes(this.KEY_LENGTH);
    const iv = crypto.randomBytes(this.IV_LENGTH);
    
    const cipher = crypto.createCipher(this.ENCRYPTION_ALGORITHM, encryptionKey);
    cipher.setAAD(Buffer.from('not-a-label-auth'));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted: `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`,
      key: encryptionKey.toString('hex'),
    };
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: string, key: string): string {
    const [ivHex, encrypted, tagHex] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const encryptionKey = Buffer.from(key, 'hex');
    
    const decipher = crypto.createDecipher(this.ENCRYPTION_ALGORITHM, encryptionKey);
    decipher.setAAD(Buffer.from('not-a-label-auth'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Hash password with salt
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * Verify password
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate API key
   */
  static generateApiKey(): string {
    const prefix = 'nal_';
    const key = crypto.randomBytes(32).toString('base64url');
    return `${prefix}${key}`;
  }

  /**
   * Validate API key format
   */
  static validateApiKey(apiKey: string): boolean {
    return /^nal_[A-Za-z0-9_-]{43}$/.test(apiKey);
  }

  /**
   * Generate 2FA secret
   */
  static generate2FASecret(userEmail: string): {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  } {
    const secret = speakeasy.generateSecret({
      name: `Not a Label (${userEmail})`,
      issuer: 'Not a Label',
      length: 32,
    });

    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    return {
      secret: secret.base32,
      qrCodeUrl: speakeasy.otpauthURL({
        secret: secret.base32,
        label: userEmail,
        issuer: 'Not a Label',
        encoding: 'base32',
      }),
      backupCodes,
    };
  }

  /**
   * Verify 2FA token
   */
  static verify2FAToken(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps in either direction
    });
  }

  /**
   * Generate session token with expiration
   */
  static generateSessionToken(userId: string, expiresIn: number = 3600): {
    token: string;
    expiresAt: Date;
  } {
    const payload = {
      userId,
      issuedAt: Date.now(),
      expiresAt: Date.now() + expiresIn * 1000,
      nonce: crypto.randomBytes(16).toString('hex'),
    };

    const token = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    return {
      token,
      expiresAt: new Date(payload.expiresAt),
    };
  }

  /**
   * Validate and parse session token
   */
  static validateSessionToken(token: string): {
    valid: boolean;
    userId?: string;
    expiresAt?: Date;
  } {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64url').toString());
      
      if (!payload.userId || !payload.expiresAt || !payload.nonce) {
        return { valid: false };
      }

      if (Date.now() > payload.expiresAt) {
        return { valid: false };
      }

      return {
        valid: true,
        userId: payload.userId,
        expiresAt: new Date(payload.expiresAt),
      };
    } catch {
      return { valid: false };
    }
  }
}

// Audit logging
export class AuditLogger {
  static async log(event: {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const auditEntry = {
      ...event,
      timestamp: new Date(),
      id: crypto.randomUUID(),
    };

    // Store in audit log table
    try {
      await prisma.auditLog.create({
        data: auditEntry,
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  static async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    return prisma.auditLog.findMany({
      where: {
        userId: filters.userId,
        action: filters.action,
        resource: filters.resource,
        timestamp: {
          gte: filters.startDate,
          lte: filters.endDate,
        },
      },
      orderBy: { timestamp: 'desc' },
      take: filters.limit || 100,
      skip: filters.offset || 0,
    });
  }
}

// Data sanitization
export class DataSanitizer {
  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeHtml(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  /**
   * Sanitize SQL input
   */
  static sanitizeSQL(input: string): string {
    return input
      .replace(/['";\\]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .trim();
  }

  /**
   * Validate and sanitize email
   */
  static sanitizeEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = email.toLowerCase().trim();
    return emailRegex.test(sanitized) ? sanitized : null;
  }

  /**
   * Sanitize file names
   */
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^\w\s.-]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }

  /**
   * Validate upload file type
   */
  static validateFileType(fileName: string, allowedTypes: string[]): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  }
}

// Rate limiting with Redis
export class RateLimiter {
  static async checkLimit(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const redis = await import('@/packages/shared/src/lib/cache').then(m => m.redis);
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const redisKey = `rate_limit:${key}:${window}`;

    try {
      const current = await redis.incr(redisKey);
      
      if (current === 1) {
        await redis.expire(redisKey, Math.ceil(windowMs / 1000));
      }

      const remaining = Math.max(0, limit - current);
      const resetTime = (window + 1) * windowMs;

      return {
        allowed: current <= limit,
        remaining,
        resetTime,
      };
    } catch (error) {
      console.error('Rate limiting error:', error);
      return { allowed: true, remaining: limit, resetTime: now + windowMs };
    }
  }
}

// IP geolocation and blocking
export class IPSecurity {
  private static readonly BLOCKED_COUNTRIES = ['CN', 'RU', 'KP']; // Example blocked countries
  private static readonly VPN_DETECTION_API = process.env.VPN_DETECTION_API;

  static async checkIP(ip: string): Promise<{
    allowed: boolean;
    country?: string;
    isVPN?: boolean;
    risk?: 'low' | 'medium' | 'high';
  }> {
    try {
      // Get IP geolocation
      const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
      const geoData = await geoResponse.json();

      const country = geoData.countryCode;
      const allowed = !this.BLOCKED_COUNTRIES.includes(country);

      // Check for VPN/proxy (if API key is available)
      let isVPN = false;
      if (this.VPN_DETECTION_API) {
        const vpnResponse = await fetch(
          `https://vpnapi.io/api/${ip}?key=${this.VPN_DETECTION_API}`
        );
        const vpnData = await vpnResponse.json();
        isVPN = vpnData.security?.vpn || vpnData.security?.proxy;
      }

      return {
        allowed: allowed && !isVPN,
        country,
        isVPN,
        risk: this.calculateRisk(country, isVPN),
      };
    } catch (error) {
      console.error('IP check failed:', error);
      return { allowed: true, risk: 'low' };
    }
  }

  private static calculateRisk(country: string, isVPN: boolean): 'low' | 'medium' | 'high' {
    if (isVPN) return 'high';
    if (this.BLOCKED_COUNTRIES.includes(country)) return 'high';
    if (['US', 'CA', 'GB', 'AU', 'DE', 'FR'].includes(country)) return 'low';
    return 'medium';
  }
}

// Content Security Policy
export class CSPManager {
  static generateCSP(): string {
    const directives = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://js.stripe.com',
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
      ],
      'img-src': [
        "'self'",
        'data:',
        'https:',
        'blob:',
      ],
      'media-src': [
        "'self'",
        'https:',
        'blob:',
      ],
      'connect-src': [
        "'self'",
        'https://api.openai.com',
        'https://api.anthropic.com',
        'https://api.stripe.com',
        'https://www.google-analytics.com',
      ],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
    };

    return Object.entries(directives)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
  }
}