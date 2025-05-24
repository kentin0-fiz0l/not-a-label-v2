import { createLogger } from '@not-a-label/utils';
import { prisma } from '../lib/prisma';
import type { AIConversation, AIMessage } from '@prisma/client';

const logger = createLogger('ai-service:conversation-manager');

export class ConversationManager {
  async createConversation(
    userId: string,
    type: string,
    initialTitle?: string
  ): Promise<AIConversation> {
    const title = initialTitle || this.generateTitle(type);
    
    return await prisma.aIConversation.create({
      data: {
        userId,
        type,
        title,
      },
    });
  }

  async getConversation(
    conversationId: string,
    userId: string
  ): Promise<AIConversation | null> {
    return await prisma.aIConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });
  }

  async getUserConversations(
    userId: string,
    type?: string,
    limit: number = 20
  ): Promise<AIConversation[]> {
    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    return await prisma.aIConversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
  }

  async addMessage(
    conversationId: string,
    role: string,
    content: string,
    metadata?: any
  ): Promise<AIMessage> {
    const message = await prisma.aIMessage.create({
      data: {
        conversationId,
        role,
        content,
        metadata,
        model: metadata?.model,
        tokens: metadata?.tokens,
      },
    });

    // Update conversation timestamp
    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async getConversationMessages(
    conversationId: string,
    limit?: number
  ): Promise<AIMessage[]> {
    return await prisma.aIMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      ...(limit && { take: limit }),
    });
  }

  async updateConversationTitle(
    conversationId: string,
    title: string
  ): Promise<AIConversation> {
    return await prisma.aIConversation.update({
      where: { id: conversationId },
      data: { title },
    });
  }

  async deleteConversation(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    try {
      await prisma.aIConversation.deleteMany({
        where: {
          id: conversationId,
          userId,
        },
      });
      return true;
    } catch (error) {
      logger.error('Failed to delete conversation', { error, conversationId });
      return false;
    }
  }

  async getConversationStats(userId: string) {
    const [total, byType, recentActivity] = await Promise.all([
      prisma.aIConversation.count({ where: { userId } }),
      prisma.aIConversation.groupBy({
        by: ['type'],
        where: { userId },
        _count: true,
      }),
      prisma.aIMessage.count({
        where: {
          conversation: { userId },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    return {
      totalConversations: total,
      conversationsByType: byType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {} as Record<string, number>),
      messagesLast30Days: recentActivity,
    };
  }

  private generateTitle(type: string): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    
    const titles: Record<string, string> = {
      career: `Career Guidance - ${dateStr}`,
      content: `Content Creation - ${dateStr}`,
      analysis: `Music Analysis - ${dateStr}`,
      general: `AI Assistant - ${dateStr}`,
    };

    return titles[type] || `Conversation - ${dateStr}`;
  }
}