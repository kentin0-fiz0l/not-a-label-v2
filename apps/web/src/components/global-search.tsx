'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Music, Users, Calendar, FileText, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SearchResult {
  id: string
  title: string
  description?: string
  type: 'track' | 'artist' | 'event' | 'document'
  url: string
  icon: React.ComponentType<{ className?: string }>
  metadata?: {
    plays?: number
    date?: string
    genre?: string
  }
}

// Mock search data
const mockSearchData: SearchResult[] = [
  {
    id: '1',
    title: 'Midnight Dreams',
    description: 'Your latest single with 45K streams',
    type: 'track',
    url: '/dashboard/music',
    icon: Music,
    metadata: { plays: 45320, genre: 'Electronic' }
  },
  {
    id: '2',
    title: 'Upload New Track',
    description: 'Upload and distribute your music',
    type: 'document',
    url: '/dashboard/music/upload',
    icon: FileText,
  },
  {
    id: '3',
    title: 'Summer Music Festival',
    description: 'Upcoming event on July 15, 2024',
    type: 'event',
    url: '/dashboard/events',
    icon: Calendar,
    metadata: { date: '2024-07-15' }
  },
  {
    id: '4',
    title: 'Luna Rodriguez',
    description: 'Electronic artist from Los Angeles',
    type: 'artist',
    url: '/dashboard/community',
    icon: Users,
    metadata: { genre: 'Electronic' }
  },
  {
    id: '5',
    title: 'Analytics Dashboard',
    description: 'View your streaming and revenue analytics',
    type: 'document',
    url: '/dashboard/analytics',
    icon: FileText,
  },
]

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Search functionality
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    
    // Simulate search delay
    setTimeout(() => {
      const filtered = mockSearchData.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setResults(filtered)
      setIsLoading(false)
      setSelectedIndex(0)
    }, 300)
  }, [])

  useEffect(() => {
    performSearch(query)
  }, [query, performSearch])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      navigateToResult(results[selectedIndex])
    }
  }

  const navigateToResult = (result: SearchResult) => {
    router.push(result.url)
    setIsOpen(false)
    setQuery('')
  }

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'track': return 'bg-purple-100 text-purple-700'
      case 'artist': return 'bg-blue-100 text-blue-700'
      case 'event': return 'bg-green-100 text-green-700'
      case 'document': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="hidden md:flex items-center gap-2 text-sm text-muted-foreground"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4" />
        Search...
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="sr-only">Search</DialogTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for tracks, artists, events..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-10"
                autoFocus
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={() => setQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogHeader>

          {(query || results.length > 0) && (
            <div className="border-t">
              <ScrollArea className="h-[400px]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : results.length > 0 ? (
                  <div className="p-2">
                    {results.map((result, index) => {
                      const Icon = result.icon
                      const isSelected = index === selectedIndex
                      
                      return (
                        <button
                          key={result.id}
                          onClick={() => navigateToResult(result)}
                          className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
                            isSelected ? 'bg-accent' : 'hover:bg-accent/50'
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-muted">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{result.title}</p>
                              <Badge variant="secondary" className={`text-xs ${getTypeColor(result.type)}`}>
                                {result.type}
                              </Badge>
                            </div>
                            {result.description && (
                              <p className="text-sm text-muted-foreground truncate">
                                {result.description}
                              </p>
                            )}
                            {result.metadata && (
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                {result.metadata.plays && (
                                  <span>{result.metadata.plays.toLocaleString()} plays</span>
                                )}
                                {result.metadata.date && (
                                  <span>{new Date(result.metadata.date).toLocaleDateString()}</span>
                                )}
                                {result.metadata.genre && (
                                  <span>{result.metadata.genre}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No results found for "{query}"</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try searching for tracks, artists, or events
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          <div className="border-t p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded border bg-muted">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded border bg-muted">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded border bg-muted">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded border bg-muted">esc</kbd>
                  Close
                </span>
              </div>
              {results.length > 0 && (
                <span>{results.length} results</span>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}