"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Send, 
  Sparkles, 
  User, 
  Loader2, 
  Music,
  TrendingUp,
  Lightbulb,
  Target,
  Calendar,
  DollarSign,
  BookOpen,
  Mic,
  MessageSquare,
  FileText,
  Zap,
  Star
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const quickPrompts = [
  {
    icon: TrendingUp,
    label: "Growth Strategy",
    prompt: "What strategies can I use to grow my fanbase on streaming platforms?"
  },
  {
    icon: Music,
    label: "Genre Trends",
    prompt: "What are the current trends in my music genre?"
  },
  {
    icon: Target,
    label: "Marketing Tips",
    prompt: "How can I market my new single effectively?"
  },
  {
    icon: DollarSign,
    label: "Revenue Streams",
    prompt: "What are the best ways to monetize my music?"
  }
]

const careerInsights = [
  {
    icon: Lightbulb,
    title: "Content Strategy",
    description: "Create behind-the-scenes content to connect with fans",
    category: "Marketing"
  },
  {
    icon: Calendar,
    title: "Release Schedule",
    description: "Consider releasing singles every 6-8 weeks for consistent engagement",
    category: "Strategy"
  },
  {
    icon: Mic,
    title: "Live Performance",
    description: "Book local gigs to build your fanbase and performance skills",
    category: "Performance"
  },
  {
    icon: MessageSquare,
    title: "Fan Engagement",
    description: "Respond to comments and DMs to build a loyal community",
    category: "Community"
  }
]

