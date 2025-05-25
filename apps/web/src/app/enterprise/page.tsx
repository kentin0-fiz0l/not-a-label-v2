'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Shield,
  Zap,
  Globe,
  Users,
  BarChart3,
  Headphones,
  Palette,
  Check,
  Star,
  ArrowRight,
  Phone,
  Mail,
} from 'lucide-react';
import Image from 'next/image';

export default function EnterprisePage() {
  const [contactForm, setContactForm] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    employees: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle enterprise contact form submission
    console.log('Enterprise contact:', contactForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600">
            Enterprise Solutions
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Power Your Music Business with
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {' '}White-Label Solutions
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Launch your own music distribution platform with our enterprise-grade infrastructure.
            Complete customization, dedicated support, and enterprise SLAs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
              Schedule Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              Download Brochure
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Enterprise Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Palette,
              title: 'Complete White-Label',
              description: 'Your brand, your colors, your domain. Complete customization of the entire platform.',
            },
            {
              icon: Users,
              title: 'Multi-Tenant Architecture',
              description: 'Manage multiple labels and artists with advanced permission systems.',
            },
            {
              icon: Shield,
              title: 'Enterprise Security',
              description: 'SOC 2 compliance, SSO integration, advanced encryption, and audit logs.',
            },
            {
              icon: Zap,
              title: 'High Performance',
              description: '99.99% uptime SLA with global CDN and auto-scaling infrastructure.',
            },
            {
              icon: BarChart3,
              title: 'Advanced Analytics',
              description: 'Custom dashboards, API access, data exports, and business intelligence.',
            },
            {
              icon: Globe,
              title: 'Global Distribution',
              description: 'Direct partnerships with 200+ streaming platforms and digital stores.',
            },
          ].map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg w-fit">
                  <feature.icon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Enterprise Plans</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: 'Startup',
              price: '$2,500',
              period: '/month',
              description: 'Perfect for growing independent labels',
              features: [
                'Up to 50 artists',
                'White-label branding',
                'Basic analytics',
                'Email support',
                'Standard distribution',
                'API access',
              ],
              popular: false,
            },
            {
              name: 'Professional',
              price: '$7,500',
              period: '/month',
              description: 'For established labels and distributors',
              features: [
                'Up to 500 artists',
                'Full customization',
                'Advanced analytics',
                'Priority support',
                'Premium distribution',
                'Custom integrations',
                'Dedicated account manager',
                'SLA guarantee',
              ],
              popular: true,
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              period: '',
              description: 'For major labels and large distributors',
              features: [
                'Unlimited artists',
                'Complete platform control',
                'Custom development',
                '24/7 phone support',
                'Global distribution network',
                'On-premise deployment',
                'Dedicated infrastructure',
                'Custom contracts',
              ],
              popular: false,
            },
          ].map((plan, index) => (
            <Card
              key={index}
              className={`relative ${plan.popular ? 'border-purple-500 shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6">
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Perfect For</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: 'Independent Record Labels',
              description: 'Launch your own distribution platform and keep 100% of your revenue.',
              icon: Building2,
              benefits: ['Custom branding', 'Artist management', 'Revenue sharing', 'Analytics'],
            },
            {
              title: 'Music Distributors',
              description: 'White-label our platform to offer distribution services to your clients.',
              icon: Globe,
              benefits: ['Multi-client support', 'Automated workflows', 'Reporting', 'API access'],
            },
            {
              title: 'Streaming Platforms',
              description: 'Build your own music streaming service with our infrastructure.',
              icon: Headphones,
              benefits: ['Content delivery', 'User management', 'Recommendation engine', 'Mobile apps'],
            },
            {
              title: 'Educational Institutions',
              description: 'Provide students with professional music distribution tools.',
              icon: Users,
              benefits: ['Student portfolios', 'Learning analytics', 'Industry connections', 'Certification'],
            },
          ].map((useCase, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <useCase.icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {useCase.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {useCase.benefits.map((benefit, i) => (
                        <Badge key={i} variant="outline">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Enterprise Clients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "The white-label solution allowed us to launch our distribution platform in just 3 months. The revenue growth has been incredible.",
              author: "Sarah Chen",
              title: "CEO, Melody Records",
              rating: 5,
            },
            {
              quote: "Enterprise support is outstanding. They helped us customize everything exactly how we needed it for our 200+ artists.",
              author: "Marcus Johnson",
              title: "CTO, Urban Sounds Distribution",
              rating: 5,
            },
            {
              quote: "The analytics and reporting features give us insights we never had before. It's transformed how we operate.",
              author: "Elena Rodriguez",
              title: "Head of Operations, Latin Music Group",
              rating: 5,
            },
          ].map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Let's discuss how our enterprise solution can transform your music business.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name *</label>
                    <Input
                      required
                      value={contactForm.company}
                      onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                      placeholder="Your Company"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name *</label>
                    <Input
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <Input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="john@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Size</label>
                    <select
                      className="w-full p-3 border rounded-md"
                      value={contactForm.employees}
                      onChange={(e) => setContactForm({ ...contactForm, employees: e.target.value })}
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="200+">200+ employees</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Tell us about your requirements..."
                  />
                </div>
                <div className="text-center">
                  <Button type="submit" size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                    Send Message
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Info */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Phone className="h-8 w-8 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">Sales</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
            <div className="text-center">
              <Mail className="h-8 w-8 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-gray-600">enterprise@not-a-label.art</p>
            </div>
            <div className="text-center">
              <Building2 className="h-8 w-8 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">Office</h3>
              <p className="text-gray-600">San Francisco, CA</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}