import { Router } from 'express';
import { z } from 'zod';
import { createLogger } from '@not-a-label/utils';
import { prisma } from '../lib/prisma';
import { authenticateRequest } from '../middleware/auth';

const router = Router();
const logger = createLogger('user-service:users');

const UpdateUserSchema = z.object({
  displayName: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().url().optional(),
});

// Get current user
router.get('/me', authenticateRequest, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        avatar: true,
        isVerified: true,
        isPro: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Get user error', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get user',
    });
  }
});

// Update current user
router.patch('/me', authenticateRequest, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = UpdateUserSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        avatar: true,
        isVerified: true,
        isPro: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Update user error', { error });
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError 
        ? error.errors[0].message 
        : 'Failed to update user',
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        profile: {
          select: {
            stageName: true,
            genres: true,
            location: true,
            website: true,
            monthlyListeners: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Get user by ID error', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get user',
    });
  }
});

// Search users
router.get('/', async (req, res) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query;

    const where = q
      ? {
          OR: [
            { username: { contains: String(q), mode: 'insensitive' as const } },
            { displayName: { contains: String(q), mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          isVerified: true,
          profile: {
            select: {
              stageName: true,
              genres: true,
              monthlyListeners: true,
            },
          },
        },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users,
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error) {
    logger.error('Search users error', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to search users',
    });
  }
});

export { router as userRouter };