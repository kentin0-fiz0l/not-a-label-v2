'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  Share2,
  MoreHorizontal,
  Lock,
} from 'lucide-react';
import Image from 'next/image';
import { analytics } from '@/packages/shared/src/lib/analytics';

interface Track {
  id: string;
  title: string;
  artist: {
    id: string;
    name: string;
  };
  album?: {
    id: string;
    name: string;
    coverImage?: string;
  };
  duration: number;
  streamUrl?: string;
  isProtected: boolean;
  previewUrl?: string;
}

interface MusicPlayerProps {
  track: Track;
  playlist?: Track[];
  onTrackEnd?: () => void;
}

export function MusicPlayer({ track, playlist = [], onTrackEnd }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [streamToken, setStreamToken] = useState<string | null>(null);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [playbackStartTime, setPlaybackStartTime] = useState<number | null>(null);

  useEffect(() => {
    // Get secure stream token for protected tracks
    if (track.isProtected && !track.previewUrl) {
      fetchStreamToken();
    }
  }, [track]);

  useEffect(() => {
    // Set up audio element
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const updateBuffer = () => {
      if (audio.buffered.length > 0) {
        const buffered = audio.buffered.end(audio.buffered.length - 1);
        setBufferProgress((buffered / audio.duration) * 100);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('progress', updateBuffer);
    audio.addEventListener('ended', handleTrackEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('progress', updateBuffer);
      audio.removeEventListener('ended', handleTrackEnd);
    };
  }, []);

  const fetchStreamToken = async () => {
    try {
      const res = await fetch(`/api/tracks/${track.id}/stream-token`, {
        method: 'POST',
      });
      
      if (res.ok) {
        const { token } = await res.json();
        setStreamToken(token);
      }
    } catch (error) {
      console.error('Failed to get stream token:', error);
    }
  };

  const getStreamUrl = () => {
    if (!track.isProtected) {
      return track.streamUrl;
    }
    
    if (track.previewUrl) {
      return track.previewUrl; // 30-second preview for non-subscribers
    }
    
    if (streamToken) {
      return `${track.streamUrl}?token=${streamToken}`;
    }
    
    return null;
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      trackPlaybackTime();
    } else {
      audio.play();
      setPlaybackStartTime(Date.now());
    }
    setIsPlaying(!isPlaying);
  };

  const trackPlaybackTime = () => {
    if (!playbackStartTime) return;
    
    const playbackDuration = (Date.now() - playbackStartTime) / 1000;
    const completed = currentTime >= duration - 1;
    
    analytics.trackPlayback(track.id, playbackDuration, completed);
    setPlaybackStartTime(null);
  };

  const handleTrackEnd = () => {
    trackPlaybackTime();
    
    if (isRepeat) {
      audioRef.current?.play();
      setPlaybackStartTime(Date.now());
    } else {
      onTrackEnd?.();
    }
  };

  const seek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changeVolume = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleLike = async () => {
    try {
      const res = await fetch(`/api/tracks/${track.id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      });
      
      if (res.ok) {
        setIsLiked(!isLiked);
        analytics.track(isLiked ? 'track_unliked' : 'track_liked', {
          track_id: track.id,
        });
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const shareTrack = async () => {
    if (navigator.share) {
      await navigator.share({
        title: track.title,
        text: `Check out "${track.title}" by ${track.artist.name}`,
        url: `${window.location.origin}/track/${track.id}`,
      });
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/track/${track.id}`);
    }
    
    analytics.trackShare('track', track.id, 'native');
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const streamUrl = getStreamUrl();

  return (
    <Card className="p-6">
      <audio
        ref={audioRef}
        src={streamUrl || undefined}
        preload="metadata"
      />
      
      {/* Track Info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Image
            src={track.album?.coverImage || '/placeholder-album.jpg'}
            alt={track.title}
            width={80}
            height={80}
            className="rounded-lg"
          />
          {track.isProtected && !streamToken && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Lock className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{track.title}</h3>
          <p className="text-gray-600 dark:text-gray-400">{track.artist.name}</p>
          {track.album && (
            <p className="text-sm text-gray-500">{track.album.name}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleLike}
            className={isLiked ? 'text-red-500' : ''}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          <Button size="icon" variant="ghost" onClick={shareTrack}>
            <Share2 className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-6">
        <div className="relative">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={seek}
            disabled={!streamUrl}
            className="relative z-10"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"
            style={{ width: `${bufferProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsShuffle(!isShuffle)}
          className={isShuffle ? 'text-purple-600' : ''}
        >
          <Shuffle className="h-4 w-4" />
        </Button>
        
        <Button size="icon" variant="ghost">
          <SkipBack className="h-5 w-5" />
        </Button>
        
        <Button
          size="icon"
          onClick={togglePlayPause}
          disabled={!streamUrl}
          className="h-12 w-12"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" fill="white" />
          ) : (
            <Play className="h-6 w-6" fill="white" />
          )}
        </Button>
        
        <Button size="icon" variant="ghost">
          <SkipForward className="h-5 w-5" />
        </Button>
        
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsRepeat(!isRepeat)}
          className={isRepeat ? 'text-purple-600' : ''}
        >
          <Repeat className="h-4 w-4" />
        </Button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" onClick={toggleMute}>
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          max={1}
          step={0.01}
          onValueChange={changeVolume}
          className="w-24"
        />
      </div>

      {/* DRM Notice */}
      {track.isProtected && !streamToken && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm">
          <p className="text-amber-800 dark:text-amber-200">
            This track requires a subscription. You're listening to a 30-second preview.
          </p>
        </div>
      )}
    </Card>
  );
}