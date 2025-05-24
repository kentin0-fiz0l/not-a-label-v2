import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { createLogger } from '@not-a-label/utils';

const logger = createLogger('ai-service:providers');

export let openai: OpenAI;
export let anthropic: Anthropic;

export function initializeAIProviders() {
  try {
    // Initialize OpenAI
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize Anthropic
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    logger.info('AI providers initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize AI providers', { error });
    throw error;
  }
}

export enum AIModel {
  GPT4 = 'gpt-4-turbo-preview',
  GPT35 = 'gpt-3.5-turbo',
  CLAUDE3 = 'claude-3-opus-20240229',
  CLAUDE_INSTANT = 'claude-3-sonnet-20240229',
}

export interface AIResponse {
  content: string;
  model: string;
  tokens: number;
  metadata?: Record<string, any>;
}

export async function generateWithOpenAI(
  prompt: string,
  model: AIModel = AIModel.GPT4,
  options?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }
): Promise<AIResponse> {
  try {
    const messages: any[] = [];
    
    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
    });

    const response = completion.choices[0];
    
    return {
      content: response.message.content || '',
      model,
      tokens: completion.usage?.total_tokens || 0,
      metadata: {
        finishReason: response.finish_reason,
      },
    };
  } catch (error) {
    logger.error('OpenAI generation failed', { error, model });
    throw error;
  }
}

export async function generateWithAnthropic(
  prompt: string,
  model: AIModel = AIModel.CLAUDE3,
  options?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }
): Promise<AIResponse> {
  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: options?.maxTokens ?? 2000,
      temperature: options?.temperature ?? 0.7,
      system: options?.systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    
    return {
      content: content.type === 'text' ? content.text : '',
      model,
      tokens: response.usage.input_tokens + response.usage.output_tokens,
      metadata: {
        stopReason: response.stop_reason,
      },
    };
  } catch (error) {
    logger.error('Anthropic generation failed', { error, model });
    throw error;
  }
}

export async function generateWithFallback(
  prompt: string,
  options?: {
    preferredProvider?: 'openai' | 'anthropic';
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }
): Promise<AIResponse> {
  const primaryProvider = options?.preferredProvider || 'openai';
  
  try {
    if (primaryProvider === 'openai') {
      return await generateWithOpenAI(prompt, AIModel.GPT4, options);
    } else {
      return await generateWithAnthropic(prompt, AIModel.CLAUDE3, options);
    }
  } catch (primaryError) {
    logger.warn(`Primary provider ${primaryProvider} failed, trying fallback`, { primaryError });
    
    try {
      if (primaryProvider === 'openai') {
        return await generateWithAnthropic(prompt, AIModel.CLAUDE3, options);
      } else {
        return await generateWithOpenAI(prompt, AIModel.GPT4, options);
      }
    } catch (fallbackError) {
      logger.error('Both AI providers failed', { primaryError, fallbackError });
      throw new Error('AI generation failed with all providers');
    }
  }
}