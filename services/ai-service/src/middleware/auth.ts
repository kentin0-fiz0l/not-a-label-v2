import { Request, Response, NextFunction } from 'express';
import { AuthUtils, createLogger } from '@not-a-label/utils';

const logger = createLogger('ai-service:auth');

export const authenticateRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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
    (req as any).userId = payload.userId;
    (req as any).userEmail = payload.email;

    next();
  } catch (error) {
    logger.error('Authentication error', { error });
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};