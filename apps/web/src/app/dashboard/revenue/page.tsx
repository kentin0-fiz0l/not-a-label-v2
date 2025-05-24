'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import {
  DollarSign, TrendingUp, TrendingDown, Download, Calendar,
  CreditCard, AlertCircle, CheckCircle, Clock, ArrowUpRight,
  ArrowDownRight, Music, Users, Globe, FileText, Info, Plus
} from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

const revenueData = [
  { month: 'Jan', streaming: 1250, downloads: 320, sync: 180, events: 850, total: 2600 },
  { month: 'Feb', streaming: 1380, downloads: 280, sync: 200, events: 920, total: 2780 },
  { month: 'Mar', streaming: 1520, downloads: 340, sync: 150, events: 1100, total: 3110 },
  { month: 'Apr', streaming: 1690, downloads: 390, sync: 220, events: 1200, total: 3500 },
  { month: 'May', streaming: 1820, downloads: 420, sync: 280, events: 980, total: 3500 },
  { month: 'Jun', streaming: 1950, downloads: 380, sync: 300, events: 1320, total: 3950 },
]

const revenueBySource = [
  { name: 'Streaming', value: 10230, percentage: 58, color: '#8B5CF6' },
  { name: 'Live Events', value: 6380, percentage: 25, color: '#3B82F6' },
  { name: 'Downloads', value: 2210, percentage: 12, color: '#10B981' },
  { name: 'Sync Licensing', value: 1430, percentage: 5, color: '#F59E0B' },
]

const platformBreakdown = [
  { platform: 'Spotify', revenue: 4520, streams: 1506667, rate: 0.003 },
  { platform: 'Apple Music', revenue: 2840, streams: 284000, rate: 0.01 },
  { platform: 'YouTube Music', revenue: 1680, streams: 840000, rate: 0.002 },
  { platform: 'Amazon Music', revenue: 890, streams: 222500, rate: 0.004 },
  { platform: 'Tidal', revenue: 300, streams: 23364, rate: 0.01284 },
]

const upcomingPayments = [
  { id: '1', source: 'Spotify', amount: 324.50, date: new Date('2024-02-15'), status: 'scheduled' },
  { id: '2', source: 'Apple Music', amount: 186.20, date: new Date('2024-02-28'), status: 'scheduled' },
  { id: '3', source: 'Live Nation', amount: 1250.00, date: new Date('2024-03-05'), status: 'pending' },
  { id: '4', source: 'YouTube Music', amount: 143.50, date: new Date('2024-01-31'), status: 'completed' },
]

