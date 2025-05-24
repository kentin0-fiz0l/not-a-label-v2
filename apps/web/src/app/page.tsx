'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Music, Users, BarChart3, Globe, Sparkles, Shield,
  Play, TrendingUp, Zap, Heart, Star, ChevronRight,
  Check, ArrowRight, Menu, X, DollarSign, Headphones
} from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    icon: Music,
    title: 'Music Distribution',
    description: 'Distribute your music to all major streaming platforms with a single upload.',
    color: 'from-purple-500 to-blue-500',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track your performance with real-time analytics and audience insights.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Sparkles,
    title: 'AI Career Assistant',
    description: 'Get personalized guidance to grow your music career with AI-powered insights.',
    color: 'from-cyan-500 to-green-500',
  },
  {
    icon: Users,
    title: 'Artist Community',
    description: 'Connect with other artists, collaborate, and grow together.',
    color: 'from-green-500 to-yellow-500',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Reach millions of listeners worldwide across all major platforms.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Rights Protection',
    description: 'Keep 100% of your rights and get transparent, fair revenue sharing.',
    color: 'from-orange-500 to-red-500',
  },
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Independent Artist',
    avatar: '👩‍🎤',
    content: 'Not a Label transformed my music career. The AI insights helped me grow from 1K to 100K monthly listeners in just 6 months.',
    rating: 5,
  },
  {
    name: 'Marcus Rivera',
    role: 'Producer & DJ',
    avatar: '🎧',
    content: 'The analytics are incredible. I can see exactly where my fans are and what they love. It\'s like having a personal data scientist.',
    rating: 5,
  },
  {
    name: 'Luna Park',
    role: 'Singer-Songwriter',
    avatar: '🎤',
    content: 'Finally, a platform that puts artists first. The community features helped me find amazing collaborators for my latest album.',
    rating: 5,
  },
]

const stats = [
  { label: 'Active Artists', value: '50K+', icon: Users },
  { label: 'Songs Distributed', value: '2M+', icon: Music },
  { label: 'Monthly Streams', value: '500M+', icon: Headphones },
  { label: 'Revenue Paid', value: '$10M+', icon: DollarSign },
]

const pricingPlans = [
  {
    name: 'Starter',
    price: '$0',
    description: 'Perfect for new artists',
    features: [
      '3 uploads per month',
      'Basic analytics',
      'Community access',
      'Standard distribution',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$19',
    description: 'Everything you need to grow',
    features: [
      'Unlimited uploads',
      'Advanced analytics',
      'AI career assistant',
      'Priority distribution',
      'Collaboration tools',
      'Custom artist page',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Label',
    price: '$99',
    description: 'For labels and agencies',
    features: [
      'Everything in Pro',
      'Multi-artist management',
      'White-label options',
      'API access',
      'Dedicated support',
      'Revenue splitting',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Music className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl">Not a Label</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#testimonials" className="text-sm hover:text-primary transition-colors">
                Testimonials
              </Link>
              <Link href="#pricing" className="text-sm hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/login" className="text-sm hover:text-primary transition-colors">
                Sign In
              </Link>
              <Button asChild className="bg-gradient-primary hover:opacity-90 text-white">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <Link href="#features" className="block text-sm hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#testimonials" className="block text-sm hover:text-primary transition-colors">
                Testimonials
              </Link>
              <Link href="#pricing" className="block text-sm hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/login" className="block text-sm hover:text-primary transition-colors">
                Sign In
              </Link>
              <Button asChild className="w-full bg-gradient-primary hover:opacity-90 text-white">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
          >
            <Badge variant="secondary" className="px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Powered by AI
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Your Music Career,
              <br />
              Amplified
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The all-in-one platform for independent artists. Distribute your music, 
              grow your fanbase, and build a sustainable career with AI-powered insights.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-white">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
          >
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="text-center">
                  <Icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground">
              Built by artists, for artists. Every feature designed to help you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className={`h-12 w-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Artists Worldwide
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of artists who are building their careers with Not a Label
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{testimonial.avatar}</div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that's right for your music career
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`h-full ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                  <CardContent className="p-6">
                    {plan.popular && (
                      <Badge className="mb-4">Most Popular</Badge>
                    )}
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.price !== '$0' && <span className="text-muted-foreground">/month</span>}
                    </div>
                    <p className="text-muted-foreground mb-6">{plan.description}</p>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-gradient-primary hover:opacity-90 text-white' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Take Control of Your Music Career?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of independent artists who are building sustainable careers with Not a Label.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Schedule a Demo
              </Button>
            </div>
            <p className="text-sm mt-6 opacity-75">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Music className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-xl">Not a Label</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Empowering independent artists to build sustainable music careers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary">Dashboard</Link></li>
                <li><Link href="/api" className="hover:text-primary">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">About</Link></li>
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-primary">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-primary">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Not a Label. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}