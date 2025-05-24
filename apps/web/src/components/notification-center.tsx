'use client'

import { useState, useEffect } from 'react'
import { Bell, Music, Users, DollarSign, TrendingUp, MessageSquare, Heart, CheckCircle, X, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: 'milestone' | 'collaboration' | 'revenue' | 'system' | 'social'
  title: string
  message: string
  timestamp: Date
  read: boolean
  icon: React.ComponentType<{ className?: string }>
  actionUrl?: string
  actionLabel?: string
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'milestone',
    title: 'Milestone Reached!',
    message: 'Your track "Midnight Dreams" just hit 100K streams!',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    read: false,
    icon: TrendingUp,
    actionUrl: '/dashboard/analytics',
    actionLabel: 'View Analytics',
  },
  {
    id: '2',
    type: 'collaboration',
    title: 'New Collaboration Request',
    message: 'Luna Rodriguez wants to collaborate on a new track',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    icon: Users,
    actionUrl: '/dashboard/community',
    actionLabel: 'View Request',
  },
  {
    id: '3',
    type: 'revenue',
    title: 'Payment Received',
    message: 'You received $342.50 from Spotify',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    icon: DollarSign,
    actionUrl: '/dashboard/revenue',
    actionLabel: 'View Details',
  },
  {
    id: '4',
    type: 'social',
    title: 'New Follower Milestone',
    message: 'You reached 5,000 followers on Not a Label!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
    icon: Heart,
  },
  {
    id: '5',
    type: 'system',
    title: 'Distribution Complete',
    message: 'Your track "Electric Nights" is now live on all platforms',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    read: true,
    icon: CheckCircle,
    actionUrl: '/dashboard/distribution',
    actionLabel: 'View Distribution',
  },
]

export function NotificationCenter() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  
  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true
    if (activeTab === 'unread') return !n.read
    return n.type === activeTab
  })

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Random chance of new notification
      if (Math.random() > 0.95) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: 'social',
          title: 'New Comment',
          message: 'Someone commented on your track',
          timestamp: new Date(),
          read: false,
          icon: MessageSquare,
        }
        setNotifications(prev => [newNotification, ...prev])
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
              <Button variant="ghost" size="icon" asChild>
                <a href="/dashboard/settings/notifications">
                  <Settings className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
          <SheetDescription>
            Stay updated with your music career
          </SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="milestone">Milestones</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => {
                    const Icon = notification.icon
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          notification.read ? 'bg-background' : 'bg-muted/50'
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            notification.type === 'milestone' ? 'bg-green-100 text-green-600' :
                            notification.type === 'collaboration' ? 'bg-blue-100 text-blue-600' :
                            notification.type === 'revenue' ? 'bg-yellow-100 text-yellow-600' :
                            notification.type === 'social' ? 'bg-purple-100 text-purple-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between">
                              <p className="font-medium text-sm">{notification.title}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 -mt-1 -mr-2"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                              </p>
                              {notification.actionUrl && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-xs"
                                  asChild
                                >
                                  <a href={notification.actionUrl}>
                                    {notification.actionLabel || 'View'}
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    milestones: true,
    collaborations: true,
    revenue: true,
    social: true,
    system: true,
    email: false,
    push: true,
  })

  const updatePreference = (key: keyof typeof preferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Notification Types</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="milestones">Milestones</Label>
              <p className="text-sm text-muted-foreground">
                Stream counts, follower milestones, and achievements
              </p>
            </div>
            <Switch
              id="milestones"
              checked={preferences.milestones}
              onCheckedChange={(checked) => updatePreference('milestones', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="collaborations">Collaborations</Label>
              <p className="text-sm text-muted-foreground">
                Collaboration requests and updates
              </p>
            </div>
            <Switch
              id="collaborations"
              checked={preferences.collaborations}
              onCheckedChange={(checked) => updatePreference('collaborations', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="revenue">Revenue</Label>
              <p className="text-sm text-muted-foreground">
                Payment notifications and revenue updates
              </p>
            </div>
            <Switch
              id="revenue"
              checked={preferences.revenue}
              onCheckedChange={(checked) => updatePreference('revenue', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="social">Social</Label>
              <p className="text-sm text-muted-foreground">
                Likes, comments, and new followers
              </p>
            </div>
            <Switch
              id="social"
              checked={preferences.social}
              onCheckedChange={(checked) => updatePreference('social', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="system">System</Label>
              <p className="text-sm text-muted-foreground">
                Platform updates and announcements
              </p>
            </div>
            <Switch
              id="system"
              checked={preferences.system}
              onCheckedChange={(checked) => updatePreference('system', checked)}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Delivery Methods</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email"
              checked={preferences.email}
              onCheckedChange={(checked) => updatePreference('email', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Browser push notifications
              </p>
            </div>
            <Switch
              id="push"
              checked={preferences.push}
              onCheckedChange={(checked) => updatePreference('push', checked)}
            />
          </div>
        </div>
      </div>

      <Button>Save Preferences</Button>
    </div>
  )
}