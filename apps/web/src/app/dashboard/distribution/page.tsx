'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Globe, Music, CheckCircle2, Clock, AlertCircle,
  ArrowRight, Zap, Shield, DollarSign, Users,
  Calendar, TrendingUp, Settings, Plus, Info
} from 'lucide-react'
import { EmptyState } from '@/components/empty-state'

const platforms = [
  {
    id: 'spotify',
    name: 'Spotify',
    logo: '🎵',
    color: '#1DB954',
    reach: '500M+ users',
    payout: '$0.003-0.005 per stream',
    status: 'connected',
    features: ['Playlist pitching', 'Artist profile', 'Analytics', 'Pre-save campaigns'],
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    logo: '🍎',
    color: '#FC3C44',
    reach: '100M+ users',
    payout: '$0.01 per stream',
    status: 'connected',
    features: ['Artist profile', 'Analytics', 'Pre-add campaigns', 'Radio submission'],
  },
  {
    id: 'youtube-music',
    name: 'YouTube Music',
    logo: '▶️',
    color: '#FF0000',
    reach: '80M+ users',
    payout: '$0.002 per stream',
    status: 'pending',
    features: ['Video integration', 'Community tab', 'Analytics', 'Shorts integration'],
  },
  {
    id: 'tidal',
    name: 'TIDAL',
    logo: '🌊',
    color: '#000000',
    reach: '3M+ users',
    payout: '$0.01284 per stream',
    status: 'not_connected',
    features: ['HiFi streaming', 'Artist credits', 'Direct artist payouts', 'Live sessions'],
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    logo: '☁️',
    color: '#FF7700',
    reach: '175M+ users',
    payout: '$0.003-0.0084 per stream',
    status: 'connected',
    features: ['Direct uploads', 'Comments', 'Reposts', 'Fan messages'],
  },
  {
    id: 'deezer',
    name: 'Deezer',
    logo: '🎧',
    color: '#FF0092',
    reach: '16M+ users',
    payout: '$0.0064 per stream',
    status: 'not_connected',
    features: ['Flow AI', 'Podcasts', 'Lyrics', 'Live radio'],
  },
]

const distributions = [
  {
    id: '1',
    trackTitle: 'Midnight Dreams',
    releaseDate: '2024-02-15',
    status: 'live',
    platforms: 5,
    totalStreams: 45320,
    revenue: 136.50,
  },
  {
    id: '2',
    trackTitle: 'Electric Nights',
    releaseDate: '2024-02-01',
    status: 'processing',
    platforms: 3,
    totalStreams: 0,
    revenue: 0,
  },
  {
    id: '3',
    trackTitle: 'Summer Vibes',
    releaseDate: '2024-03-01',
    status: 'scheduled',
    platforms: 6,
    totalStreams: 0,
    revenue: 0,
  },
]

