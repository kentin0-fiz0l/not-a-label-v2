import { Router } from 'express';
import { z } from 'zod';
import { createLogger } from '@not-a-label/utils';
import { ConversationManager } from '../services/conversation-manager';

const router = Router();
const logger = createLogger('ai-service:conversations');
const conversationManager = new ConversationManager();

// Get user's conversations
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { type, limit = 20 } = req.query;

    const conversations = await conversationManager.getUserConversations(
      userId,
      type as string | undefined,
      Number(limit)
    );

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    logger.error('Failed to get conversations', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversations',
    });
  }
});

// Get specific conversation with messages
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const conversation = await conversationManager.getConversation(id, userId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    const messages = await conversationManager.getConversationMessages(id);

    res.json({
      success: true,
      data: {
        conversation,
        messages,
      },
    });
  } catch (error) {
    logger.error('Failed to get conversation', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation',
    });
  }
});

// Update conversation title
router.patch('/:id', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { title } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Title is required',
      });
    }

    // Verify ownership
    const conversation = await conversationManager.getConversation(id, userId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    const updated = await conversationManager.updateConversationTitle(id, title);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    logger.error('Failed to update conversation', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to update conversation',
    });
  }
});

// Delete conversation
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const deleted = await conversationManager.deleteConversation(id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete conversation', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to delete conversation',
    });
  }
});

// Get conversation statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const stats = await conversationManager.getConversationStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to get conversation stats', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics',
    });
  }
});

export { router as conversationRouter };