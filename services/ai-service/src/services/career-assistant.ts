import { createLogger } from '@not-a-label/utils';
import { generateWithFallback, AIResponse } from '../lib/ai-providers';
import { prisma } from '../lib/prisma';
import type { AIConversation } from '@prisma/client';

const logger = createLogger('ai-service:career-assistant');

interface CareerContext {
  genre?: string;
  experience?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  currentChallenges?: string[];
}

interface StrategyParams {
  userId: string;
  timeframe: string;
  currentStatus?: any;
  goals: string[];
  profile?: any;
}

export class CareerAssistant {
  async generateAdvice(
    question: string,
    context?: CareerContext,
    conversation?: AIConversation
  ): Promise<AIResponse> {
    const systemPrompt = this.buildCareerSystemPrompt(context);
    
    // Include conversation history if available
    let conversationContext = '';
    if (conversation) {
      const messages = await prisma.aIMessage.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'asc' },
        take: 10, // Last 10 messages for context
      });
      
      conversationContext = messages
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');
    }

    const prompt = `
${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''}
User question: ${question}

Please provide comprehensive, actionable career advice for this independent musician. 
Include specific steps they can take, timeline recommendations, and relevant industry insights.
`;

    return await generateWithFallback(prompt, {
      systemPrompt,
      temperature: 0.7,
      maxTokens: 2000,
    });
  }

  async generateStrategy(params: StrategyParams): Promise<{
    strategy: any;
    model: string;
    tokens: number;
  }> {
    const prompt = `
Create a detailed career strategy for an independent musician with the following context:

Timeframe: ${params.timeframe}
Current Status: ${JSON.stringify(params.currentStatus || {})}
Goals: ${params.goals.join(', ')}
Profile: ${JSON.stringify(params.profile || {})}

Generate a comprehensive strategy that includes:
1. Milestone Timeline: Specific milestones to achieve within the timeframe
2. Action Items: Concrete steps to take each month
3. Growth Tactics: Strategies for growing audience and engagement
4. Revenue Streams: Recommendations for monetization
5. Skill Development: Areas to focus on improving
6. Networking: Key connections to make
7. Content Strategy: What and when to release
8. Marketing Approach: How to promote effectively

Format the response as a structured JSON object.
`;

    const response = await generateWithFallback(prompt, {
      systemPrompt: 'You are an expert music industry strategist specializing in independent artist development.',
      temperature: 0.8,
      maxTokens: 3000,
    });

    try {
      const strategy = JSON.parse(response.content);
      return {
        strategy,
        model: response.model,
        tokens: response.tokens,
      };
    } catch (error) {
      logger.error('Failed to parse strategy JSON', { error });
      // Return structured fallback
      return {
        strategy: {
          milestones: [],
          actionItems: [],
          growthTactics: [],
          revenueStreams: [],
          skills: [],
          networking: [],
          contentStrategy: {},
          marketing: {},
          rawAdvice: response.content,
        },
        model: response.model,
        tokens: response.tokens,
      };
    }
  }

  async generateMilestones(params: {
    userId: string;
    timeframe: string;
    currentMetrics: any;
  }) {
    const prompt = `
Based on the following artist metrics and timeframe, generate specific, achievable milestones:

Current Metrics: ${JSON.stringify(params.currentMetrics)}
Timeframe: ${params.timeframe}

Create milestones for:
1. Streaming numbers
2. Social media growth
3. Revenue targets
4. Release schedule
5. Live performance goals
6. Industry connections

Make them SMART (Specific, Measurable, Achievable, Relevant, Time-bound).
Format as JSON array.
`;

    const response = await generateWithFallback(prompt, {
      systemPrompt: 'You are a music industry data analyst and strategist.',
      temperature: 0.6,
    });

    try {
      return JSON.parse(response.content);
    } catch {
      return [];
    }
  }

  async getIndustryInsights(params: {
    genre?: string;
    topic?: string;
    userId: string;
  }) {
    const prompt = `
Provide current industry insights for:
Genre: ${params.genre || 'general music industry'}
Topic: ${params.topic || 'current trends and opportunities'}

Include:
1. Current market trends
2. Emerging opportunities
3. Platform-specific insights
4. Audience behavior patterns
5. Successful case studies
6. Actionable recommendations

Focus on practical information that independent artists can use immediately.
`;

    const response = await generateWithFallback(prompt, {
      systemPrompt: 'You are a music industry analyst with deep knowledge of current trends.',
      temperature: 0.7,
    });

    return {
      insights: response.content,
      generatedAt: new Date(),
      model: response.model,
    };
  }

  async getNetworkingSuggestions(userId: string) {
    // Get user profile context
    const recentConversations = await prisma.aIConversation.findMany({
      where: { userId, type: 'career' },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    const prompt = `
Generate networking suggestions for an independent musician looking to expand their industry connections.

Provide suggestions for:
1. Industry professionals to connect with (by role, not specific names)
2. Online communities and platforms to join
3. Events and conferences to attend
4. Collaboration opportunities
5. Mentorship possibilities
6. Strategic partnership ideas

Make suggestions practical and accessible for independent artists.
`;

    const response = await generateWithFallback(prompt, {
      systemPrompt: 'You are a music industry networking expert.',
      temperature: 0.8,
    });

    return {
      suggestions: response.content,
      categories: [
        'Industry Professionals',
        'Communities',
        'Events',
        'Collaborations',
        'Mentorship',
        'Partnerships',
      ],
    };
  }

  private buildCareerSystemPrompt(context?: CareerContext): string {
    let prompt = `You are an experienced music industry career advisor specializing in helping independent musicians succeed. 
You have deep knowledge of:
- Music industry trends and best practices
- Digital marketing and social media strategies
- Revenue streams and monetization
- Artist development and branding
- Distribution and playlist strategies
- Live performance and touring
- Music production and release strategies

You provide practical, actionable advice tailored to each artist's unique situation.`;

    if (context?.genre) {
      prompt += `\nThe artist works in the ${context.genre} genre.`;
    }

    if (context?.experience) {
      prompt += `\nThe artist has ${context.experience} level experience.`;
    }

    if (context?.goals && context.goals.length > 0) {
      prompt += `\nTheir main goals are: ${context.goals.join(', ')}.`;
    }

    if (context?.currentChallenges && context.currentChallenges.length > 0) {
      prompt += `\nThey are currently facing: ${context.currentChallenges.join(', ')}.`;
    }

    return prompt;
  }
}