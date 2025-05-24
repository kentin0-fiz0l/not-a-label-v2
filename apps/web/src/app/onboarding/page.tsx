"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, BarChart3, Sparkles, Globe2, ArrowRight, Users, Headphones, TrendingUp } from "lucide-react"

const features = [
  {
    icon: Music,
    title: "Music Distribution",
    description: "Distribute to 150+ platforms including Spotify, Apple Music, and YouTube"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track your performance with real-time streaming data and audience insights"
  },
  {
    icon: Sparkles,
    title: "AI Career Assistant",
    description: "Get personalized guidance for your music career with AI-powered recommendations"
  },
  {
    icon: Globe2,
    title: "Global Community",
    description: "Connect with artists and fans worldwide, collaborate and grow together"
  }
]

const stats = [
  { label: "Active Artists", value: "10K+", icon: Users },
  { label: "Songs Distributed", value: "50K+", icon: Headphones },
  { label: "Monthly Streams", value: "1M+", icon: TrendingUp }
]

export default function OnboardingWelcome() {
  const [isStarting, setIsStarting] = useState(false)
  const router = useRouter()

  const handleGetStarted = async () => {
    setIsStarting(true)
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))
    router.push("/onboarding/profile")
  }

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
            <Music className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Your Music Journey Starts Here</CardTitle>
          <CardDescription className="text-lg">
            Join thousands of independent artists who are building successful careers on their own terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleGetStarted}
            disabled={isStarting}
            className="bg-gradient-primary hover:opacity-90 text-white px-8 py-3 text-lg gap-2"
          >
            {isStarting ? "Starting..." : "Let's Get Started"}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="border-0 shadow-md bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                  <feature.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom CTA */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm">
        <CardContent className="text-center py-8">
          <h3 className="text-xl font-semibold mb-2">Ready to Transform Your Music Career?</h3>
          <p className="text-muted-foreground mb-4">
            It only takes 2 minutes to set up your profile and start distributing your music
          </p>
          <Button 
            onClick={handleGetStarted}
            disabled={isStarting}
            variant="outline" 
            className="border-purple-200 hover:bg-purple-50"
          >
            {isStarting ? "Starting..." : "Continue Setup"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}