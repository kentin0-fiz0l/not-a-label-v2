'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Sparkles,
  TrendingUp,
  Clock,
  Radio,
  Search,
  Loader2,
  Play,
  Heart,
  Share2,
  MoreHorizontal,
} from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface Track {
  id: string;
  title: string;
  artist: {
    id: string;
    name: string;
    image?: string;
  };
  coverImage?: string;
  duration: number;
  plays: number;
  likes: number;
}

interface Recommendations {
  forYou: Track[];
  trending: Track[];
  newReleases: Track[];
  basedOnListening: Track[];
}

export default function DiscoverPage() {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('for-you');
  const [playlistPrompt, setPlaylistPrompt] = useState('');
  const [generatingPlaylist, setGeneratingPlaylist] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await fetch('/api/recommendations');
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIPlaylist = async () => {
    if (!playlistPrompt.trim()) return;

    setGeneratingPlaylist(true);
    try {
      const res = await fetch('/api/recommendations/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: playlistPrompt }),
      });

      if (res.ok) {
        const playlist = await res.json();
        // Handle generated playlist
        console.log('Generated playlist:', playlist);
      }
    } catch (error) {
      console.error('Failed to generate playlist:', error);
    } finally {
      setGeneratingPlaylist(false);
    }
  };

  const TrackCard = ({ track }: { track: Track }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <div className="relative aspect-square">
        <Image
          src={track.coverImage || '/placeholder-album.jpg'}
          alt={track.title}
          fill
          className="object-cover rounded-t-lg"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button size="icon" className="rounded-full">
            <Play className="h-4 w-4" fill="white" />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">{track.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {track.artist.name}
        </p>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{track.plays.toLocaleString()} plays</span>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Heart className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Discover
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find your next favorite track with AI-powered recommendations
        </p>
      </div>

      {/* AI Playlist Generator */}
      <Card className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Playlist Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-white/90">
            Describe your mood, activity, or vibe and let AI create the perfect playlist
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Upbeat songs for a morning workout..."
              value={playlistPrompt}
              onChange={(e) => setPlaylistPrompt(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              onKeyPress={(e) => e.key === 'Enter' && generateAIPlaylist()}
            />
            <Button
              onClick={generateAIPlaylist}
              disabled={generatingPlaylist}
              className="bg-white text-purple-600 hover:bg-white/90"
            >
              {generatingPlaylist ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Generate'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="for-you" className="flex items-center gap-2">
            <Radio className="h-4 w-4" />
            For You
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            New Releases
          </TabsTrigger>
          <TabsTrigger value="listening" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Based on Listening
          </TabsTrigger>
        </TabsList>

        <TabsContent value="for-you" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Made for You</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations?.forYou.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Trending Now</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations?.trending.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="new" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Fresh Releases</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations?.newReleases.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="listening" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Because You Listened To...
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations?.basedOnListening.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Genre Exploration */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Explore by Genre</h2>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="flex w-max space-x-4 p-4">
            {[
              'Pop',
              'Hip Hop',
              'Electronic',
              'Rock',
              'R&B',
              'Indie',
              'Jazz',
              'Classical',
              'Country',
              'Latin',
              'Metal',
              'Folk',
            ].map((genre) => (
              <Card
                key={genre}
                className="w-40 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div
                  className="h-40 bg-gradient-to-br from-purple-400 to-pink-400 rounded-t-lg flex items-center justify-center"
                >
                  <span className="text-white font-bold text-lg">{genre}</span>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Explore {genre}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}