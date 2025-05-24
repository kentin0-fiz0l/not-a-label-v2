import { Router } from 'express';
import { z } from 'zod';
import { createLogger } from '@not-a-label/utils';
import { prisma } from '../lib/prisma';
import { CareerAssistant } from '../services/career-assistant';
import { ConversationManager } from '../services/conversation-manager';

const router = Router();
const logger = createLogger('ai-service:career');
const careerAssistant = new CareerAssistant();
const conversationManager = new ConversationManager();

const CareerQuestionSchema = z.object({
  question: z.string().min(10).max(1000),
  context: z.object({
    genre: z.string().optional(),
    experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    goals: z.array(z.string()).optional(),
    currentChallenges: z.array(z.string()).optional(),
  }).optional(),
  conversationId: z.string().uuid().optional(),
});

const CareerStrategySchema = z.object({
  timeframe: z.enum(['3months', '6months', '1year', '2years']),
  currentStatus: z.object({
    monthlyListeners: z.number().optional(),
    socialFollowers: z.record(z.number()).optional(),
    releases: z.number().optional(),
  }).optional(),
  goals: z.array(z.string()).min(1).max(10),
});

// Get career advice
router.post('/advice', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = CareerQuestionSchema.parse(req.body);

    // Get or create conversation
    const conversation = data.conversationId
      ? await conversationManager.getConversation(data.conversationId, userId)
      : await conversationManager.createConversation(userId, 'career', data.question);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    // Add user message
    await conversationManager.addMessage(
      conversation.id,
      'user',
      data.question
    );

    // Generate career advice
    const advice = await careerAssistant.generateAdvice(
      data.question,
      data.context,
      conversation
    );

    // Save assistant message
    const assistantMessage = await conversationManager.addMessage(
      conversation.id,
      'assistant',
      advice.content,
      {
        model: advice.model,
        tokens: advice.tokens,
      }
    );

    res.json({
      success: true,
      data: {
        conversationId: conversation.id,
        advice: advice.content,
        message: assistantMessage,
      },
    });
  } catch (error) {
    logger.error('Career advice generation failed', { error });
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError 
        ? error.errors[0].message 
        : 'Failed to generate career advice',
    });
  }
});

// Generate career strategy
router.post('/strategy', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = CareerStrategySchema.parse(req.body);

    // Get user profile for context
    const userProfile = await fetch(`${process.env.USER_SERVICE_URL}/profiles/me`, {
      headers: {
        Authorization: req.headers.authorization!,
      },
    }).then(res => res.json());

    // Generate comprehensive strategy
    const strategy = await careerAssistant.generateStrategy({
      userId,
      timeframe: data.timeframe,
      currentStatus: data.currentStatus,
      goals: data.goals,
      profile: userProfile.data,
    });

    // Save generation record
    await prisma.aIGeneration.create({
      data: {
        userId,
        type: 'career_strategy',
        prompt: JSON.stringify(data),
        result: JSON.stringify(strategy.strategy),
        model: strategy.model,
        tokens: strategy.tokens,
      },
    });

    res.json({
      success: true,
      data: strategy.strategy,
    });
  } catch (error) {
    logger.error('Career strategy generation failed', { error });
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError 
        ? error.errors[0].message 
        : 'Failed to generate career strategy',
    });
  }
});

// Get milestone recommendations
router.get('/milestones', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { timeframe = '6months' } = req.query;

    // Get user's current progress
    const userAnalytics = await fetch(`${process.env.ANALYTICS_SERVICE_URL}/metrics/summary`, {
      headers: {
        Authorization: req.headers.authorization!,
      },
    }).then(res => res.json());

    // Generate personalized milestones
    const milestones = await careerAssistant.generateMilestones({
      userId,
      timeframe: timeframe as string,
      currentMetrics: userAnalytics.data,
    });

    res.json({
      success: true,
      data: milestones,
    });
  } catch (error) {
    logger.error('Milestone generation failed', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to generate milestones',
    });
  }
});

// Get industry insights
router.post('/insights', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { genre, topic } = req.body;

    const insights = await careerAssistant.getIndustryInsights({
      genre,
      topic,
      userId,
    });

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    logger.error('Industry insights generation failed', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to generate industry insights',
    });
  }
});

// Get networking suggestions
router.get('/networking', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const suggestions = await careerAssistant.getNetworkingSuggestions(userId);

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logger.error('Networking suggestions failed', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to generate networking suggestions',
    });
  }
});

export { router as careerRouter };