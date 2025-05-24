import { Router } from 'express';
import { z } from 'zod';
import { createLogger } from '@not-a-label/utils';
import { prisma } from '../lib/prisma';
import { authenticateRequest } from '../middleware/auth';

const router = Router();
const logger = createLogger('user-service:profiles');

const CreateProfileSchema = z.object({
  stageName: z.string().min(1).max(100),
  genres: z.array(z.string()).min(1).max(10),
  location: z.string().optional(),
  website: z.string().url().optional(),
  socialLinks: z.object({
    spotify: z.string().url().optional(),
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
    youtube: z.string().url().optional(),
    tiktok: z.string().url().optional(),
  }).optional(),
});

const UpdateProfileSchema = CreateProfileSchema.partial();

// Create artist profile
router.post('/', authenticateRequest, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = CreateProfileSchema.parse(req.body);

    // Check if profile already exists
    const existingProfile = await prisma.artistProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        error: 'Artist profile already exists',
      });
    }

    const profile = await prisma.artistProfile.create({
      data: {
        userId,
        ...data,
      },
    });

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    logger.error('Create profile error', { error });
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError 
        ? error.errors[0].message 
        : 'Failed to create profile',
    });
  }
});

// Get current user's profile
router.get('/me', authenticateRequest, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const profile = await prisma.artistProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Artist profile not found',
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    logger.error('Get profile error', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
    });
  }
});

// Update profile
router.patch('/me', authenticateRequest, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = UpdateProfileSchema.parse(req.body);

    const profile = await prisma.artistProfile.update({
      where: { userId },
      data,
    });

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    logger.error('Update profile error', { error });
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError 
        ? error.errors[0].message 
        : 'Failed to update profile',
    });
  }
});

// Get profile by username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        profile: true,
      },
    });

    if (!user || !user.profile) {
      return res.status(404).json({
        success: false,
        error: 'Artist profile not found',
      });
    }

    res.json({
      success: true,
      data: {
        ...user.profile,
        user: {
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    logger.error('Get profile by username error', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
    });
  }
});

// Search profiles
router.get('/', async (req, res) => {
  try {
    const { genre, location, limit = 20, offset = 0 } = req.query;

    const where: any = {};
    
    if (genre) {
      where.genres = { has: String(genre) };
    }
    
    if (location) {
      where.location = { contains: String(location), mode: 'insensitive' };
    }

    const [profiles, total] = await Promise.all([
      prisma.artistProfile.findMany({
        where,
        include: {
          user: {
            select: {
              username: true,
              displayName: true,
              avatar: true,
              isVerified: true,
            },
          },
        },
        take: Number(limit),
        skip: Number(offset),
        orderBy: { monthlyListeners: 'desc' },
      }),
      prisma.artistProfile.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        profiles,
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error) {
    logger.error('Search profiles error', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to search profiles',
    });
  }
});

export { router as profileRouter };