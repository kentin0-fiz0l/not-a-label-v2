"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Sparkles, Music, BarChart3, Users, ArrowRight, Gift } from "lucide-react"

const welcomeGifts = [
  {
    icon: Music,
    title: "First Upload Free",
    description: "Distribute your first song to all platforms at no cost"
  },
  {
    icon: BarChart3,
    title: "Premium Analytics",
    description: "Access advanced insights for your first 30 days"
  },
  {
    icon: Sparkles,
    title: "AI Assistant Credits",
    description: "10 free AI-powered career guidance sessions"
  }
]

const nextSteps = [
  {
    title: "Upload Your First Song",
    description: "Get your music on Spotify, Apple Music, and 150+ platforms",
    completed: false
  },
  {
    title: "Complete Your Profile",
    description: "Add more details, photos, and links to boost discoverability",
    completed: false
  },
  {
    title: "Connect Your Socials",
    description: "Link your social media accounts for cross-platform promotion",
    completed: false
  },
  {
    title: "Explore AI Assistant",
    description: "Get personalized recommendations for growing your career",
    completed: false
  }
]

export default function OnboardingComplete() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate account setup completion
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          setIsLoading(false)
          return 100
        }
        return prev + 10
      })
    }, 200)

    return () => clearInterval(timer)
  }, [])

  const handleGoToDashboard = () => {
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
              <Sparkles className="h-8 w-8 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Setting up your account...</h2>
            <div className="max-w-md mx-auto">
              <Progress value={progress} className="mb-4" />
              <p className="text-muted-foreground">
                Creating your profile, setting up analytics, and preparing your dashboard
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Welcome to Not a Label!</h2>
          <p className="text-green-700 mb-4">
            Your account is ready! You're now part of a community of independent artists building successful careers.
          </p>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Setup Complete
          </Badge>
        </CardContent>
      </Card>

      {/* Welcome Gifts */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600" />
            Welcome Gifts
          </CardTitle>
          <CardDescription>
            Here's what's waiting for you to get started on the right foot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {welcomeGifts.map((gift) => (
              <div key={gift.title} className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-800">
                  <gift.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-medium text-sm mb-1">{gift.title}</h3>
                <p className="text-xs text-muted-foreground">{gift.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">Recommended Next Steps</CardTitle>
          <CardDescription>
            Complete these tasks to get the most out of Not a Label
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nextSteps.map((step, index) => (
              <div key={step.title} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="mt-1">
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    step.completed 
                      ? "bg-green-500 border-green-500" 
                      : "border-gray-300 dark:border-gray-600"
                  }`}>
                    {step.completed && <CheckCircle className="h-3 w-3 text-white" />}
                    {!step.completed && (
                      <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm">
        <CardContent className="py-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Ready to Start Your Journey?</h3>
          <p className="text-muted-foreground mb-6">
            Your dashboard is ready with personalized recommendations based on your goals
          </p>
          <Button 
            onClick={handleGoToDashboard}
            className="bg-gradient-primary hover:opacity-90 text-white px-8 py-3 text-lg gap-2"
          >
            Go to Dashboard
            <ArrowRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>

      {/* Support */}
      <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
        <CardContent className="py-6 text-center">
          <h4 className="font-medium mb-2">Need Help Getting Started?</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Our support team is here to help you make the most of Not a Label
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Join Community
            </Button>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}