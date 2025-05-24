import { createLogger } from '@not-a-label/utils';
import { generateWithFallback, AIResponse } from '../lib/ai-providers';
import { prisma } from '../lib/prisma';

const logger = createLogger('ai-service:content-generator');

interface BioParams {
  userId: string;
  style: 'professional' | 'casual' | 'creative' | 'short';
  details: {
    genre: string;
    achievements?: string[];
    influences?: string[];
    story?: string;
    tone?: string;
  };
  platform?: string;
}

interface SocialPostParams {
  userId: string;
  type: string;
  platform: string;
  context: {
    topic: string;
    mood?: string;
    callToAction?: string;
    hashtags?: boolean;
    emojis?: boolean;
  };
}

export class ContentGenerator {
  async generateBio(params: BioParams): Promise<{
    content: string;
    variations?: string[];
    model: string;
    tokens: number;
  }> {
    const characterLimits: Record<string, number> = {
      instagram: 150,
      spotify: 1500,
      press: 500,
      general: 300,
    };

    const limit = params.platform ? characterLimits[params.platform] : 300;

    const prompt = `
Create a ${params.style} artist bio for a ${params.details.genre} musician.

Details:
${params.details.achievements ? `Achievements: ${params.details.achievements.join(', ')}` : ''}
${params.details.influences ? `Influences: ${params.details.influences.join(', ')}` : ''}
${params.details.story ? `Background: ${params.details.story}` : ''}
${params.details.tone ? `Tone: ${params.details.tone}` : ''}

Requirements:
- Style: ${params.style}
- Platform: ${params.platform || 'general use'}
- Character limit: approximately ${limit} characters
- Make it engaging and authentic
- Highlight unique aspects
${params.style === 'short' ? '- Keep it concise and impactful' : ''}

Generate the bio and also provide 2 alternative versions with different angles.
`;

    const response = await generateWithFallback(prompt, {
      systemPrompt: 'You are a professional music journalist and copywriter specializing in artist biographies.',
      temperature: 0.8,
      maxTokens: 1500,
    });

    // Extract variations if provided
    const content = response.content;
    const variations = this.extractVariations(content);

    return {
      content: variations[0] || content,
      variations: variations.slice(1),
      model: response.model,
      tokens: response.tokens,
    };
  }

  async generateSocialPosts(params: SocialPostParams): Promise<{
    posts: Array<{
      content: string;
      hashtags?: string[];
      type: string;
    }>;
    model: string;
    tokens: number;
  }> {
    const platformLimits: Record<string, number> = {
      twitter: 280,
      instagram: 2200,
      facebook: 63206,
      tiktok: 150,
    };

    const prompt = `
Create ${params.type} social media posts for ${params.platform}.

Context:
- Topic: ${params.context.topic}
${params.context.mood ? `- Mood: ${params.context.mood}` : ''}
${params.context.callToAction ? `- Call to Action: ${params.context.callToAction}` : ''}

Requirements:
- Platform: ${params.platform} (character limit: ${platformLimits[params.platform]})
- Include hashtags: ${params.context.hashtags ? 'Yes' : 'No'}
- Include emojis: ${params.context.emojis ? 'Yes' : 'No'}
- Make it engaging and platform-appropriate
- Generate 3 variations

Format each post as:
Post 1:
[Content]
${params.context.hashtags ? 'Hashtags: [list]' : ''}

Post 2:
[Content]
${params.context.hashtags ? 'Hashtags: [list]' : ''}

Post 3:
[Content]
${params.context.hashtags ? 'Hashtags: [list]' : ''}
`;

    const response = await generateWithFallback(prompt, {
      systemPrompt: 'You are a social media expert specializing in music industry content.',
      temperature: 0.9,
      maxTokens: 1000,
    });

    const posts = this.parseSocialPosts(response.content, params.type);

    return {
      posts,
      model: response.model,
      tokens: response.tokens,
    };
  }

  async generatePressRelease(params: {
    userId: string;
    type: string;
    details: any;
  }): Promise<{
    content: string;
    sections: Record<string, string>;
    model: string;
    tokens: number;
  }> {
    const prompt = `
Create a professional press release for a ${params.type} announcement.

Details:
${JSON.stringify(params.details, null, 2)}

Structure the press release with:
1. Headline
2. Subheadline
3. Location and Date
4. Opening paragraph (who, what, when, where, why)
5. Body paragraphs with details
6. Quotes (if provided)
7. About the Artist section
8. Contact Information placeholder

Make it newsworthy, professional, and ready for distribution.
`;

    const response = await generateWithFallback(prompt, {
      systemPrompt: 'You are a music industry publicist with expertise in writing press releases.',
      temperature: 0.6,
      maxTokens: 2000,
    });

    const sections = this.extractPressReleaseSections(response.content);

    return {
      content: response.content,
      sections,
      model: response.model,
      tokens: response.tokens,
    };
  }