export default function RevenuePage() {
  const [timeRange, setTimeRange] = useState('6m')
  const [activeTab, setActiveTab] = useState('overview')

  const totalRevenue = revenueBySource.reduce((sum, source) => sum + source.value, 0)
  const monthlyAverage = totalRevenue / 6
  const growthRate = 15.2

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: `+${growthRate}%`,
      trend: 'up',
      icon: DollarSign,
      description: 'Last 6 months',
    },
    {
      title: 'Monthly Average',
      value: `$${monthlyAverage.toFixed(0)}`,
      change: '+8.3%',
      trend: 'up',
      icon: TrendingUp,
      description: 'Per month',
    },
    {
      title: 'Pending Payments',
      value: '$1,904.20',
      change: '3 payments',
      trend: 'neutral',
      icon: Clock,
      description: 'Next 30 days',
    },
    {
      title: 'Top Revenue Source',
      value: 'Streaming',
      change: '58% of total',
      trend: 'up',
      icon: Music,
      description: 'Primary income',
    },
  ]

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue</h1>
          <p className="text-muted-foreground">
            Track your earnings and financial performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last month</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Tax Report
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
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
                  <span className={
                    stat.trend === 'up' ? 'text-green-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 
                    'text-gray-600'
                  }>
                    {stat.trend === 'up' && <TrendingUp className="inline h-3 w-3" />}
                    {stat.trend === 'down' && <TrendingDown className="inline h-3 w-3" />}
                    {' '}{stat.change}
                  </span>
                  {' '}• {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="streaming">Streaming</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>
                Monthly revenue breakdown by source
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                  <Area type="monotone" dataKey="streaming" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" name="Streaming" />
                  <Area type="monotone" dataKey="events" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Events" />
                  <Area type="monotone" dataKey="downloads" stackId="1" stroke="#10B981" fill="#10B981" name="Downloads" />
                  <Area type="monotone" dataKey="sync" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Sync" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Source</CardTitle>
                <CardDescription>
                  Distribution of income streams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueBySource}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {revenueBySource.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {revenueBySource.map((source) => (
                    <div key={source.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: source.color }} />
                        <span className="text-sm">{source.name}</span>
                      </div>
                      <span className="text-sm font-medium">${source.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Latest revenue activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <ArrowDownRight className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Spotify Payout</p>
                        <p className="text-sm text-muted-foreground">Streaming revenue</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">+$324.50</p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <ArrowDownRight className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Summer Festival</p>
                        <p className="text-sm text-muted-foreground">Event performance</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">+$1,250.00</p>
                      <p className="text-xs text-muted-foreground">1 week ago</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <ArrowDownRight className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Sync License</p>
                        <p className="text-sm text-muted-foreground">TV placement</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">+$500.00</p>
                      <p className="text-xs text-muted-foreground">2 weeks ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="streaming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>
                Revenue and streaming metrics by platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Platform</th>
                      <th className="text-right p-4">Streams</th>
                      <th className="text-right p-4">Revenue</th>
                      <th className="text-right p-4">Avg. Rate</th>
                      <th className="text-right p-4">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformBreakdown.map((platform) => {
                      const percentage = (platform.revenue / totalRevenue * 100).toFixed(1)
                      return (
                        <tr key={platform.platform} className="border-b">
                          <td className="p-4">
                            <div className="font-medium">{platform.platform}</div>
                          </td>
                          <td className="text-right p-4">
                            {platform.streams.toLocaleString()}
                          </td>
                          <td className="text-right p-4">
                            ${platform.revenue.toLocaleString()}
                          </td>
                          <td className="text-right p-4">
                            ${platform.rate.toFixed(4)}
                          </td>
                          <td className="text-right p-4">
                            <div className="flex items-center justify-end gap-2">
                              <span>{percentage}%</span>
                              <Progress value={parseFloat(percentage)} className="w-16 h-2" />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Streaming Trends</CardTitle>
              <CardDescription>
                Monthly streaming revenue growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                  <Line type="monotone" dataKey="streaming" stroke="#8B5CF6" strokeWidth={2} name="Streaming Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Schedule</CardTitle>
              <CardDescription>
                Upcoming and recent payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        payment.status === 'completed' ? 'bg-green-100' :
                        payment.status === 'scheduled' ? 'bg-blue-100' :
                        'bg-yellow-100'
                      }`}>
                        {payment.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : payment.status === 'scheduled' ? (
                          <Clock className="h-5 w-5 text-blue-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{payment.source}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(payment.date, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg">${payment.amount.toFixed(2)}</p>
                      <Badge variant={
                        payment.status === 'completed' ? 'default' :
                        payment.status === 'scheduled' ? 'secondary' :
                        'outline'
                      }>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payout preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Bank Account ****1234</p>
                      <p className="text-sm text-muted-foreground">Primary account</p>
                    </div>
                  </div>
                  <Badge>Default</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-medium">PayPal</p>
                      <p className="text-sm text-muted-foreground">user@example.com</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Set as default</Button>
                </div>
                <Button className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Insights</CardTitle>
                <CardDescription>
                  Key findings and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Strong Streaming Growth</p>
                    <p className="text-sm text-muted-foreground">
                      Your streaming revenue has increased by 23% over the last quarter. 
                      Focus on playlist placements to maintain momentum.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                    <Info className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Diversify Revenue Streams</p>
                    <p className="text-sm text-muted-foreground">
                      58% of your revenue comes from streaming. Consider exploring sync 
                      licensing and merchandise to reduce dependency.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center mt-0.5">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Seasonal Patterns</p>
                    <p className="text-sm text-muted-foreground">
                      Event revenue peaks in summer months. Plan releases and tours 
                      accordingly to maximize earnings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Goals</CardTitle>
                <CardDescription>
                  Track your progress towards revenue targets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Annual Revenue Goal</span>
                    <span className="text-sm text-muted-foreground">$42,000</span>
                  </div>
                  <Progress value={62} className="h-2" />
                  <p className="text-xs text-muted-foreground">$26,040 of $42,000 (62%)</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Monthly Target</span>
                    <span className="text-sm text-muted-foreground">$3,500</span>
                  </div>
                  <Progress value={94} className="h-2" />
                  <p className="text-xs text-muted-foreground">$3,290 of $3,500 (94%)</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Stream Goal</span>
                    <span className="text-sm text-muted-foreground">5M streams</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  <p className="text-xs text-muted-foreground">3.9M of 5M streams (78%)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
              <CardDescription>
                Projected earnings for the next 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-3xl font-bold">$24,500</p>
                <p className="text-muted-foreground">Estimated revenue next 6 months</p>
                <p className="text-sm text-green-600 mt-2">
                  <TrendingUp className="inline h-4 w-4" />
                  {' '}Based on current growth rate of 15.2%
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}