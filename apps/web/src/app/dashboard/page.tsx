'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Music, 
  DollarSign,
  Play,
  Eye,
  Heart,
  Share2,
  Upload,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

// Simulate user state (in real app, this would come from authentication/user context)
const isNewUser = true; // Set to false to see the full dashboard

const profileCompletionSteps = [
  { id: 'profile', title: 'Complete Your Profile', completed: true },
  { id: 'upload', title: 'Upload Your First Song', completed: false },
  { id: 'distribute', title: 'Distribute to Platforms', completed: false },
  { id: 'social', title: 'Connect Social Media', completed: false },
  { id: 'analytics', title: 'Set Up Analytics', completed: false }
];

const completedSteps = profileCompletionSteps.filter(step => step.completed).length;
const completionPercentage = (completedSteps / profileCompletionSteps.length) * 100;

const stats = [
  {
    name: 'Total Streams',
    value: isNewUser ? '0' : '45,231',
    change: isNewUser ? null : '+12.5%',
    trend: 'up',
    icon: Play,
  },
  {
    name: 'Monthly Listeners',
    value: isNewUser ? '0' : '1,234',
    change: isNewUser ? null : '+8.2%',
    trend: 'up',
    icon: Users,
  },
  {
    name: 'Revenue',
    value: isNewUser ? '$0.00' : '$892.45',
    change: isNewUser ? null : '+15.3%',
    trend: 'up',
    icon: DollarSign,
  },
  {
    name: 'Total Tracks',
    value: isNewUser ? '0' : '24',
    change: isNewUser ? null : '+2',
    trend: 'up',
    icon: Music,
  },
];

const recentActivity = [
  { type: 'stream', track: 'Midnight Dreams', platform: 'Spotify', time: '2 minutes ago' },
  { type: 'like', track: 'Electric Sunset', platform: 'SoundCloud', time: '15 minutes ago' },
  { type: 'share', track: 'Urban Rhythm', platform: 'Instagram', time: '1 hour ago' },
  { type: 'stream', track: 'Neon Lights', platform: 'Apple Music', time: '2 hours ago' },
];

const quickActions = [
  {
    title: 'Upload Your First Track',
    description: 'Get your music on streaming platforms',
    icon: Upload,
    href: '/dashboard/music/upload',
    variant: 'primary' as const,
    isNew: true
  },
  {
    title: 'Get AI Career Advice',
    description: 'Personalized recommendations for growth',
    icon: Sparkles,
    href: '/dashboard/ai',
    variant: 'default' as const
  },
  {
    title: 'View Analytics',
    description: 'Track your performance metrics',
    icon: Eye,
    href: '/dashboard/analytics',
    variant: 'default' as const
  },
  {
    title: 'Distribute Music',
    description: 'Send your tracks to all platforms',
    icon: Share2,
    href: '/dashboard/distribution',
    variant: 'default' as const
  }
];

function EmptyStateCard({ 
  title, 
  description, 
  icon: Icon, 
  action 
}: {
  title: string;
  description: string;
  icon: any;
  action?: { label: string; href: string };
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        {action && (
          <Button asChild variant="outline">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [dismissedCompletion, setDismissedCompletion] = useState(false);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground mt-2">
          {isNewUser 
            ? "Let's get you started on your music journey." 
            : "Here's what's happening with your music today."
          }
        </p>
      </div>

      {/* Profile Completion - Only show for new users */}
      {isNewUser && !dismissedCompletion && (
        <Alert className="mb-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <Target className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Complete your setup ({completedSteps}/{profileCompletionSteps.length})
                </h4>
                <Progress value={completionPercentage} className="mb-3 h-2" />
                <div className="flex flex-wrap gap-2">
                  {profileCompletionSteps.map((step) => (
                    <Badge
                      key={step.id}
                      variant={step.completed ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {step.completed && <CheckCircle className="w-3 h-3 mr-1" />}
                      {step.title}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDismissedCompletion(true)}
                className="ml-4"
              >
                ×
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change ? (
                  <p className="text-xs text-muted-foreground">
                    <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>{' '}
                    from last month
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Start uploading to see your stats
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Recent Activity
              {isNewUser && <Badge variant="secondary">Coming Soon</Badge>}
            </CardTitle>
            <CardDescription>
              Real-time updates from your music platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isNewUser ? (
              <EmptyStateCard
                title="No Activity Yet"
                description="Upload your first track to start seeing activity from streaming platforms"
                icon={Clock}
                action={{ label: "Upload Track", href: "/dashboard/music/upload" }}
              />
            ) : (
              <>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {activity.type === 'stream' && <Play className="h-4 w-4 text-primary" />}
                        {activity.type === 'like' && <Heart className="h-4 w-4 text-primary" />}
                        {activity.type === 'share' && <Share2 className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.track}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.platform} • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/dashboard/analytics">View All Activity</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              {isNewUser ? "Get started with these essential tasks" : "Common tasks and shortcuts"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button 
                  key={action.title}
                  className={`w-full justify-start h-auto p-4 ${
                    action.variant === 'primary' && isNewUser
                      ? 'bg-gradient-primary hover:opacity-90 text-white'
                      : ''
                  }`}
                  variant={action.variant === 'primary' && isNewUser ? 'default' : 'outline'}
                  asChild
                >
                  <Link href={action.href}>
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium flex items-center gap-2">
                          {action.title}
                          {action.isNew && isNewUser && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                        <div className="text-xs opacity-70">{action.description}</div>
                      </div>
                    </div>
                  </Link>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Insights
          </CardTitle>
          <CardDescription>
            {isNewUser 
              ? "Get personalized recommendations once you upload your first track"
              : "Personalized recommendations based on your recent performance"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isNewUser ? (
            <EmptyStateCard
              title="AI Insights Coming Soon"
              description="Upload your music and connect your platforms to get AI-powered career guidance"
              icon={Sparkles}
              action={{ label: "Get Started", href: "/dashboard/music/upload" }}
            />
          ) : (
            <>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Growth Opportunity
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Your track "Midnight Dreams" is gaining traction on Spotify. 
                    Consider promoting it on social media to boost momentum.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-600" />
                    Trend Alert
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Electronic music in your genre is trending up 23% this month. 
                    This could be a good time to release your new tracks.
                  </p>
                </div>
              </div>
              <Button className="w-full mt-4" asChild>
                <Link href="/dashboard/ai">
                  Get More AI Insights
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Welcome Message for New Users */}
      {isNewUser && (
        <Card className="mt-6 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
          <CardContent className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <Music className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ready to Start Your Journey?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Upload your first track to begin building your presence on streaming platforms. 
              Our AI will help guide your career every step of the way.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild className="bg-gradient-primary hover:opacity-90 text-white">
                <Link href="/dashboard/music/upload">
                  Upload Your First Track
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/ai">
                  Get AI Guidance
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}