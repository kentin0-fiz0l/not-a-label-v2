import PQueue from 'p-queue';
import { createLogger } from '@not-a-label/utils';
import { createClient } from 'redis';

const logger = createLogger('ai-service:queue-processor');

interface QueueJob {
  id: string;
  type: string;
  data: any;
  userId: string;
  priority: number;
  createdAt: Date;
}

export class QueueProcessor {
  private queue: PQueue;
  private redisClient: ReturnType<typeof createClient>;
  private isRunning: boolean = false;

  constructor() {
    // Initialize queue with concurrency limits
    this.queue = new PQueue({
      concurrency: 5, // Process 5 AI requests simultaneously
      interval: 1000, // Per second
      intervalCap: 10, // Max 10 per second
    });

    // Initialize Redis client
    this.redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.setupEventHandlers();
  }

  async start() {
    try {
      await this.redisClient.connect();
      this.isRunning = true;
      logger.info('Queue processor started');
      
      // Start processing loop
      this.processLoop();
    } catch (error) {
      logger.error('Failed to start queue processor', { error });
      throw error;
    }
  }

  async stop() {
    this.isRunning = false;
    await this.queue.onIdle();
    await this.redisClient.quit();
    logger.info('Queue processor stopped');
  }

  async addJob(job: Omit<QueueJob, 'id' | 'createdAt'>) {
    const jobWithMeta: QueueJob = {
      ...job,
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    // Store job in Redis
    await this.redisClient.zAdd('ai_jobs', {
      score: job.priority,
      value: JSON.stringify(jobWithMeta),
    });

    logger.info('Job added to queue', { jobId: jobWithMeta.id, type: job.type });
  }

  private async processLoop() {
    while (this.isRunning) {
      try {
        // Get highest priority job
        const jobs = await this.redisClient.zRange('ai_jobs', 0, 0, { REV: true });
        
        if (jobs.length > 0) {
          const jobData = JSON.parse(jobs[0]);
          
          // Remove from queue
          await this.redisClient.zRem('ai_jobs', jobs[0]);
          
          // Process job
          await this.queue.add(() => this.processJob(jobData));
        } else {
          // No jobs, wait a bit
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        logger.error('Error in process loop', { error });
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  private async processJob(job: QueueJob) {
    logger.info('Processing job', { jobId: job.id, type: job.type });
    
    try {
      // Process based on job type
      switch (job.type) {
        case 'batch_analysis':
          await this.processBatchAnalysis(job);
          break;
        case 'content_generation':
          await this.processContentGeneration(job);
          break;
        case 'scheduled_insights':
          await this.processScheduledInsights(job);
          break;
        default:
          logger.warn('Unknown job type', { type: job.type });
      }

      // Mark job as completed
      await this.markJobComplete(job.id);
    } catch (error) {
      logger.error('Job processing failed', { jobId: job.id, error });
      await this.handleJobError(job, error);
    }
  }

  private async processBatchAnalysis(job: QueueJob) {
    // Implementation for batch analysis
    logger.info('Processing batch analysis', { jobId: job.id });
    // Add actual processing logic here
  }

  private async processContentGeneration(job: QueueJob) {
    // Implementation for content generation
    logger.info('Processing content generation', { jobId: job.id });
    // Add actual processing logic here
  }

  private async processScheduledInsights(job: QueueJob) {
    // Implementation for scheduled insights
    logger.info('Processing scheduled insights', { jobId: job.id });
    // Add actual processing logic here
  }

  private async markJobComplete(jobId: string) {
    await this.redisClient.hSet('completed_jobs', jobId, JSON.stringify({
      completedAt: new Date(),
      status: 'completed',
    }));
    
    // Set expiry for completed jobs (7 days)
    await this.redisClient.expire(`completed_jobs:${jobId}`, 7 * 24 * 60 * 60);
  }

  private async handleJobError(job: QueueJob, error: any) {
    const errorData = {
      jobId: job.id,
      error: error.message || 'Unknown error',
      failedAt: new Date(),
      attempts: (job as any).attempts || 1,
    };

    // Store error
    await this.redisClient.hSet('failed_jobs', job.id, JSON.stringify(errorData));

    // Retry logic
    if (errorData.attempts < 3) {
      // Re-add to queue with lower priority
      await this.addJob({
        ...job,
        priority: job.priority - 1,
        data: {
          ...job.data,
          attempts: errorData.attempts + 1,
        },
      });
    }
  }

  private setupEventHandlers() {
    this.queue.on('active', () => {
      logger.debug('Queue active', { size: this.queue.size, pending: this.queue.pending });
    });

    this.queue.on('idle', () => {
      logger.debug('Queue idle');
    });

    this.redisClient.on('error', (error) => {
      logger.error('Redis client error', { error });
    });
  }

  getQueueStats() {
    return {
      size: this.queue.size,
      pending: this.queue.pending,
      isPaused: this.queue.isPaused,
      concurrency: this.queue.concurrency,
    };
  }
}

// Singleton instance
let queueProcessor: QueueProcessor;

export function startQueueProcessor() {
  if (!queueProcessor) {
    queueProcessor = new QueueProcessor();
    queueProcessor.start().catch(error => {
      logger.error('Failed to start queue processor', { error });
    });
  }
  return queueProcessor;
}

export function getQueueProcessor(): QueueProcessor {
  if (!queueProcessor) {
    throw new Error('Queue processor not initialized');
  }
  return queueProcessor;
}