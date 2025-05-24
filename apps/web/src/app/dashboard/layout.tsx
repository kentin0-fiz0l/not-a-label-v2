'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Music, 
  BarChart3, 
  Sparkles, 
  Users, 
  Calendar,
  DollarSign,
  Settings,
  Menu,
  X,
  Home,
  Upload,
  MessageSquare,
  Globe,
  Bell,
  Search,
  Command
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserMenu } from '@/components/user-menu';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Music', href: '/dashboard/music', icon: Music },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'AI Assistant', href: '/dashboard/ai', icon: Sparkles, badge: 'New' },
  { name: 'Distribution', href: '/dashboard/distribution', icon: Globe },
  { name: 'Community', href: '/dashboard/community', icon: Users },
  { name: 'Events', href: '/dashboard/events', icon: Calendar },
  { name: 'Revenue', href: '/dashboard/revenue', icon: DollarSign },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

// Mock user data (in real app, this would come from session/auth)
const mockUser = {
  name: "Alex Morgan",
  email: "alex@example.com",
  image: null
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Music className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Not a Label</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors mb-1',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-1 bg-card border-r">
          <div className="flex h-16 items-center px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Music className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Not a Label</span>
            </Link>
          </div>
          <nav className="flex-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors mb-1',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t">
            <Button className="w-full bg-gradient-primary hover:opacity-90 text-white" asChild>
              <Link href="/dashboard/music/upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload Music
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Breadcrumbs */}
            <div className="hidden lg:block ml-4">
              <Breadcrumbs />
            </div>
            
            <div className="flex-1" />
            
            {/* Header actions */}
            <div className="flex items-center gap-2">
              {/* Search command */}
              <Button
                variant="outline"
                className="hidden md:flex items-center gap-2 text-sm text-muted-foreground"
                size="sm"
              >
                <Search className="h-4 w-4" />
                Search...
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <Command className="h-3 w-3" />K
                </kbd>
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* Messages */}
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
              </Button>

              {/* User menu */}
              <UserMenu user={mockUser} />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}