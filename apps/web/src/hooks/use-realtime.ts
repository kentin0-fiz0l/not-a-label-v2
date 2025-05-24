'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

interface RealtimeEvent {
  type: 'notification' | 'update' | 'message'
  data: any
  timestamp: Date
}

interface UseRealtimeOptions {
  onNotification?: (notification: any) => void
  onUpdate?: (update: any) => void
  onMessage?: (message: any) => void
  reconnectInterval?: number
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null)
  const [connectionAttempts, setConnectionAttempts] = useState(0)

  const {
    onNotification,
    onUpdate,
    onMessage,
    reconnectInterval = 5000
  } = options

  // Simulate WebSocket connection
  const connect = useCallback(() => {
    console.log('Connecting to realtime service...')
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true)
      setConnectionAttempts(0)
      console.log('Connected to realtime service')
    }, 1000)
  }, [])

  const disconnect = useCallback(() => {
    setIsConnected(false)
    console.log('Disconnected from realtime service')
  }, [])

  // Handle reconnection
  useEffect(() => {
    if (!isConnected && connectionAttempts < 5) {
      const timeout = setTimeout(() => {
        setConnectionAttempts(prev => prev + 1)
        connect()
      }, reconnectInterval * (connectionAttempts + 1))

      return () => clearTimeout(timeout)
    }
  }, [isConnected, connectionAttempts, connect, reconnectInterval])

  // Initial connection
  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  // Simulate receiving events
  useEffect(() => {
    if (!isConnected) return

    const eventInterval = setInterval(() => {
      const random = Math.random()
      
      // 10% chance of receiving an event
      if (random > 0.9) {
        const eventType = random > 0.97 ? 'notification' : random > 0.94 ? 'message' : 'update'
        
        const event: RealtimeEvent = {
          type: eventType,
          data: generateMockEvent(eventType),
          timestamp: new Date()
        }

        setLastEvent(event)

        // Call appropriate handler
        switch (eventType) {
          case 'notification':
            onNotification?.(event.data)
            break
          case 'update':
            onUpdate?.(event.data)
            break
          case 'message':
            onMessage?.(event.data)
            break
        }
      }
    }, 3000) // Check every 3 seconds

    return () => clearInterval(eventInterval)
  }, [isConnected, onNotification, onUpdate, onMessage])

  return {
    isConnected,
    lastEvent,
    connectionAttempts,
    reconnect: connect,
    disconnect
  }
}

// Generate mock events for demonstration
function generateMockEvent(type: string) {
  switch (type) {
    case 'notification':
      const notifications = [
        {
          id: Date.now().toString(),
          title: 'New Follower!',
          message: 'Sarah Johnson just followed you',
          type: 'social'
        },
        {
          id: Date.now().toString(),
          title: 'Track Milestone',
          message: 'Your track reached 10K streams!',
          type: 'milestone'
        },
        {
          id: Date.now().toString(),
          title: 'Collaboration Request',
          message: 'Alex wants to collaborate with you',
          type: 'collaboration'
        }
      ]
      return notifications[Math.floor(Math.random() * notifications.length)]

    case 'update':
      const updates = [
        { type: 'streams', trackId: '1', count: Math.floor(Math.random() * 100) },
        { type: 'followers', count: Math.floor(Math.random() * 10) },
        { type: 'revenue', amount: (Math.random() * 10).toFixed(2) }
      ]
      return updates[Math.floor(Math.random() * updates.length)]

    case 'message':
      return {
        id: Date.now().toString(),
        from: 'System',
        text: 'Your track is now live on all platforms!',
        timestamp: new Date()
      }

    default:
      return null
  }
}

// Hook for real-time notifications
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])

  const handleNotification = useCallback((notification: any) => {
    setNotifications(prev => [notification, ...prev])
    
    // Show toast notification
    toast.success(notification.message, {
      duration: 4000,
      position: 'top-right',
    })
  }, [])

  const { isConnected, lastEvent } = useRealtime({
    onNotification: handleNotification
  })

  return {
    notifications,
    isConnected,
    lastEvent,
    clearNotifications: () => setNotifications([])
  }
}

// Hook for real-time analytics updates
export function useRealtimeAnalytics(trackId?: string) {
  const [analytics, setAnalytics] = useState({
    streams: 0,
    revenue: 0,
    followers: 0
  })

  const handleUpdate = useCallback((update: any) => {
    if (update.type === 'streams' && (!trackId || update.trackId === trackId)) {
      setAnalytics(prev => ({
        ...prev,
        streams: prev.streams + update.count
      }))
    } else if (update.type === 'revenue') {
      setAnalytics(prev => ({
        ...prev,
        revenue: prev.revenue + parseFloat(update.amount)
      }))
    } else if (update.type === 'followers') {
      setAnalytics(prev => ({
        ...prev,
        followers: prev.followers + update.count
      }))
    }
  }, [trackId])

  const { isConnected } = useRealtime({
    onUpdate: handleUpdate
  })

  return {
    analytics,
    isConnected,
    resetAnalytics: () => setAnalytics({ streams: 0, revenue: 0, followers: 0 })
  }
}