  async generateEmailTemplate(params: {
    userId: string;
    type: string;
    recipient: string;
    context: any;
  }): Promise<{
    subject: string;
    body: string;
    preview: string;
    model: string;
    tokens: number;
  }> {
    const prompt = `
Create a ${params.type} email template for ${params.recipient}.

Context:
${JSON.stringify(params.context, null, 2)}

Generate:
1. Subject line (compelling and clear)
2. Preview text (50 characters)
3. Email body with:
   - Personalized greeting
   - Main message
   - Clear call to action
   - Professional closing

Tone: ${params.context.tone || 'professional yet friendly'}
Make it engaging and appropriate for the recipient type.
`;

    const response = await generateWithFallback(prompt, {
      systemPrompt: 'You are an email marketing expert for the music industry.',
      temperature: 0.7,
      maxTokens: 1500,
    });

    const parsed = this.parseEmailTemplate(response.content);

    return {
      ...parsed,
      model: response.model,
      tokens: response.tokens,
    };
  }

  async getContentSuggestions(userId: string, type: string) {
    const prompt = `
Generate content ideas for an independent musician.
Type: ${type === 'all' ? 'all content types' : type}

Provide 10 creative content suggestions including:
- Content type
- Platform recommendations
- Timing suggestions
- Engagement potential
- Production difficulty

Focus on ideas that:
- Build authentic connection with fans
- Showcase personality and music
- Are feasible for independent artists
- Drive engagement and growth
`;

    const response = await generateWithFallback(prompt, {
      systemPrompt: 'You are a content strategist for independent musicians.',
      temperature: 0.9,
      maxTokens: 1500,
    });

    return this.parseContentSuggestions(response.content);
  }

  async generateContentCalendar(params: {
    userId: string;
    timeframe: string;
    goals?: string[];
  }) {
    const prompt = `
Create a content calendar for the next ${params.timeframe}.
${params.goals ? `Goals: ${params.goals.join(', ')}` : ''}

Include:
- Daily/weekly posting schedule
- Content types and themes
- Platform-specific recommendations
- Special dates and opportunities
- Batch creation suggestions

Format as a structured calendar with specific dates and content ideas.
`;

    const response = await generateWithFallback(prompt, {
      systemPrompt: 'You are a social media strategist specializing in music marketing.',
      temperature: 0.7,
      maxTokens: 2000,
    });

    return this.parseContentCalendar(response.content);
  }

  private extractVariations(content: string): string[] {
    // Simple extraction logic - can be improved with better parsing
    const variations = content.split(/\n\n(?:Alternative|Variation|Version)\s*\d*:?\s*/i);
    return variations.filter(v => v.trim().length > 50);
  }

  private parseSocialPosts(content: string, type: string): Array<any> {
    const posts: Array<any> = [];
    const postBlocks = content.split(/Post\s+\d+:/i).filter(p => p.trim());

    for (const block of postBlocks) {
      const lines = block.trim().split('\n');
      const hashtagLine = lines.find(l => l.toLowerCase().includes('hashtag'));
      const contentLines = lines.filter(l => !l.toLowerCase().includes('hashtag'));

      posts.push({
        content: contentLines.join('\n').trim(),
        hashtags: hashtagLine ? this.extractHashtags(hashtagLine) : [],
        type,
      });
    }

    return posts.length > 0 ? posts : [{
      content: content.trim(),
      hashtags: this.extractHashtags(content),
      type,
    }];
  }

  private extractHashtags(text: string): string[] {
    const matches = text.match(/#\w+/g) || [];
    return matches.map(tag => tag.replace('#', ''));
  }

  private extractPressReleaseSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    
    // Extract headline
    const headlineMatch = content.match(/(?:headline|title):\s*(.+)/i);
    if (headlineMatch) sections.headline = headlineMatch[1].trim();

    // Extract other sections
    const sectionNames = ['subheadline', 'opening', 'body', 'quotes', 'about', 'contact'];
    for (const section of sectionNames) {
      const regex = new RegExp(`${section}:?\\s*([\\s\\S]+?)(?=\\n(?:${sectionNames.join('|')})|$)`, 'i');
      const match = content.match(regex);
      if (match) sections[section] = match[1].trim();
    }

    return sections;
  }

  private parseEmailTemplate(content: string): {
    subject: string;
    body: string;
    preview: string;
  } {
    const subjectMatch = content.match(/subject(?:\s*line)?:\s*(.+)/i);
    const previewMatch = content.match(/preview(?:\s*text)?:\s*(.+)/i);
    
    const subject = subjectMatch ? subjectMatch[1].trim() : 'Your Subject Here';
    const preview = previewMatch ? previewMatch[1].trim() : subject.substring(0, 50);
    
    // Extract body - everything after the preview/subject sections
    const bodyStart = content.search(/(?:body|email\s*body|main\s*content):/i);
    const body = bodyStart !== -1 
      ? content.substring(bodyStart).replace(/^[^:]+:\s*/, '').trim()
      : content;

    return { subject, body, preview };
  }

  private parseContentSuggestions(content: string): Array<any> {
    // Parse the suggestions into structured format
    const suggestions = [];
    const blocks = content.split(/\d+\.\s+/).filter(b => b.trim());

    for (const block of blocks) {
      suggestions.push({
        idea: block.split('\n')[0]?.trim(),
        details: block,
      });
    }

    return suggestions;
  }

  private parseContentCalendar(content: string): any {
    // Parse calendar into structured format
    return {
      calendar: content,
      weeks: [], // Would parse into weekly structure
      summary: {
        totalPosts: 0,
        byPlatform: {},
        byType: {},
      },
    };
  }
}