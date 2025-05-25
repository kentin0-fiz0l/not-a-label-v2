import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TrackFeatures {
  tempo: number;
  energy: number;
  danceability: number;
  valence: number; // Musical positivity
  acousticness: number;
  instrumentalness: number;
  speechiness: number;
  loudness: number;
}

interface UserPreferences {
  genres: string[];
  moods: string[];
  recentlyPlayed: string[];
  likedTracks: string[];
  skippedTracks: string[];
}

export class MusicRecommendationEngine {
  /**
   * Analyze audio features of a track using AI
   */
  static async analyzeTrackFeatures(audioUrl: string): Promise<TrackFeatures> {
    // In production, integrate with audio analysis service like Spotify API or Essentia
    // For now, return mock data
    return {
      tempo: 120 + Math.random() * 60,
      energy: Math.random(),
      danceability: Math.random(),
      valence: Math.random(),
      acousticness: Math.random(),
      instrumentalness: Math.random(),
      speechiness: Math.random(),
      loudness: -20 + Math.random() * 20,
    };
  }

  /**
   * Generate track embeddings using AI
   */
  static async generateTrackEmbedding(track: {
    title: string;
    artist: string;
    genre: string;
    tags: string[];
    features: TrackFeatures;
  }): Promise<number[]> {
    const description = `
      Track: ${track.title} by ${track.artist}
      Genre: ${track.genre}
      Tags: ${track.tags.join(', ')}
      Tempo: ${track.features.tempo} BPM
      Energy: ${track.features.energy}
      Mood: ${track.features.valence > 0.5 ? 'positive' : 'melancholic'}
    `;

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: description,
    });

    return response.data[0].embedding;
  }

  /**
   * Find similar tracks using vector similarity
   */
  static async findSimilarTracks(
    trackId: string,
    limit: number = 10
  ): Promise<string[]> {
    // Get track embedding
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: { artist: true },
    });

    if (!track || !track.embedding) {
      return [];
    }

    // Use vector similarity search (requires pgvector extension)
    const similarTracks = await prisma.$queryRaw<{ id: string; similarity: number }[]>`
      SELECT id, 1 - (embedding <=> ${track.embedding}::vector) as similarity
      FROM tracks
      WHERE id != ${trackId}
        AND status = 'published'
      ORDER BY embedding <=> ${track.embedding}::vector
      LIMIT ${limit}
    `;

    return similarTracks.map(t => t.id);
  }

  /**
   * Generate personalized recommendations for a user
   */
  static async getPersonalizedRecommendations(
    userId: string,
    limit: number = 20
  ): Promise<{
    forYou: string[];
    trending: string[];
    newReleases: string[];
    basedOnListening: string[];
  }> {
    // Get user preferences
    const userPreferences = await this.getUserPreferences(userId);
    
    // Get user's listening profile embedding
    const userEmbedding = await this.generateUserEmbedding(userPreferences);
    
    // Find tracks matching user profile
    const forYou = await this.findTracksMatchingProfile(userEmbedding, limit);
    
    // Get trending tracks
    const trending = await this.getTrendingTracks(limit);
    
    // Get new releases in user's preferred genres
    const newReleases = await this.getNewReleases(userPreferences.genres, limit);
    
    // Get recommendations based on recently played
    const basedOnListening = await this.getCollaborativeRecommendations(
      userId,
      userPreferences.recentlyPlayed,
      limit
    );

    return {
      forYou,
      trending,
      newReleases,
      basedOnListening,
    };
  }

  /**
   * Get user preferences from listening history
   */
  private static async getUserPreferences(userId: string): Promise<UserPreferences> {
    // Get user's listening history
    const listeningHistory = await prisma.playbackEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        track: {
          include: { genres: true },
        },
      },
    });

    // Extract preferences
    const genres = new Set<string>();
    const moods = new Set<string>();
    const recentlyPlayed: string[] = [];
    const likedTracks: string[] = [];

    for (const event of listeningHistory) {
      if (event.track.genres) {
        event.track.genres.forEach(g => genres.add(g.name));
      }
      
      if (event.completionRate > 0.8) {
        likedTracks.push(event.trackId);
      }
      
      if (recentlyPlayed.length < 10) {
        recentlyPlayed.push(event.trackId);
      }
    }

    // Get explicitly liked tracks
    const likes = await prisma.like.findMany({
      where: { userId, type: 'track' },
      select: { targetId: true },
    });
    
    likes.forEach(like => likedTracks.push(like.targetId));

    return {
      genres: Array.from(genres),
      moods: Array.from(moods),
      recentlyPlayed,
      likedTracks: [...new Set(likedTracks)],
      skippedTracks: [], // TODO: Track skips
    };
  }

  /**
   * Generate user profile embedding
   */
  private static async generateUserEmbedding(
    preferences: UserPreferences
  ): Promise<number[]> {
    const profile = `
      User music preferences:
      Favorite genres: ${preferences.genres.join(', ')}
      Preferred moods: ${preferences.moods.join(', ')}
      Recently enjoyed ${preferences.likedTracks.length} tracks
    `;

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: profile,
    });

    return response.data[0].embedding;
  }

  /**
   * Find tracks matching user profile
   */
  private static async findTracksMatchingProfile(
    userEmbedding: number[],
    limit: number
  ): Promise<string[]> {
    // Vector similarity search
    const matches = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM tracks
      WHERE status = 'published'
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${userEmbedding}::vector
      LIMIT ${limit}
    `;

    return matches.map(m => m.id);
  }

  /**
   * Get trending tracks
   */
  private static async getTrendingTracks(limit: number): Promise<string[]> {
    const trending = await prisma.track.findMany({
      where: {
        status: 'published',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      orderBy: [
        { plays: 'desc' },
        { likes: 'desc' },
        { shares: 'desc' },
      ],
      take: limit,
      select: { id: true },
    });

    return trending.map(t => t.id);
  }

  /**
   * Get new releases in specified genres
   */
  private static async getNewReleases(
    genres: string[],
    limit: number
  ): Promise<string[]> {
    const newReleases = await prisma.track.findMany({
      where: {
        status: 'published',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
        genres: {
          some: {
            name: { in: genres },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true },
    });

    return newReleases.map(t => t.id);
  }

  /**
   * Collaborative filtering recommendations
   */
  private static async getCollaborativeRecommendations(
    userId: string,
    recentTracks: string[],
    limit: number
  ): Promise<string[]> {
    if (recentTracks.length === 0) return [];

    // Find users with similar taste
    const similarUsers = await prisma.$queryRaw<{ userId: string }[]>`
      SELECT DISTINCT p2.user_id as userId
      FROM playback_events p1
      JOIN playback_events p2 ON p1.track_id = p2.track_id
      WHERE p1.user_id = ${userId}
        AND p2.user_id != ${userId}
        AND p1.completion_rate > 0.8
        AND p2.completion_rate > 0.8
      GROUP BY p2.user_id
      HAVING COUNT(DISTINCT p1.track_id) >= 3
      LIMIT 50
    `;

    if (similarUsers.length === 0) return [];

    // Get tracks liked by similar users
    const recommendations = await prisma.$queryRaw<{ id: string }[]>`
      SELECT DISTINCT t.id
      FROM tracks t
      JOIN playback_events p ON t.id = p.track_id
      WHERE p.user_id IN (${similarUsers.map(u => u.userId).join(',')})
        AND p.completion_rate > 0.8
        AND t.id NOT IN (${recentTracks.join(',')})
        AND t.status = 'published'
      ORDER BY COUNT(DISTINCT p.user_id) DESC
      LIMIT ${limit}
    `;

    return recommendations.map(r => r.id);
  }

  /**
   * Generate AI-powered playlist
   */
  static async generatePlaylist(
    prompt: string,
    userId: string,
    trackCount: number = 20
  ): Promise<{
    name: string;
    description: string;
    tracks: string[];
  }> {
    // Use AI to understand the playlist request
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a music curator AI. Generate a playlist based on the user's request.
                   Return a JSON object with: name (playlist name), description (brief description),
                   and criteria (search criteria for finding matching tracks).`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const playlistInfo = JSON.parse(response.choices[0].message.content!);
    
    // Generate embedding for the playlist concept
    const playlistEmbedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: `${playlistInfo.name}: ${playlistInfo.description}`,
    });

    // Find matching tracks
    const tracks = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM tracks
      WHERE status = 'published'
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${playlistEmbedding.data[0].embedding}::vector
      LIMIT ${trackCount}
    `;

    return {
      name: playlistInfo.name,
      description: playlistInfo.description,
      tracks: tracks.map(t => t.id),
    };
  }
}