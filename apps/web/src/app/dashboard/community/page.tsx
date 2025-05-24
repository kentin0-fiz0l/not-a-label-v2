'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users, Search, Music, Heart, MessageSquare, Share2,
  MoreVertical, TrendingUp, Calendar, MapPin, Globe,
  Verified, Play, UserPlus, Filter, Star, Sparkles,
  Plus
} from 'lucide-react'
import { EmptyState } from '@/components/empty-state'

const featuredArtists = [
  {
    id: '1',
    name: 'Luna Rodriguez',
    avatar: null,
    genre: 'Electronic',
    location: 'Los Angeles, CA',
    followers: 12450,
    tracks: 24,
    verified: true,
    bio: 'Electronic music producer blending ambient soundscapes with deep house rhythms.',
    recentTrack: 'Midnight Dreams',
    plays: 45320,
  },
  {
    id: '2',
    name: 'The Midnight Collective',
    avatar: null,
    genre: 'Indie Rock',
    location: 'Brooklyn, NY',
    followers: 8920,
    tracks: 18,
    verified: false,
    bio: 'Four-piece indie rock band creating nostalgic sounds for the modern era.',
    recentTrack: 'City Lights',
    plays: 32100,
  },
  {
    id: '3',
    name: 'Jasmine Chen',
    avatar: null,
    genre: 'R&B/Soul',
    location: 'Toronto, CA',
    followers: 15600,
    tracks: 32,
    verified: true,
    bio: 'Soulful vocals meet contemporary R&B production. Grammy-nominated artist.',
    recentTrack: 'Golden Hour',
    plays: 67800,
  },
]

const collaborations = [
  {
    id: '1',
    title: 'Looking for vocalist for electronic track',
    artist: 'DJ Nexus',
    genre: 'House/Electronic',
    type: 'Vocalist Needed',
    budget: '$500-1000',
    deadline: '2 weeks',
    responses: 12,
  },
  {
    id: '2',
    title: 'Producer wanted for indie pop album',
    artist: 'Sarah Mills',
    genre: 'Indie Pop',
    type: 'Producer Needed',
    budget: 'Revenue share',
    deadline: '1 month',
    responses: 8,
  },
  {
    id: '3',
    title: 'Guitarist for live performances',
    artist: 'The Velvet Underground Revival',
    genre: 'Rock',
    type: 'Live Performance',
    budget: '$200/show',
    deadline: 'Ongoing',
    responses: 5,
  },
]

