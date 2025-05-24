import { z } from 'zod';

// User Types
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(30),
  displayName: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().url().optional(),
  isVerified: z.boolean().default(false),
  isPro: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Artist Profile Types
export const ArtistProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  stageName: z.string(),
  genres: z.array(z.string()),
  location: z.string().optional(),
  website: z.string().url().optional(),
  socialLinks: z.object({
    spotify: z.string().url().optional(),
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
    youtube: z.string().url().optional(),
    tiktok: z.string().url().optional(),
  }).optional(),
  monthlyListeners: z.number().default(0),
  totalStreams: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ArtistProfile = z.infer<typeof ArtistProfileSchema>;

// Music Types
export const TrackSchema = z.object({
  id: z.string().uuid(),
  artistId: z.string().uuid(),
  title: z.string(),
  duration: z.number(), // in seconds
  genre: z.string(),
  bpm: z.number().optional(),
  key: z.string().optional(),
  mood: z.string().optional(),
  fileUrl: z.string().url(),
  coverArt: z.string().url().optional(),
  isPublic: z.boolean().default(false),
  streams: z.number().default(0),
  likes: z.number().default(0),
  uploadedAt: z.date(),
  releasedAt: z.date().optional(),
});

export type Track = z.infer<typeof TrackSchema>;

export const AlbumSchema = z.object({
  id: z.string().uuid(),
  artistId: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  coverArt: z.string().url().optional(),
  releaseDate: z.date().optional(),
  trackIds: z.array(z.string().uuid()),
  isPublic: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Album = z.infer<typeof AlbumSchema>;

// Analytics Types
export const AnalyticsEventSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  eventType: z.enum(['stream', 'like', 'share', 'download', 'follow']),
  trackId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.date(),
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

export const AnalyticsMetricsSchema = z.object({
  userId: z.string().uuid(),
  period: z.enum(['day', 'week', 'month', 'year']),
  streams: z.number(),
  likes: z.number(),
  shares: z.number(),
  followers: z.number(),
  revenue: z.number(),
  topTracks: z.array(z.string().uuid()),
  demographics: z.object({
    ageGroups: z.record(z.number()),
    locations: z.record(z.number()),
    platforms: z.record(z.number()),
  }),
});

export type AnalyticsMetrics = z.infer<typeof AnalyticsMetricsSchema>;

// AI Assistant Types
export const AIConversationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  messages: z.array(z.object({
    id: z.string().uuid(),
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.date(),
  })),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AIConversation = z.infer<typeof AIConversationSchema>;

// Distribution Types
export const DistributionPlatformSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['streaming', 'social', 'store']),
  isConnected: z.boolean(),
  apiKey: z.string().optional(),
  refreshToken: z.string().optional(),
});

export type DistributionPlatform = z.infer<typeof DistributionPlatformSchema>;

export const DistributionJobSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  trackId: z.string().uuid(),
  platforms: z.array(z.string()),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  completedAt: z.date().optional(),
});

export type DistributionJob = z.infer<typeof DistributionJobSchema>;

// API Response Types
export const APIResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export type APIResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Event Types
export type PlatformEvent = 
  | { type: 'USER_REGISTERED'; payload: { userId: string; email: string } }
  | { type: 'TRACK_UPLOADED'; payload: { trackId: string; artistId: string } }
  | { type: 'TRACK_STREAMED'; payload: { trackId: string; userId: string } }
  | { type: 'DISTRIBUTION_COMPLETED'; payload: { jobId: string; platforms: string[] } };

// Configuration Types
export interface ServiceConfig {
  port: number;
  database: {
    url: string;
    ssl?: boolean;
  };
  redis: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    origin: string[];
  };
}

export interface AIServiceConfig extends ServiceConfig {
  openai: {
    apiKey: string;
    model: string;
  };
  anthropic: {
    apiKey: string;
    model: string;
  };
}

export interface MusicServiceConfig extends ServiceConfig {
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    region: string;
  };
  ffmpeg: {
    path: string;
  };
}