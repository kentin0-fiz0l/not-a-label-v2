'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Plus,
  Music,
  MessageSquare,
  Calendar,
  MapPin,
  Star,
  Send,
  Filter,
  Search,
  Globe,
  Lock,
  Unlock,
} from 'lucide-react';
import Image from 'next/image';

interface Collaboration {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'production' | 'writing' | 'remix';
  status: 'open' | 'in_progress' | 'completed';
  creator: {
    id: string;
    name: string;
    image?: string;
    verified: boolean;
  };
  genre: string;
  budget?: string;
  deadline?: string;
  location?: string;
  applicants: number;
  createdAt: string;
}

interface Artist {
  id: string;
  name: string;
  image?: string;
  genres: string[];
  skills: string[];
  rating: number;
  collaborations: number;
  bio: string;
  verified: boolean;
}

export default function CollaboratePage() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [collabsRes, artistsRes] = await Promise.all([
        fetch('/api/collaborations'),
        fetch('/api/artists/recommended'),
      ]);

      if (collabsRes.ok) {
        setCollaborations(await collabsRes.json());
      }
      if (artistsRes.ok) {
        setArtists(await artistsRes.json());
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const CollaborationCard = ({ collab }: { collab: Collaboration }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{collab.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={collab.creator.image} />
                <AvatarFallback>{collab.creator.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">{collab.creator.name}</span>
              {collab.creator.verified && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
          </div>
          <Badge
            variant={collab.status === 'open' ? 'default' : 'secondary'}
          >
            {collab.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">
          {collab.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            <Music className="h-3 w-3 mr-1" />
            {collab.type}
          </Badge>
          <Badge variant="outline">{collab.genre}</Badge>
          {collab.budget && (
            <Badge variant="outline" className="text-green-600">
              ${collab.budget}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {collab.deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(collab.deadline).toLocaleDateString()}
              </span>
            )}
            {collab.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {collab.location}
              </span>
            )}
          </div>
          <span>{collab.applicants} applicants</span>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            View Details
          </Button>
          <Button size="sm" variant="outline">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ArtistCard = ({ artist }: { artist: Artist }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={artist.image} />
            <AvatarFallback>{artist.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{artist.name}</h3>
              {artist.verified && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>{artist.rating.toFixed(1)}</span>
              <span>•</span>
              <span>{artist.collaborations} collaborations</span>
            </div>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {artist.bio}
            </p>
            <div className="flex flex-wrap gap-1 mt-3">
              {artist.genres.map((genre) => (
                <Badge key={genre} variant="outline" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm">
                <Users className="h-4 w-4 mr-2" />
                Connect
              </Button>
              <Button size="sm" variant="outline">
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CreateCollaborationModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl m-4">
        <CardHeader>
          <CardTitle>Create Collaboration Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input placeholder="Looking for a vocalist for my new track" />
          </div>
          
          <div>
            <label className="text-sm font-medium">Type</label>
            <select className="w-full p-2 border rounded-md">
              <option>Feature</option>
              <option>Production</option>
              <option>Writing</option>
              <option>Remix</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe what you're looking for..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Genre</label>
              <Input placeholder="Hip Hop, R&B, etc." />
            </div>
            <div>
              <label className="text-sm font-medium">Budget (optional)</label>
              <Input type="number" placeholder="500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Deadline</label>
              <Input type="date" />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input placeholder="Remote or City" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Visibility</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="visibility" defaultChecked />
                <Globe className="h-4 w-4" />
                <span>Public</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="visibility" />
                <Lock className="h-4 w-4" />
                <span>Private</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1">Create Collaboration</Button>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Collaborate
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with artists and create amazing music together
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Collaboration
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="browse">Browse Opportunities</TabsTrigger>
          <TabsTrigger value="artists">Find Artists</TabsTrigger>
          <TabsTrigger value="my-collabs">My Collaborations</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search collaborations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  className="px-4 py-2 border rounded-md"
                  value={selectedType || ''}
                  onChange={(e) => setSelectedType(e.target.value || null)}
                >
                  <option value="">All Types</option>
                  <option value="feature">Feature</option>
                  <option value="production">Production</option>
                  <option value="writing">Writing</option>
                  <option value="remix">Remix</option>
                </select>
                <select
                  className="px-4 py-2 border rounded-md"
                  value={selectedGenre || ''}
                  onChange={(e) => setSelectedGenre(e.target.value || null)}
                >
                  <option value="">All Genres</option>
                  <option value="hip-hop">Hip Hop</option>
                  <option value="pop">Pop</option>
                  <option value="rnb">R&B</option>
                  <option value="electronic">Electronic</option>
                  <option value="rock">Rock</option>
                </select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Collaborations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collaborations.map((collab) => (
              <CollaborationCard key={collab.id} collab={collab} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="artists" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-collabs" className="space-y-6">
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No collaborations yet</h3>
            <p className="text-gray-600 mb-4">
              Start collaborating with other artists today
            </p>
            <Button onClick={() => setActiveTab('browse')}>
              Browse Opportunities
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {showCreateModal && <CreateCollaborationModal />}
    </div>
  );
}