const communityPosts = [
  {
    id: '1',
    author: 'Alex Morgan',
    avatar: null,
    time: '2 hours ago',
    content: 'Just hit 100k streams on my latest single! Thank you all for the incredible support 🎉',
    likes: 234,
    comments: 45,
    type: 'milestone',
  },
  {
    id: '2',
    author: 'Studio Sessions',
    avatar: null,
    time: '5 hours ago',
    content: 'Pro tip: Side-chain compression on your bass to the kick drum can really make your mix punch through. What mixing tips do you swear by?',
    likes: 167,
    comments: 89,
    type: 'tip',
  },
  {
    id: '3',
    author: 'Rising Stars Playlist',
    avatar: null,
    time: '1 day ago',
    content: 'Featured artists this week: @LunaRodriguez @JasmineChen @TheMidnightCollective. Check out their latest releases!',
    likes: 412,
    comments: 23,
    type: 'feature',
  },
]

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [followingArtists, setFollowingArtists] = useState<string[]>(['1'])

  const toggleFollow = (artistId: string) => {
    if (followingArtists.includes(artistId)) {
      setFollowingArtists(followingArtists.filter(id => id !== artistId))
    } else {
      setFollowingArtists([...followingArtists, artistId])
    }
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community</h1>
          <p className="text-muted-foreground">
            Connect with artists, collaborate, and grow together
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90 text-white">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Artists
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Artists</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,450</div>
            <p className="text-xs text-muted-foreground">
              +523 new this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collaborations</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              28 active opportunities
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Stories</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              Successful collaborations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2K</div>
            <p className="text-xs text-muted-foreground">
              156 today
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search artists, genres, or collaborations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
          <TabsTrigger value="feed">Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Featured Artists</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {featuredArtists.map((artist) => (
                <Card key={artist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-32 bg-gradient-to-br from-purple-500 to-blue-500" />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <div className="h-full w-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold">
                            {artist.name.charAt(0)}
                          </div>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1">
                            <h3 className="font-semibold">{artist.name}</h3>
                            {artist.verified && (
                              <Verified className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{artist.genre}</p>
                        </div>
                      </div>
                      <Button
                        variant={followingArtists.includes(artist.id) ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => toggleFollow(artist.id)}
                      >
                        {followingArtists.includes(artist.id) ? 'Following' : 'Follow'}
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {artist.bio}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {artist.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {artist.followers.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Music className="h-3 w-3" />
                        {artist.tracks}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">Latest track</p>
                        <p className="text-sm font-medium">{artist.recentTrack}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Plays</p>
                        <p className="text-sm font-medium">{artist.plays.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Play className="mr-1 h-3 w-3" />
                        Listen
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageSquare className="mr-1 h-3 w-3" />
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Rising Artists</h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-muted-foreground">
                            {i}
                          </span>
                          <Avatar className="h-10 w-10">
                            <div className="h-full w-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-semibold">
                              A
                            </div>
                          </Avatar>
                          <div>
                            <p className="font-medium">Artist Name {i}</p>
                            <p className="text-sm text-muted-foreground">Genre • Location</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-green-600 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            +{25 - i * 3}%
                          </div>
                          <Button variant="outline" size="sm">
                            Follow
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="following" className="space-y-4">
          {followingArtists.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No artists followed yet"
              description="Discover and follow artists to see their updates here."
              action={
                <Button onClick={() => setActiveTab('discover')}>
                  Discover Artists
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {featuredArtists
                .filter(artist => followingArtists.includes(artist.id))
                .map((artist) => (
                  <Card key={artist.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-16 w-16">
                          <div className="h-full w-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold text-xl">
                            {artist.name.charAt(0)}
                          </div>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{artist.name}</h3>
                            {artist.verified && (
                              <Verified className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{artist.genre}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{artist.followers.toLocaleString()} followers</span>
                            <span>{artist.tracks} tracks</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Share</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Unfollow
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Latest Activity</p>
                          <p className="text-sm text-muted-foreground">
                            Released "{artist.recentTrack}" • 2 days ago
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Play className="mr-1 h-3 w-3" />
                            Play Latest
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <MessageSquare className="mr-1 h-3 w-3" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="collaborations" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Open Collaborations</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Post Opportunity
            </Button>
          </div>

          <div className="grid gap-4">
            {collaborations.map((collab) => (
              <Card key={collab.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{collab.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>by {collab.artist}</span>
                        <Badge variant="secondary">{collab.genre}</Badge>
                        <Badge variant="outline">{collab.type}</Badge>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      {collab.responses} responses
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-medium">{collab.budget}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deadline</p>
                      <p className="font-medium">{collab.deadline}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Posted</p>
                      <p className="font-medium">3 days ago</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      View Details
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="feed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Feed</CardTitle>
              <CardDescription>
                Latest updates from the Not a Label community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {communityPosts.map((post) => (
                    <div key={post.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <div className="h-full w-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold">
                              {post.author.charAt(0)}
                            </div>
                          </Avatar>
                          <div>
                            <p className="font-medium">{post.author}</p>
                            <p className="text-sm text-muted-foreground">{post.time}</p>
                          </div>
                        </div>
                        {post.type === 'milestone' && (
                          <Badge className="bg-yellow-100 text-yellow-700">
                            Milestone
                          </Badge>
                        )}
                        {post.type === 'tip' && (
                          <Badge className="bg-blue-100 text-blue-700">
                            Pro Tip
                          </Badge>
                        )}
                        {post.type === 'feature' && (
                          <Badge className="bg-purple-100 text-purple-700">
                            Featured
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm">{post.content}</p>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          {post.comments}
                        </button>
                        <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}