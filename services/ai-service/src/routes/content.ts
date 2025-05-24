import { Router } from 'express';
import { z } from 'zod';
import { createLogger } from '@not-a-label/utils';
import { prisma } from '../lib/prisma';
import { ContentGenerator } from '../services/content-generator';

const router = Router();
const logger = createLogger('ai-service:content');
const contentGenerator = new ContentGenerator();

const BioGenerationSchema = z.object({
  style: z.enum(['professional', 'casual', 'creative', 'short']),
  details: z.object({
    genre: z.string(),
    achievements: z.array(z.string()).optional(),
    influences: z.array(z.string()).optional(),
    story: z.string().optional(),
    tone: z.string().optional(),
  }),
  platform: z.enum(['general', 'spotify', 'instagram', 'press']).optional(),
});

const SocialPostSchema = z.object({
  type: z.enum(['announcement', 'engagement', 'behind-the-scenes', 'promotional']),
  platform: z.enum(['instagram', 'twitter', 'facebook', 'tiktok']),
  context: z.object({
    topic: z.string(),
    mood: z.string().optional(),
    callToAction: z.string().optional(),
    hashtags: z.boolean().optional(),
    emojis: z.boolean().optional(),
  }),
});

const PressReleaseSchema = z.object({
  type: z.enum(['single', 'album', 'tour', 'announcement']),
  details: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string(),
    quotes: z.array(z.string()).optional(),
    additionalInfo: z.string().optional(),
  }),
});

const EmailTemplateSchema = z.object({
  type: z.enum(['newsletter', 'announcement', 'booking', 'collaboration']),
  recipient: z.enum(['fans', 'venues', 'labels', 'collaborators']),
  context: z.object({
    subject: z.string().optional(),
    mainMessage: z.string(),
    tone: z.string().optional(),
  }),
});

// Generate artist bio
router.post('/bio', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = BioGenerationSchema.parse(req.body);

    const bio = await contentGenerator.generateBio({
      userId,
      style: data.style,
      details: data.details,
      platform: data.platform,
    });

    // Save generation
    await prisma.aIGeneration.create({
      data: {
        userId,
        type: 'bio',
        prompt: JSON.stringify(data),
        result: bio.content,
        model: bio.model,
        tokens: bio.tokens,
      },
    });

    res.json({
      success: true,
      data: {
        bio: bio.content,
        variations: bio.variations,
        metadata: {
          wordCount: bio.content.split(' ').length,
          model: bio.model,
        },
      },
    });
  } catch (error) {
    logger.error('Bio generation failed', { error });
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError 
        ? error.errors[0].message 
        : 'Failed to generate bio',
    });
  }
});

// Generate social media posts
router.post('/social', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = SocialPostSchema.parse(req.body);

    const posts = await contentGenerator.generateSocialPosts({
      userId,
      type: data.type,
      platform: data.platform,
      context: data.context,
    });

    // Save generation
    await prisma.aIGeneration.create({
      data: {
        userId,
        type: `social_${data.platform}`,
        prompt: JSON.stringify(data),
        result: JSON.stringify(posts.posts),
        model: posts.model,
        tokens: posts.tokens,
      },
    });

    res.json({
      success: true,
      data: posts.posts,
    });
  } catch (error) {
    logger.error('Social post generation failed', { error });
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError 
        ? error.errors[0].message 
        : 'Failed to generate social posts',
    });
  }
});

// Generate press release
router.post('/press-release', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = PressReleaseSchema.parse(req.body);

    const pressRelease = await contentGenerator.generatePressRelease({
      userId,
      type: data.type,
      details: data.details,
    });

    // Save generation
    await prisma.aIGeneration.create({
      data: {
        userId,
        type: 'press_release',
        prompt: JSON.stringify(data),
        result: pressRelease.content,
        model: pressRelease.model,
        tokens: pressRelease.tokens,
      },
    });

    res.json({
      success: true,
      data: {
        pressRelease: pressRelease.content,
        sections: pressRelease.sections,
      },
    });
  } catch (error) {
    logger.error('Press release generation failed', { error });
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError 
        ? error.errors[0].message 
        : 'Failed to generate press release',
    });
  }
});

// Generate email templates
router.post('/email', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = EmailTemplateSchema.parse(req.body);

    const email = await contentGenerator.generateEmailTemplate({
      userId,
      type: data.type,
      recipient: data.recipient,
      context: data.context,
    });

    // Save generation
    await prisma.aIGeneration.create({
      data: {
        userId,
        type: `email_${data.type}`,
        prompt: JSON.stringify(data),
        result: JSON.stringify(email),
        model: email.model,
        tokens: email.tokens,
      },
    });

    res.json({
      success: true,
      data: {
        subject: email.subject,
        body: email.body,
        preview: email.preview,
      },
    });
  } catch (error) {
    logger.error('Email template generation failed', { error });
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError 
        ? error.errors[0].message 
        : 'Failed to generate email template',
    });
  }
});

// Get content suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { type = 'all' } = req.query;

    const suggestions = await contentGenerator.getContentSuggestions(
      userId,
      type as string
    );

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logger.error('Content suggestions failed', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to generate content suggestions',
    });
  }
});

// Get content calendar
router.post('/calendar', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { timeframe = '1month', goals } = req.body;

    const calendar = await contentGenerator.generateContentCalendar({
      userId,
      timeframe,
      goals,
    });

    res.json({
      success: true,
      data: calendar,
    });
  } catch (error) {
    logger.error('Content calendar generation failed', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to generate content calendar',
    });
  }
});

export { router as contentRouter };