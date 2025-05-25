'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Music,
  DollarSign,
  Activity,
  Shield,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Settings,
} from 'lucide-react';

interface SystemStats {
  users: { total: number; active: number; new: number };
  tracks: { total: number; uploaded: number; distributed: number };
  revenue: { total: number; thisMonth: number; pending: number };
  system: { cpu: number; memory: number; disk: number; uptime: number };
}

interface HealthStatus {
  database: boolean;
  redis: boolean;
  storage: boolean;
  email: boolean;
  payments: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, healthRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/health'),
      ]);
      
      if (statsRes.ok && healthRes.ok) {
        setStats(await statsRes.json());
        setHealth(await healthRes.json());
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (type: string) => {
    const response = await fetch(`/api/admin/export?type=${type}`);
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and monitor the Not a Label platform
        </p>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {health && Object.entries(health).map(([service, status]) => (
          <Card key={service} className={`${status ? 'border-green-500' : 'border-red-500'}`}>
            <CardContent className="flex items-center justify-between p-4">
              <span className="capitalize text-sm font-medium">{service}</span>
              {status ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.users.new} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.tracks.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.tracks.distributed} distributed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.revenue.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ${stats?.revenue.thisMonth.toLocaleString()} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.system.cpu}%</div>
            <p className="text-xs text-muted-foreground">
              Memory: {stats?.system.memory}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Activity feed would go here */}
                <p className="text-muted-foreground">Loading recent activity...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Management</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData('users')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Users
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input placeholder="Search users..." className="max-w-sm" />
                  <Button>Search</Button>
                </div>
                {/* User list would go here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Content Moderation</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData('content')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Content
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Badge variant="outline">Pending Review: 12</Badge>
                  <Badge variant="outline">Flagged: 3</Badge>
                  <Badge variant="outline">Approved Today: 45</Badge>
                </div>
                {/* Content moderation list would go here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Rate Limiting</p>
                      <p className="text-sm text-muted-foreground">
                        Active on all API endpoints
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Database Backups</p>
                      <p className="text-sm text-muted-foreground">
                        Last backup: 2 hours ago
                      </p>
                    </div>
                  </div>
                  <Button size="sm">Run Backup</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Security Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        3 alerts in the last 24 hours
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">View Alerts</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cache TTL (seconds)</label>
                    <Input type="number" defaultValue="300" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Upload Size (MB)</label>
                    <Input type="number" defaultValue="50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rate Limit (req/min)</label>
                    <Input type="number" defaultValue="100" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Session Timeout (hours)</label>
                    <Input type="number" defaultValue="24" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button>Save Configuration</Button>
                  <Button variant="outline">Reset to Defaults</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enable maintenance mode to temporarily disable access to the platform
                </p>
                <div className="flex items-center gap-4">
                  <Button variant="destructive">Enable Maintenance Mode</Button>
                  <Button variant="outline">Schedule Maintenance</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}