export default function DistributionPage() {
  const [activeTab, setActiveTab] = useState('platforms')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['spotify', 'apple-music', 'soundcloud'])
  const [showDistributeDialog, setShowDistributeDialog] = useState(false)

  const connectedPlatforms = platforms.filter(p => p.status === 'connected').length
  const totalReach = platforms
    .filter(p => p.status === 'connected')
    .reduce((sum, p) => {
      const reach = parseInt(p.reach.match(/\d+/)?.[0] || '0')
      return sum + reach
    }, 0)

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Distribution</h1>
          <p className="text-muted-foreground">
            Distribute your music to all major streaming platforms
          </p>
        </div>
        <Button 
          className="bg-gradient-primary hover:opacity-90 text-white"
          onClick={() => setShowDistributeDialog(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Distribution
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Platforms</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedPlatforms}/{platforms.length}</div>
            <Progress value={(connectedPlatforms / platforms.length) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReach}M+</div>
            <p className="text-xs text-muted-foreground">potential listeners</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Releases</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{distributions.filter(d => d.status === 'live').length}</div>
            <p className="text-xs text-muted-foreground">
              {distributions.filter(d => d.status === 'processing').length} processing
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$842.50</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="releases">Releases</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {platforms.map((platform) => (
              <Card key={platform.id} className="relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: platform.color }}
                />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{platform.logo}</div>
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        <CardDescription>{platform.reach}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={
                      platform.status === 'connected' ? 'default' :
                      platform.status === 'pending' ? 'secondary' : 'outline'
                    }>
                      {platform.status === 'connected' ? 'Connected' :
                       platform.status === 'pending' ? 'Pending' : 'Not Connected'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Payout:</span> {platform.payout}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {platform.features.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {platform.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{platform.features.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {platform.status === 'connected' ? (
                      <Button variant="outline" className="w-full" size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Manage
                      </Button>
                    ) : platform.status === 'pending' ? (
                      <Button variant="secondary" className="w-full" size="sm" disabled>
                        <Clock className="mr-2 h-4 w-4" />
                        Verification Pending
                      </Button>
                    ) : (
                      <Button className="w-full" size="sm">
                        Connect Platform
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="releases" className="space-y-4">
          {distributions.length === 0 ? (
            <EmptyState
              icon={Globe}
              title="No distributions yet"
              description="Start distributing your music to reach millions of listeners worldwide."
              action={
                <Button onClick={() => setShowDistributeDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Distribution
                </Button>
              }
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4">Track</th>
                        <th className="text-left p-4">Release Date</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-right p-4">Platforms</th>
                        <th className="text-right p-4">Streams</th>
                        <th className="text-right p-4">Revenue</th>
                        <th className="text-right p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {distributions.map((distribution) => (
                        <tr key={distribution.id} className="border-b">
                          <td className="p-4">
                            <p className="font-medium">{distribution.trackTitle}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(distribution.releaseDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant={
                              distribution.status === 'live' ? 'default' :
                              distribution.status === 'processing' ? 'secondary' : 'outline'
                            }>
                              {distribution.status === 'live' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                              {distribution.status === 'processing' && <Clock className="mr-1 h-3 w-3" />}
                              {distribution.status === 'scheduled' && <Calendar className="mr-1 h-3 w-3" />}
                              {distribution.status}
                            </Badge>
                          </td>
                          <td className="text-right p-4">
                            {distribution.platforms}
                          </td>
                          <td className="text-right p-4">
                            {distribution.totalStreams.toLocaleString()}
                          </td>
                          <td className="text-right p-4">
                            ${distribution.revenue.toFixed(2)}
                          </td>
                          <td className="text-right p-4">
                            <Button variant="ghost" size="sm">
                              Manage
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribution Preferences</CardTitle>
              <CardDescription>
                Configure your default distribution settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Default Release Time</Label>
                <Select defaultValue="midnight">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="midnight">12:00 AM (Midnight)</SelectItem>
                    <SelectItem value="noon">12:00 PM (Noon)</SelectItem>
                    <SelectItem value="custom">Custom Time</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Time zone: Eastern Time (ET)
                </p>
              </div>

              <div className="space-y-3">
                <Label>Automatic Features</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Auto-generate ISRCs</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically generate unique identifiers for your tracks
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Content ID Protection</p>
                      <p className="text-sm text-muted-foreground">
                        Protect your music from unauthorized use on YouTube
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Pre-save Campaigns</p>
                      <p className="text-sm text-muted-foreground">
                        Enable pre-save links for upcoming releases
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Artist Name Variations</Label>
                <Input placeholder="Add alternative artist names..." />
                <p className="text-sm text-muted-foreground">
                  Add any variations of your artist name to ensure proper crediting
                </p>
              </div>

              <Button>Save Preferences</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribution Analytics</CardTitle>
              <CardDescription>
                Track your distribution performance across platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Pro Analytics</p>
                    <p className="text-sm text-muted-foreground">
                      Get detailed insights and performance metrics
                    </p>
                  </div>
                </div>
                <Button variant="outline">Upgrade</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDistributeDialog} onOpenChange={setShowDistributeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Distribution</DialogTitle>
            <DialogDescription>
              Select a track and choose platforms for distribution
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Track</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a track to distribute" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="midnight-dreams">Midnight Dreams</SelectItem>
                  <SelectItem value="electric-nights">Electric Nights</SelectItem>
                  <SelectItem value="summer-vibes">Summer Vibes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Release Date</Label>
              <Input type="date" />
              <p className="text-sm text-muted-foreground">
                Releases go live at midnight in your selected timezone
              </p>
            </div>

            <div className="space-y-2">
              <Label>Select Platforms</Label>
              <div className="grid grid-cols-2 gap-3">
                {platforms.map((platform) => (
                  <div key={platform.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform.id}
                      checked={selectedPlatforms.includes(platform.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPlatforms([...selectedPlatforms, platform.id])
                        } else {
                          setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id))
                        }
                      }}
                      disabled={platform.status !== 'connected'}
                    />
                    <label
                      htmlFor={platform.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                    >
                      <span>{platform.logo}</span>
                      {platform.name}
                      {platform.status !== 'connected' && (
                        <Badge variant="outline" className="text-xs">
                          {platform.status === 'pending' ? 'Pending' : 'Not Connected'}
                        </Badge>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Distribution Summary</p>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• {selectedPlatforms.length} platforms selected</p>
                  <p>• Estimated processing time: 24-48 hours</p>
                  <p>• Your music will be available to {totalReach}M+ listeners</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDistributeDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-primary hover:opacity-90 text-white"
              onClick={() => {
                setShowDistributeDialog(false)
                // Handle distribution creation
              }}
            >
              Start Distribution
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}