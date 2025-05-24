import { Request, Response, NextFunction } from 'express';
import { AuthUtils, createLogger } from '@not-a-label/utils';

const logger = createLogger('api-gateway:auth');

const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/health',
];

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Skip auth for public paths
    if (PUBLIC_PATHS.some(path => req.path.startsWith(path))) {
      return next();
    }

    const authHeader = req.headers.authorization;
    const token = AuthUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided',
      });
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const payload = AuthUtils.verifyToken(token, secret);

    if (!payload) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Add user info to request
    (req as any).user = payload;

    next();
  } catch (error) {
    logger.error('Authentication error', { error });
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};