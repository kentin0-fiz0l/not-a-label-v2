'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useRealtimeAnalytics } from '@/hooks/use-realtime'
import { TrendingUp, Users, DollarSign, Music, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function RealtimeStats() {
  const { analytics, isConnected } = useRealtimeAnalytics()
  const [previousValues, setPreviousValues] = useState(analytics)
  const [changes, setChanges] = useState({
    streams: 0,
    revenue: 0,
    followers: 0
  })

  useEffect(() => {
    // Calculate changes
    const newChanges = {
      streams: analytics.streams - previousValues.streams,
      revenue: analytics.revenue - previousValues.revenue,
      followers: analytics.followers - previousValues.followers
    }
    
    setChanges(newChanges)
    setPreviousValues(analytics)
  }, [analytics])

  const stats = [
    {
      title: 'Live Streams',
      value: analytics.streams,
      change: changes.streams,
      icon: Music,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'New Followers',
      value: analytics.followers,
      change: changes.followers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Revenue Today',
      value: `$${analytics.revenue.toFixed(2)}`,
      change: changes.revenue,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Real-time Activity</CardTitle>
            <CardDescription>Live updates from your music</CardDescription>
          </div>
          <Badge 
            variant={isConnected ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            <Zap className="h-3 w-3" />
            {isConnected ? 'Live' : 'Connecting...'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            const hasChange = stat.change > 0

            return (
              <div key={stat.title} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </p>
                  </div>
                </div>
                <AnimatePresence>
                  {hasChange && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="text-sm font-medium text-green-600 flex items-center"
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +{typeof stat.change === 'number' ? stat.change : stat.change.toFixed(2)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Activity Level</span>
            <span className="font-medium">High</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<any[]>([])
  const { lastEvent, isConnected } = useRealtimeAnalytics()

  useEffect(() => {
    if (lastEvent) {
      const newActivity = {
        id: Date.now().toString(),
        type: lastEvent.type,
        message: generateActivityMessage(lastEvent),
        timestamp: new Date(),
      }
      
      setActivities(prev => [newActivity, ...prev].slice(0, 5))
    }
  }, [lastEvent])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Live Activity</CardTitle>
          <Badge 
            variant={isConnected ? "default" : "secondary"}
            className="animate-pulse"
          >
            {isConnected ? '● Live' : '○ Offline'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence>
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <div className="h-2 w-2 bg-green-500 rounded-full mt-1.5 animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {activities.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Waiting for activity...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function generateActivityMessage(event: any): string {
  const messages = [
    'New stream from United States',
    'Someone added your track to a playlist',
    'New follower from Germany',
    'Your track was shared on social media',
    'Stream milestone reached',
    'New comment on your track',
    'Your music is trending in Brazil',
    'Playlist submission approved',
  ]
  
  return messages[Math.floor(Math.random() * messages.length)]
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 120) return '1 minute ago'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 7200) return '1 hour ago'
  return `${Math.floor(seconds / 3600)} hours ago`
}