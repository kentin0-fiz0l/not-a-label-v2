import { Router } from 'express';
import { z } from 'zod';
import { createLogger } from '@not-a-label/utils';
import { prisma } from '../lib/prisma';
import { MusicAnalyzer } from '../services/music-analyzer';
import { MarketAnalyzer } from '../services/market-analyzer';

const router = Router();
const logger = createLogger('ai-service:analysis');
const musicAnalyzer = new MusicAnalyzer();
const marketAnalyzer = new MarketAnalyzer();

const TrackAnalysisSchema = z.object({
  trackId: z.string().uuid(),
  analysisTypes: z.array(z.enum([
    'genre_classification',
    'mood_detection',
    'quality_assessment',
    'commercial_potential',
    'audience_fit',
    'production_feedback'
  ])).min(1),
  metadata: z.object({
    title: z.string(),
    artist: z.string(),
    genre: z.string().optional(),
    duration: z.number().optional(),
    releaseDate: z.string().optional(),
  }),
});

const MarketAnalysisSchema = z.object({
  genre: z.string(),
  region: z.string().optional(),
  timeframe: z.enum(['current', '3months', '6months', '1year']),
  analysisTypes: z.array(z.enum([
    'trends',
    'competition',
    'opportunities',
    'audience_insights',
    'platform_performance'
  ])).min(1),
});

const CompetitorAnalysisSchema = z.object({
  artistNames: z.array(z.string()).min(1).max(5),
  metrics: z.array(z.enum([
    'streaming_numbers',
    'social_media',
    'release_strategy',
    'audience_demographics',
    'marketing_tactics'
  ])).optional(),
});

// Analyze a track
router.post('/track', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = TrackAnalysisSchema.parse(req.body);

    const analyses = await Promise.all(
      data.analysisTypes.map(type => 
        musicAnalyzer.analyzeTrack({
          trackId: data.trackId,
          type,
          metadata: data.metadata,
          userId,
        })
      )
    );

    // Combine all analyses
    const combinedAnalysis = analyses.reduce((acc, analysis) => {
      acc[analysis.type] = analysis.result;
      return acc;
    }, {} as Record<string, any>);

    // Save analysis record
    await prisma.aIAnalysis.create({
      data: {
        userId,
        trackId: data.trackId,
        type: 'track_analysis',
        input: data.metadata,
        result: combinedAnalysis,
        confidence: analyses[0].confidence,
        model: analyses[0].model,
      },
    });

    res.json({
      success: true,
      data: {
        trackId: data.trackId,
        analysis: combinedAnalysis,
        recommendations: await musicAnalyzer.generateRecommendations(combinedAnalysis),
      },
    });
  } catch (error) {
    logger.error('Track analysis failed', { error });
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError 
        ? error.errors[0].message 
        : 'Failed to analyze track',
    });
  }
});

// Market analysis
router.post('/market', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = MarketAnalysisSchema.parse(req.body);

    const analysis = await marketAnalyzer.analyzeMarket({
      genre: data.genre,
      region: data.region,
      timeframe: data.timeframe,
      analysisTypes: data.analysisTypes,
      userId,
    });

    // Save analysis
    await prisma.aIAnalysis.create({
      data: {
        userId,
        type: 'market_analysis',
        input: data,
        result: analysis.data,
        model: analysis.model,
      },
    });

    res.json({
      success: true,
      data: analysis.data,
    });
  } catch (error) {
    logger.error('Market analysis failed', { error });
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError 
        ? error.errors[0].message 
        : 'Failed to analyze market',
    });
  }
});

// Competitor analysis
router.post('/competitors', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const data = CompetitorAnalysisSchema.parse(req.body);

    const analysis = await marketAnalyzer.analyzeCompetitors({
      artistNames: data.artistNames,
      metrics: data.metrics,
      userId,
    });

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error('Competitor analysis failed', { error });
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError 
        ? error.errors[0].message 
        : 'Failed to analyze competitors',
    });
  }
});

// Get performance predictions
router.post('/predict', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { trackId, releaseStrategy } = req.body;

    const predictions = await musicAnalyzer.predictPerformance({
      trackId,
      releaseStrategy,
      userId,
    });

    res.json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    logger.error('Performance prediction failed', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to generate predictions',
    });
  }
});

// Get audience insights
router.get('/audience', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const insights = await marketAnalyzer.getAudienceInsights(userId);

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    logger.error('Audience insights failed', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to generate audience insights',
    });
  }
});

// Get trend analysis
router.get('/trends/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const { region, period = 'current' } = req.query;

    const trends = await marketAnalyzer.getTrends({
      genre,
      region: region as string | undefined,
      period: period as string,
    });

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    logger.error('Trend analysis failed', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to analyze trends',
    });
  }
});

export { router as analysisRouter };