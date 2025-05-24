"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Music, 
  Upload, 
  Play, 
  Pause, 
  MoreVertical, 
  Download, 
  Share2, 
  Eye, 
  Heart,
  TrendingUp,
  Filter,
  Search,
  Grid,
  List
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

// Mock data (in real app, this would come from API)
const mockTracks = [
  {
    id: "1",
    title: "Midnight Dreams",
    artist: "Your Artist Name",
    album: "Night Sessions",
    duration: "3:45",
    plays: 12450,
    likes: 342,
    status: "published",
    releaseDate: "2024-01-15",
    coverUrl: null,
    platforms: ["spotify", "apple", "youtube"]
  },
  {
    id: "2",
    title: "Electric Sunset",
    artist: "Your Artist Name",
    album: "Summer Vibes",
    duration: "4:12",
    plays: 8920,
    likes: 256,
    status: "published",
    releaseDate: "2024-02-20",
    coverUrl: null,
    platforms: ["spotify", "soundcloud"]
  },
  {
    id: "3",
    title: "Urban Rhythm",
    artist: "Your Artist Name",
    album: "City Lights",
    duration: "3:28",
    plays: 5670,
    likes: 189,
    status: "processing",
    releaseDate: "2024-03-10",
    coverUrl: null,
    platforms: ["spotify", "apple", "youtube", "tidal"]
  }
]

const isNewUser = false // Set to true to see empty state

export default function MusicDashboardPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [playingTrack, setPlayingTrack] = useState<string | null>(null)

  const filteredTracks = mockTracks.filter(track => {
    if (activeTab === "published" && track.status !== "published") return false
    if (activeTab === "processing" && track.status !== "processing") return false
    if (activeTab === "drafts" && track.status !== "draft") return false
    
    if (searchQuery) {
      return track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             track.album.toLowerCase().includes(searchQuery.toLowerCase())
    }
    
    return true
  })

  const togglePlay = (trackId: string) => {
    setPlayingTrack(playingTrack === trackId ? null : trackId)
  }

  const EmptyState = () => (
    <Card className="text-center py-12">
      <CardContent>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Music className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No tracks yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          Upload your first track to start building your music catalog and reaching listeners worldwide.
        </p>
        <Button asChild className="bg-gradient-primary hover:opacity-90 text-white">
          <Link href="/dashboard/music/upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload Your First Track
          </Link>
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Music</h1>
            <p className="text-muted-foreground mt-2">
              Manage your tracks, albums, and releases
            </p>
          </div>
          <Button asChild className="bg-gradient-primary hover:opacity-90 text-white">
            <Link href="/dashboard/music/upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload Track
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {!isNewUser && (
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Tracks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockTracks.length}</div>
              <p className="text-xs text-muted-foreground">
                {mockTracks.filter(t => t.status === "published").length} published
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Plays</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockTracks.reduce((sum, track) => sum + track.plays, 0).toLocaleString()}
              </div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Likes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockTracks.reduce((sum, track) => sum + track.likes, 0).toLocaleString()}
              </div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2% this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg. Play Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <Progress value={78} className="h-1 mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {isNewUser ? (
        <EmptyState />
      ) : (
        <>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tracks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="rounded-l-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Tracks</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredTracks.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <p className="text-muted-foreground">No tracks found</p>
                  </CardContent>
                </Card>
              ) : viewMode === "list" ? (
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {filteredTracks.map((track) => (
                        <div key={track.id} className="p-4 hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-4">
                            {/* Play Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => togglePlay(track.id)}
                              className="shrink-0"
                            >
                              {playingTrack === track.id ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>

                            {/* Track Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium truncate">{track.title}</h3>
                                <Badge 
                                  variant={track.status === "published" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {track.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {track.album} • {track.duration}
                              </p>
                            </div>

                            {/* Stats */}
                            <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Play className="h-3 w-3" />
                                {track.plays.toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {track.likes}
                              </div>
                            </div>

                            {/* Platforms */}
                            <div className="hidden md:flex items-center gap-1">
                              {track.platforms.includes("spotify") && (
                                <Badge variant="outline" className="text-xs">Spotify</Badge>
                              )}
                              {track.platforms.includes("apple") && (
                                <Badge variant="outline" className="text-xs">Apple</Badge>
                              )}
                              {track.platforms.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{track.platforms.length - 2}
                                </Badge>
                              )}
                            </div>

                            {/* Actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Analytics
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTracks.map((track) => (
                    <Card key={track.id} className="overflow-hidden">
                      <div className="aspect-square bg-gradient-to-br from-purple-500 to-blue-500 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Music className="h-16 w-16 text-white/50" />
                        </div>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => togglePlay(track.id)}
                          className="absolute bottom-4 right-4"
                        >
                          {playingTrack === track.id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium truncate">{track.title}</h3>
                            <p className="text-sm text-muted-foreground">{track.album}</p>
                          </div>
                          <Badge 
                            variant={track.status === "published" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {track.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              {track.plays.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {track.likes}
                            </span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Analytics</DropdownMenuItem>
                              <DropdownMenuItem>Share</DropdownMenuItem>
                              <DropdownMenuItem>Download</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}