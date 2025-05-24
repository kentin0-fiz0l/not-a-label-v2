'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Ticket,
  Music,
  Plus,
  Edit,
  Trash2,
  Share2,
  TrendingUp,
  Globe,
  Star,
  MoreVertical
} from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'

const mockEvents = [
  {
    id: '1',
    title: 'Summer Music Festival',
    type: 'festival',
    date: new Date('2024-07-15'),
    time: '6:00 PM',
    venue: 'Central Park Amphitheater',
    location: 'New York, NY',
    status: 'upcoming',
    ticketsSold: 450,
    capacity: 500,
    price: 35,
    description: 'Annual summer festival featuring indie artists',
  },
  {
    id: '2',
    title: 'Acoustic Night at The Blue Note',
    type: 'club',
    date: new Date('2024-03-20'),
    time: '9:00 PM',
    venue: 'The Blue Note',
    location: 'Los Angeles, CA',
    status: 'upcoming',
    ticketsSold: 120,
    capacity: 200,
    price: 25,
    description: 'Intimate acoustic performance',
  },
  {
    id: '3',
    title: 'Virtual Concert Series',
    type: 'virtual',
    date: new Date('2024-03-10'),
    time: '8:00 PM EST',
    venue: 'Online',
    location: 'Worldwide',
    status: 'upcoming',
    ticketsSold: 890,
    capacity: null,
    price: 15,
    description: 'Live-streamed performance with Q&A',
  },
]

const eventTypes = [
  { value: 'concert', label: 'Concert', icon: Music },
  { value: 'festival', label: 'Festival', icon: Globe },
  { value: 'club', label: 'Club Show', icon: MapPin },
  { value: 'virtual', label: 'Virtual Event', icon: Globe },
  { value: 'private', label: 'Private Event', icon: Users },
]

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const upcomingEvents = mockEvents.filter(e => e.status === 'upcoming')
  const pastEvents = mockEvents.filter(e => e.status === 'past')

  const filteredEvents = (activeTab === 'upcoming' ? upcomingEvents : pastEvents).filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = [
    {
      title: 'Upcoming Events',
      value: upcomingEvents.length,
      icon: CalendarIcon,
      description: 'Next event in 5 days',
    },
    {
      title: 'Total Tickets Sold',
      value: '1,460',
      icon: Ticket,
      description: '+234 this month',
    },
    {
      title: 'Revenue',
      value: '$42,350',
      icon: DollarSign,
      description: '+18% vs last month',
    },
    {
      title: 'Avg. Attendance',
      value: '85%',
      icon: Users,
      description: 'Of venue capacity',
    },
  ]

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Manage your live performances and virtual events
          </p>
        </div>
        <Button 
          className="bg-gradient-primary hover:opacity-90 text-white"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Events</CardTitle>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-[200px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upcoming">
                    Upcoming ({upcomingEvents.length})
                  </TabsTrigger>
                  <TabsTrigger value="past">
                    Past ({pastEvents.length})
                  </TabsTrigger>
                  <TabsTrigger value="drafts">Drafts (0)</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                  {filteredEvents.length === 0 ? (
                    <EmptyState
                      icon={CalendarIcon}
                      title={`No ${activeTab} events`}
                      description={
                        activeTab === 'upcoming'
                          ? "Create your first event to start selling tickets."
                          : "You haven't performed any events yet."
                      }
                      action={
                        activeTab === 'upcoming' && (
                          <Button onClick={() => setShowCreateDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Event
                          </Button>
                        )
                      }
                    />
                  ) : (
                    <div className="space-y-4">
                      {filteredEvents.map((event) => {
                        const soldOutPercentage = event.capacity
                          ? (event.ticketsSold / event.capacity) * 100
                          : 0

                        return (
                          <div
                            key={event.id}
                            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">{event.title}</h3>
                                  <Badge variant="secondary">
                                    {eventTypes.find(t => t.value === event.type)?.label}
                                  </Badge>
                                  {soldOutPercentage >= 90 && (
                                    <Badge className="bg-red-100 text-red-700">
                                      Almost Sold Out
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {event.description}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Event
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Cancel Event
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <CalendarIcon className="h-4 w-4" />
                                {format(event.date, 'MMM d, yyyy')}
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {event.time}
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {event.location}
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <DollarSign className="h-4 w-4" />
                                ${event.price}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Tickets Sold</span>
                                <span className="font-medium">
                                  {event.ticketsSold}
                                  {event.capacity && ` / ${event.capacity}`}
                                </span>
                              </div>
                              {event.capacity && (
                                <Progress value={soldOutPercentage} className="h-2" />
                              )}
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Button variant="outline" size="sm" className="flex-1">
                                View Details
                              </Button>
                              <Button size="sm" className="flex-1">
                                Manage Tickets
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Calendar</CardTitle>
              <CardDescription>
                View and manage your performance schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>
                This month's performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Ticket Sales</span>
                </div>
                <span className="text-sm font-medium">+18% vs last month</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Avg. Rating</span>
                </div>
                <span className="text-sm font-medium">4.8/5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Total Attendees</span>
                </div>
                <span className="text-sm font-medium">1,234</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Set up a new performance or virtual event
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input id="event-title" placeholder="Summer Music Festival" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="event-type">Event Type</Label>
                <Select>
                  <SelectTrigger id="event-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ticket-price">Ticket Price</Label>
                <Input id="ticket-price" type="number" placeholder="25" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="event-date">Date</Label>
                <Input id="event-date" type="date" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-time">Time</Label>
                <Input id="event-time" type="time" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" placeholder="Central Park Amphitheater" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="New York, NY" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your event..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-primary hover:opacity-90 text-white"
              onClick={() => {
                setShowCreateDialog(false)
                // Handle event creation
              }}
            >
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}