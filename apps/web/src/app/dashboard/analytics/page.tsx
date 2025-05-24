'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import { format, subDays } from 'date-fns'
import {
  TrendingUp, TrendingDown, Users, Music, DollarSign,
  Download, Calendar, Globe, Headphones, Heart
} from 'lucide-react'

const streamingData = [
  { date: '2024-01-01', streams: 1250, revenue: 4.5 },
  { date: '2024-01-02', streams: 1380, revenue: 4.9 },
  { date: '2024-01-03', streams: 1200, revenue: 4.3 },
  { date: '2024-01-04', streams: 1450, revenue: 5.2 },
  { date: '2024-01-05', streams: 1520, revenue: 5.5 },
  { date: '2024-01-06', streams: 1300, revenue: 4.7 },
  { date: '2024-01-07', streams: 1420, revenue: 5.1 },
]

const platformData = [
  { name: 'Spotify', value: 45, color: '#1DB954' },
  { name: 'Apple Music', value: 25, color: '#FC3C44' },
  { name: 'YouTube Music', value: 20, color: '#FF0000' },
  { name: 'SoundCloud', value: 10, color: '#FF7700' },
]

const demographicsData = [
  { age: '18-24', male: 45, female: 55 },
  { age: '25-34', male: 52, female: 48 },
  { age: '35-44', male: 48, female: 52 },
  { age: '45-54', male: 40, female: 60 },
  { age: '55+', male: 35, female: 65 },
]

const topTracks = [
  { name: 'Midnight Dreams', streams: 45320, trend: 12.5 },
  { name: 'Electric Nights', streams: 38940, trend: -3.2 },
  { name: 'Summer Vibes', streams: 32100, trend: 8.7 },
  { name: 'City Lights', streams: 28500, trend: 15.3 },
  { name: 'Ocean Waves', streams: 24300, trend: -1.8 },
]

const geographicData = [
  { country: 'United States', listeners: 35420 },
  { country: 'United Kingdom', listeners: 28300 },
  { country: 'Germany', listeners: 22100 },
  { country: 'France', listeners: 18700 },
  { country: 'Japan', listeners: 15200 },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [activeTab, setActiveTab] = useState('overview')

  const stats = [
    {
      title: 'Total Streams',
      value: '234.5K',
      change: '+12.3%',
      trend: 'up',
      icon: Headphones,
    },
    {
      title: 'Monthly Listeners',
      value: '45.2K',
      change: '+8.1%',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Revenue',
      value: '$842.50',
      change: '+15.2%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      title: 'Followers',
      value: '12.8K',
      change: '-2.4%',
      trend: 'down',
      icon: Heart,
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your music performance and audience insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {stat.trend === 'up' ? <TrendingUp className="inline h-3 w-3" /> : <TrendingDown className="inline h-3 w-3" />}
                    {stat.change}
                  </span>
                  {' '}from last period
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="tracks">Tracks</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Streaming Performance</CardTitle>
              <CardDescription>
                Daily streams and revenue over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={streamingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value as string), 'MMM d, yyyy')}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="streams"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                    name="Streams"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.6}
                    name="Revenue ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription>
                  Where your music is being streamed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Tracks</CardTitle>
                <CardDescription>
                  Your best performing tracks this period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topTracks.map((track, index) => (
                    <div key={track.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-muted-foreground">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{track.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {track.streams.toLocaleString()} streams
                          </p>
                        </div>
                      </div>
                      <div className={`text-sm ${track.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {track.trend > 0 ? '+' : ''}{track.trend}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
                <CardDescription>
                  Age and gender distribution of your listeners
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={demographicsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="male" fill="#3b82f6" name="Male" />
                    <Bar dataKey="female" fill="#ec4899" name="Female" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>
                  Top countries by listener count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {geographicData.map((country) => (
                    <div key={country.country}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{country.country}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {country.listeners.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={(country.listeners / geographicData[0].listeners) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Listener Behavior</CardTitle>
              <CardDescription>
                How your audience engages with your music
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Avg. Listening Time</p>
                  <p className="text-2xl font-bold">3:24</p>
                  <p className="text-xs text-green-600">+12% from last period</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Skip Rate</p>
                  <p className="text-2xl font-bold">22%</p>
                  <p className="text-xs text-green-600">-5% from last period</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">78%</p>
                  <p className="text-xs text-green-600">+8% from last period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Track Performance</CardTitle>
              <CardDescription>
                Detailed analytics for all your tracks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm">
                    <Music className="mr-2 h-4 w-4" />
                    Filter by Album
                  </Button>
                  <Select defaultValue="streams">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="streams">Sort by Streams</SelectItem>
                      <SelectItem value="revenue">Sort by Revenue</SelectItem>
                      <SelectItem value="growth">Sort by Growth</SelectItem>
                      <SelectItem value="saves">Sort by Saves</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="border rounded-lg">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4">Track</th>
                        <th className="text-right p-4">Streams</th>
                        <th className="text-right p-4">Revenue</th>
                        <th className="text-right p-4">Saves</th>
                        <th className="text-right p-4">Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topTracks.map((track, index) => (
                        <tr key={track.name} className="border-b">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-muted-foreground">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{track.name}</p>
                                <p className="text-sm text-muted-foreground">Single</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-right p-4">
                            {track.streams.toLocaleString()}
                          </td>
                          <td className="text-right p-4">
                            ${(track.streams * 0.003).toFixed(2)}
                          </td>
                          <td className="text-right p-4">
                            {Math.floor(track.streams * 0.15).toLocaleString()}
                          </td>
                          <td className="text-right p-4">
                            <span className={track.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                              {track.trend > 0 ? '+' : ''}{track.trend}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>
                Your earnings across different platforms and sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={streamingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value as string), 'MMM d, yyyy')}
                    formatter={(value) => `$${value}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#82ca9d" 
                    name="Daily Revenue"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Source</CardTitle>
                <CardDescription>
                  Breakdown of your income streams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Streaming</span>
                      <span className="text-sm text-muted-foreground">$654.20 (77.6%)</span>
                    </div>
                    <Progress value={77.6} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Downloads</span>
                      <span className="text-sm text-muted-foreground">$142.30 (16.9%)</span>
                    </div>
                    <Progress value={16.9} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Sync Licensing</span>
                      <span className="text-sm text-muted-foreground">$46.00 (5.5%)</span>
                    </div>
                    <Progress value={5.5} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Schedule</CardTitle>
                <CardDescription>
                  Upcoming and recent payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Spotify</p>
                      <p className="text-sm text-muted-foreground">Next payment: Feb 15</p>
                    </div>
                    <p className="font-medium">$324.50</p>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Apple Music</p>
                      <p className="text-sm text-muted-foreground">Next payment: Feb 28</p>
                    </div>
                    <p className="font-medium">$186.20</p>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">YouTube Music</p>
                      <p className="text-sm text-muted-foreground">Paid: Jan 31</p>
                    </div>
                    <p className="font-medium text-green-600">$143.50</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}