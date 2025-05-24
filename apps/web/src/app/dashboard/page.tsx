import { 
  TrendingUp, 
  Users, 
  Music, 
  DollarSign,
  Play,
  Eye,
  Heart,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const stats = [
  {
    name: 'Total Streams',
    value: '45,231',
    change: '+12.5%',
    trend: 'up',
    icon: Play,
  },
  {
    name: 'Monthly Listeners',
    value: '1,234',
    change: '+8.2%',
    trend: 'up',
    icon: Users,
  },
  {
    name: 'Revenue',
    value: '$892.45',
    change: '+15.3%',
    trend: 'up',
    icon: DollarSign,
  },
  {
    name: 'Total Tracks',
    value: '24',
    change: '+2',
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

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your music today.
        </p>
      </div>

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
                <p className="text-xs text-muted-foreground">
                  <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>{' '}
                  from last month
                </p>
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
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Real-time updates from your music platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/music/upload">
                <Music className="mr-2 h-4 w-4" />
                Upload New Track
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/ai">
                <TrendingUp className="mr-2 h-4 w-4" />
                Get AI Career Advice
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/analytics">
                <Eye className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/distribution">
                <Share2 className="mr-2 h-4 w-4" />
                Distribute Music
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
          <CardDescription>
            Personalized recommendations based on your recent performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-medium mb-2">🎯 Growth Opportunity</h4>
              <p className="text-sm text-muted-foreground">
                Your track "Midnight Dreams" is gaining traction on Spotify. 
                Consider promoting it on social media to boost momentum.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-medium mb-2">📈 Trend Alert</h4>
              <p className="text-sm text-muted-foreground">
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
        </CardContent>
      </Card>
    </div>
  );
}