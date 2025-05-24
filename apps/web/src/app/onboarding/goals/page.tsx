"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, ArrowLeft, Target, Lightbulb, Clock } from "lucide-react"

const goals = [
  {
    id: "grow-fanbase",
    title: "Grow My Fanbase",
    description: "Build a larger audience and increase my social media following"
  },
  {
    id: "increase-streams",
    title: "Increase Streaming Numbers",
    description: "Get more plays on Spotify, Apple Music, and other platforms"
  },
  {
    id: "generate-revenue",
    title: "Generate Revenue",
    description: "Start earning money from my music through streaming and sales"
  },
  {
    id: "get-discovered",
    title: "Get Discovered",
    description: "Catch the attention of industry professionals, labels, or managers"
  },
  {
    id: "collaborate",
    title: "Collaborate with Others",
    description: "Connect and work with other artists, producers, and songwriters"
  },
  {
    id: "improve-craft",
    title: "Improve My Craft",
    description: "Develop my skills as a musician, songwriter, and performer"
  }
]

const timeCommitments = [
  { value: "casual", label: "Casual (1-5 hours/week)", description: "Music is a hobby for me" },
  { value: "part-time", label: "Part-time (5-20 hours/week)", description: "I'm serious but have other commitments" },
  { value: "full-time", label: "Full-time (20+ hours/week)", description: "Music is my primary focus" }
]

const experienceLevels = [
  { value: "beginner", label: "Just Starting Out", description: "New to music creation and distribution" },
  { value: "intermediate", label: "Some Experience", description: "I've released music before but want to grow" },
  { value: "advanced", label: "Experienced", description: "I have an established presence but need better tools" }
]

export default function OnboardingGoals() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [timeCommitment, setTimeCommitment] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    )
  }

  const handleNext = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push("/onboarding/complete")
  }

  const handleBack = () => {
    router.push("/onboarding/profile")
  }

  const isFormValid = selectedGoals.length > 0 && timeCommitment && experienceLevel

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-600" />
            Set Your Music Goals
          </CardTitle>
          <CardDescription>
            Help us understand what you want to achieve so we can provide personalized recommendations and tools.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Goals Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-purple-600" />
              What are your main goals? (Select all that apply)
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <Card 
                  key={goal.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedGoals.includes(goal.id) 
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                      : "border-border hover:border-purple-300"
                  }`}
                  onClick={() => handleGoalToggle(goal.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        checked={selectedGoals.includes(goal.id)}
                        onChange={() => handleGoalToggle(goal.id)}
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <h4 className="font-medium">{goal.title}</h4>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Time Commitment */}
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              How much time can you dedicate to your music?
            </Label>
            <RadioGroup value={timeCommitment} onValueChange={setTimeCommitment}>
              {timeCommitments.map((option) => (
                <Card 
                  key={option.value}
                  className={`cursor-pointer transition-all duration-200 ${
                    timeCommitment === option.value 
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                      : "border-border hover:border-purple-300"
                  }`}
                  onClick={() => setTimeCommitment(option.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                      <div className="space-y-1">
                        <Label htmlFor={option.value} className="font-medium cursor-pointer">
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>
          </div>

          {/* Experience Level */}
          <div className="space-y-4">
            <Label className="text-base font-medium">What's your experience level?</Label>
            <RadioGroup value={experienceLevel} onValueChange={setExperienceLevel}>
              {experienceLevels.map((option) => (
                <Card 
                  key={option.value}
                  className={`cursor-pointer transition-all duration-200 ${
                    experienceLevel === option.value 
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                      : "border-border hover:border-purple-300"
                  }`}
                  onClick={() => setExperienceLevel(option.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                      <div className="space-y-1">
                        <Label htmlFor={option.value} className="font-medium cursor-pointer">
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!isFormValid || isSubmitting}
              className="bg-gradient-primary hover:opacity-90 text-white gap-2"
            >
              {isSubmitting ? "Saving..." : "Complete Setup"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}