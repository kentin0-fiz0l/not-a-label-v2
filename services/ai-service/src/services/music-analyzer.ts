import { createLogger } from '@not-a-label/utils';
import { generateWithFallback } from '../lib/ai-providers';

const logger = createLogger('ai-service:music-analyzer');

interface TrackAnalysisParams {
  trackId: string;
  type: string;
  metadata: any;
  userId: string;
}

export class MusicAnalyzer {
  async analyzeTrack(params: TrackAnalysisParams): Promise<{
    type: string;
    result: any;
    confidence: number;
    model: string;
  }> {
    const analysisPrompts: Record<string, string> = {
      genre_classification: this.getGenreClassificationPrompt(params.metadata),
      mood_detection: this.getMoodDetectionPrompt(params.metadata),
      quality_assessment: this.getQualityAssessmentPrompt(params.metadata),
      commercial_potential: this.getCommercialPotentialPrompt(params.metadata),
      audience_fit: this.getAudienceFitPrompt(params.metadata),
      production_feedback: this.getProductionFeedbackPrompt(params.metadata),
    };

    const prompt = analysisPrompts[params.type];
    if (!prompt) {
      throw new Error(`Unknown analysis type: ${params.type}`);
    }

    const response = await generateWithFallback(prompt, {
      systemPrompt: 'You are a professional music analyst with expertise in music production, A&R, and market trends.',
      temperature: 0.6,
      maxTokens: 1500,
    });

    const result = this.parseAnalysisResult(response.content, params.type);

    return {
      type: params.type,
      result,
      confidence: result.confidence || 0.85,
      model: response.model,
    };
  }

  async generateRecommendations(analysis: Record<string, any>): Promise<{
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  }> {
    const prompt = `
Based on the following track analysis, provide actionable recommendations:

Analysis Results:
${JSON.stringify(analysis, null, 2)}

Generate recommendations in three categories:
1. Immediate Actions (can be done now)
2. Short-term Goals (1-3 months)
3. Long-term Strategy (3-12 months)

Focus on practical steps that will improve the track's performance and reach.
`;

    const response = await generateWithFallback(prompt, {
      systemPrompt: 'You are a music strategy consultant helping artists maximize their success.',
      temperature: 0.7,
    });

    return this.parseRecommendations(response.content);
  }

  async predictPerformance(params: {
    trackId: string;
    releaseStrategy?: any;
    userId: string;
  }): Promise<any> {
    const prompt = `
Predict the potential performance of a music track based on:
${params.releaseStrategy ? `Release Strategy: ${JSON.stringify(params.releaseStrategy)}` : ''}

Provide predictions for:
1. First week streaming numbers (range)
2. First month performance
3. Playlist potential (likelihood of editorial playlist placement)
4. Social media virality potential
5. Long-term performance outlook

Include confidence levels and factors that could impact these predictions.
Format as JSON.
`;

    const response = await generateWithFallback(prompt, {
      systemPrompt: 'You are a data scientist specializing in music streaming analytics and prediction models.',
      temperature: 0.6,
    });

    try {
      return JSON.parse(response.content);
    } catch {
      return {
        predictions: response.content,
        structured: false,
      };
    }
  }

  private getGenreClassificationPrompt(metadata: any): string {
    return `
Analyze the musical characteristics and classify the genre(s) of this track:
Title: ${metadata.title}
Artist: ${metadata.artist}
${metadata.genre ? `Stated Genre: ${metadata.genre}` : ''}

Provide:
1. Primary genre classification
2. Sub-genres or style descriptors
3. Similar artists/reference tracks
4. Genre trends and positioning
5. Crossover potential to other genres

Format as detailed JSON with confidence scores.
`;
  }

  private getMoodDetectionPrompt(metadata: any): string {
    return `
Analyze the emotional characteristics and mood of this track:
Title: ${metadata.title}
Artist: ${metadata.artist}

Determine:
1. Primary mood/emotion
2. Energy level (1-10)
3. Valence (positive/negative emotional tone)
4. Suitable contexts (workout, study, party, etc.)
5. Emotional journey/dynamics

Provide detailed analysis with specific examples.
`;
  }

  private getQualityAssessmentPrompt(metadata: any): string {
    return `
Assess the production quality and technical aspects of this track:
Title: ${metadata.title}
Artist: ${metadata.artist}

Evaluate:
1. Production quality (mixing, mastering)
2. Arrangement effectiveness
3. Performance quality
4. Overall professional standard
5. Areas for improvement
6. Strengths to highlight

Be constructive and specific in feedback.
`;
  }

  private getCommercialPotentialPrompt(metadata: any): string {
    return `
Evaluate the commercial potential of this track:
Title: ${metadata.title}
Artist: ${metadata.artist}
Genre: ${metadata.genre || 'Not specified'}

Analyze:
1. Market appeal (niche to mainstream scale)
2. Streaming platform potential
3. Radio potential
4. Sync licensing opportunities
5. Target audience size and engagement likelihood
6. Revenue potential across different channels

Provide realistic assessment with supporting reasoning.
`;
  }

  private getAudienceFitPrompt(metadata: any): string {
    return `
Identify the target audience for this track:
Title: ${metadata.title}
Artist: ${metadata.artist}

Determine:
1. Primary demographic (age, location, lifestyle)
2. Psychographic profile (interests, values, behaviors)
3. Existing fan base alignment
4. New audience opportunities
5. Platform preferences
6. Engagement patterns

Be specific and data-driven in your analysis.
`;
  }

  private getProductionFeedbackPrompt(metadata: any): string {
    return `
Provide detailed production feedback for this track:
Title: ${metadata.title}
Artist: ${metadata.artist}

Cover:
1. Mix balance and clarity
2. Arrangement structure and flow
3. Sound design and instrumentation
4. Vocal production (if applicable)
5. Dynamic range and loudness
6. Creative suggestions
7. Technical improvements

Provide actionable feedback that respects artistic vision.
`;
  }

  private parseAnalysisResult(content: string, type: string): any {
    try {
      // Try to parse as JSON first
      return JSON.parse(content);
    } catch {
      // Fallback to structured parsing based on type
      const result: any = {
        summary: content,
        details: {},
      };

      // Extract key points based on numbered lists or sections
      const sections = content.split(/\d+\.\s+/);
      sections.forEach((section, index) => {
        if (section.trim()) {
          result.details[`point_${index}`] = section.trim();
        }
      });

      return result;
    }
  }

  private parseRecommendations(content: string): {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  } {
    const recommendations = {
      immediate: [] as string[],
      shortTerm: [] as string[],
      longTerm: [] as string[],
    };

    // Parse sections
    const immediateMatch = content.match(/immediate[^:]*:\s*([^]*?)(?=short-term|long-term|$)/i);
    const shortTermMatch = content.match(/short-term[^:]*:\s*([^]*?)(?=long-term|$)/i);
    const longTermMatch = content.match(/long-term[^:]*:\s*([^]*?)$/i);

    if (immediateMatch) {
      recommendations.immediate = this.extractListItems(immediateMatch[1]);
    }
    if (shortTermMatch) {
      recommendations.shortTerm = this.extractListItems(shortTermMatch[1]);
    }
    if (longTermMatch) {
      recommendations.longTerm = this.extractListItems(longTermMatch[1]);
    }

    return recommendations;
  }

  private extractListItems(text: string): string[] {
    const items = text.match(/[-•]\s*([^\n]+)/g) || [];
    return items.map(item => item.replace(/^[-•]\s*/, '').trim());
  }
}