const aiTools = [
  {
    icon: FileText,
    title: "Bio Generator",
    description: "Create compelling artist bios for different platforms",
    status: "active"
  },
  {
    icon: Zap,
    title: "Hook Analyzer",
    description: "Analyze your song hooks for viral potential",
    status: "active"
  },
  {
    icon: Star,
    title: "Playlist Pitcher",
    description: "Generate personalized playlist pitch emails",
    status: "active"
  },
  {
    icon: TrendingUp,
    title: "Career Roadmap",
    description: "Get a personalized 12-month career plan",
    status: "coming-soon"
  }
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI career assistant. I'm here to help you navigate your music journey, from creative decisions to marketing strategies. What would you like to know?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(input),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  const generateAIResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase()
    
    if (lowerInput.includes("grow") || lowerInput.includes("fanbase")) {
      return "Growing your fanbase requires a multi-faceted approach:\n\n1. **Consistent Releases**: Aim to release new music every 6-8 weeks to stay relevant in algorithms.\n\n2. **Social Media Strategy**: Post 3-5 times per week across platforms, mixing content types (performances, behind-the-scenes, personal stories).\n\n3. **Collaborate**: Partner with artists in your genre for cross-promotion.\n\n4. **Playlist Pitching**: Submit to independent playlist curators 3-4 weeks before release.\n\n5. **Engage Authentically**: Respond to every comment in the first 24 hours after posting.\n\nWould you like me to create a specific growth plan for your next release?"
    }
    
    if (lowerInput.includes("trend") || lowerInput.includes("genre")) {
      return "Based on current data in your genre:\n\n📈 **Trending Now**:\n- Shorter song lengths (2:30-3:00) for better playlist placement\n- Lo-fi and acoustic versions of popular tracks\n- Collaborations with visual artists for unique cover art\n\n🎵 **Sound Trends**:\n- Nostalgic elements mixed with modern production\n- Emphasis on authentic, raw vocals\n- Minimalist arrangements focusing on emotion\n\n💡 **Content Trends**:\n- TikTok-ready hooks in the first 15 seconds\n- Behind-the-scenes studio content\n- Fan remix competitions\n\nWould you like specific recommendations for your style?"
    }
    
    if (lowerInput.includes("market") || lowerInput.includes("single")) {
      return "Here's a comprehensive marketing strategy for your single:\n\n**6 Weeks Before Release**:\n- Create teaser content (studio clips, lyrics reveals)\n- Pitch to playlist curators\n- Set up pre-save campaign\n\n**4 Weeks Before**:\n- Release artwork and announce date\n- Start countdown posts\n- Reach out to music blogs\n\n**2 Weeks Before**:\n- Share preview clips\n- Launch contest/giveaway\n- Contact local radio\n\n**Release Week**:\n- Go live on social media\n- Release visualizer/music video\n- Engage with every comment\n\n**Post-Release**:\n- Share fan reactions\n- Create remix/acoustic version\n- Submit for sync opportunities\n\nNeed help with any specific aspect?"
    }
    
    if (lowerInput.includes("revenue") || lowerInput.includes("money") || lowerInput.includes("monetize")) {
      return "Here are proven revenue streams for independent artists:\n\n💰 **Streaming Revenue**:\n- Focus on playlist placement for passive income\n- Release consistently to maximize algorithmic promotion\n\n🎫 **Live Performance**:\n- Book 2-3 local shows monthly\n- Offer VIP experiences\n- Sell merchandise at venues\n\n🛍️ **Merchandise**:\n- Start with print-on-demand to minimize investment\n- Limited edition items create urgency\n- Bundle with digital content\n\n📱 **Direct-to-Fan**:\n- Patreon for exclusive content\n- Bandcamp for higher revenue share\n- Live streaming with virtual tips\n\n🎬 **Sync Licensing**:\n- Submit to music libraries\n- Create instrumental versions\n- Target indie films and podcasts\n\nWhich revenue stream interests you most?"
    }
    
    return "That's a great question! Let me help you with that.\n\nBased on your query, I'd recommend focusing on building a strong foundation first. This includes:\n\n1. Defining your unique artistic identity\n2. Understanding your target audience\n3. Creating a consistent release schedule\n4. Building genuine connections with your fans\n\nCould you tell me more about your specific goals or challenges? This will help me provide more tailored advice for your music career."
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-600" />
          AI Career Assistant
        </h1>
        <p className="text-muted-foreground mt-2">
          Your personal AI-powered music career advisor
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="tools">AI Tools</TabsTrigger>
          <TabsTrigger value="insights">Career Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Chat Interface */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">Chat with AI Assistant</CardTitle>
                  <CardDescription>
                    Ask questions about your music career, marketing, trends, and more
                  </CardDescription>
                </CardHeader>
                
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                              <Sparkles className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        
                        {message.role === "user" && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                            <Sparkles className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg p-3">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <CardContent className="border-t p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSend()
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about marketing, trends, career advice..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={!input.trim() || isLoading}
                      className="bg-gradient-primary hover:opacity-90 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Quick Prompts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {quickPrompts.map((prompt) => {
                      const Icon = prompt.icon
                      return (
                        <Button
                          key={prompt.label}
                          variant="outline"
                          className="justify-start h-auto p-3"
                          onClick={() => handleQuickPrompt(prompt.prompt)}
                        >
                          <Icon className="h-4 w-4 mr-2 shrink-0" />
                          <span className="text-left text-sm">{prompt.label}</span>
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Usage Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Questions Asked</span>
                      <span className="font-medium">127</span>
                    </div>
                    <Progress value={63} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Insights Generated</span>
                      <span className="font-medium">89</span>
                    </div>
                    <Progress value={44} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Time Saved</span>
                      <span className="font-medium">14.5 hrs</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* AI Credits */}
              <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">AI Credits</span>
                      <Badge className="bg-gradient-primary text-white">Pro</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Used this month</span>
                        <span>25 / 100</span>
                      </div>
                      <Progress value={25} className="h-2" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Resets in 23 days. Upgrade for unlimited access.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tools">
          <div className="grid md:grid-cols-2 gap-6">
            {aiTools.map((tool) => {
              const Icon = tool.icon
              return (
                <Card 
                  key={tool.title} 
                  className={`hover:shadow-lg transition-all cursor-pointer ${
                    tool.status === "coming-soon" ? "opacity-60" : ""
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        {tool.title}
                      </span>
                      {tool.status === "coming-soon" && (
                        <Badge variant="secondary">Coming Soon</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{tool.description}</p>
                    <Button 
                      className="w-full" 
                      disabled={tool.status === "coming-soon"}
                      variant={tool.status === "coming-soon" ? "secondary" : "default"}
                    >
                      {tool.status === "coming-soon" ? "Coming Soon" : "Launch Tool"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Personalized Career Insights
                </CardTitle>
                <CardDescription>
                  AI-generated recommendations based on your profile and industry trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {careerInsights.map((insight, index) => {
                    const Icon = insight.icon
                    return (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{insight.title}</h4>
                              <Badge variant="secondary">{insight.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Focus */}
            <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  This Week's Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-background rounded-lg">
                    <h4 className="font-medium mb-2">🎯 Playlist Outreach</h4>
                    <p className="text-sm text-muted-foreground">
                      Research and contact 10 playlist curators in your genre. Personalize each pitch with why your music fits their audience.
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-lg">
                    <h4 className="font-medium mb-2">📸 Content Creation</h4>
                    <p className="text-sm text-muted-foreground">
                      Film 3 short-form videos showcasing your creative process. Share one on TikTok, Instagram Reels, and YouTube Shorts.
                    </p>
                  </div>
                  <Button className="w-full">Get Full Weekly Plan</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}