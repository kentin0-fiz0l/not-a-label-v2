import { Router } from 'express';
import { z } from 'zod';
import { AuthUtils, createLogger } from '@not-a-label/utils';
import { prisma } from '../lib/prisma';

const router = Router();
const logger = createLogger('user-service:auth');

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(30),
  displayName: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register
router.post('/register', async (req, res) => {
  try {
    const data = RegisterSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or username already exists',
      });
    }

    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        displayName: data.displayName,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const accessToken = AuthUtils.generateToken(
      { userId: user.id, email: user.email },
      jwtSecret,
      '1d'
    );
    const refreshToken = AuthUtils.generateToken(
      { userId: user.id, email: user.email },
      jwtSecret,
      '30d'
    );

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    res.json({
      success: true,
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Registration error', { error });
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError 
        ? error.errors[0].message 
        : 'Registration failed',
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const data = LoginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Verify password
    const isValidPassword = await AuthUtils.comparePassword(
      data.password,
      user.password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Generate tokens
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const accessToken = AuthUtils.generateToken(
      { userId: user.id, email: user.email },
      jwtSecret,
      '1d'
    );
    const refreshToken = AuthUtils.generateToken(
      { userId: user.id, email: user.email },
      jwtSecret,
      '30d'
    );

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          isVerified: user.isVerified,
          isPro: user.isPro,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Login error', { error });
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError 
        ? error.errors[0].message 
        : 'Login failed',
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required',
      });
    }

    // Verify refresh token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const payload = AuthUtils.verifyToken(refreshToken, jwtSecret);

    if (!payload) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
      });
    }

    // Generate new access token
    const accessToken = AuthUtils.generateToken(
      { userId: storedToken.user.id, email: storedToken.user.email },
      jwtSecret,
      '1d'
    );

    res.json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    logger.error('Token refresh error', { error });
    res.status(500).json({
      success: false,
      error: 'Token refresh failed',
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error', { error });
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
});

export { router as authRouter };