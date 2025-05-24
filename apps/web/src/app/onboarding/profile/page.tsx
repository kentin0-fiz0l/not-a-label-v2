"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, ArrowRight, ArrowLeft, User } from "lucide-react"

const genres = [
  "Pop", "Rock", "Hip Hop", "R&B", "Country", "Electronic", "Folk", "Jazz", 
  "Classical", "Reggae", "Blues", "Punk", "Metal", "Indie", "Alternative", "Other"
]

const locations = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", 
  "Spain", "Italy", "Netherlands", "Sweden", "Norway", "Denmark", "Brazil", "Mexico", "Other"
]

export default function OnboardingProfile() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    artistName: "",
    bio: "",
    genre: "",
    location: "",
    website: "",
    instagram: "",
    twitter: "",
    profileImage: null as File | null
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }))
    }
  }

  const handleNext = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push("/onboarding/goals")
  }

  const handleBack = () => {
    router.push("/onboarding")
  }

  const isFormValid = formData.artistName && formData.bio && formData.genre && formData.location

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6 text-purple-600" />
            Create Your Artist Profile
          </CardTitle>
          <CardDescription>
            Tell us about yourself and your music. This information will help us personalize your experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              {formData.profileImage ? (
                <AvatarImage src={URL.createObjectURL(formData.profileImage)} />
              ) : (
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xl">
                  {formData.artistName ? formData.artistName[0].toUpperCase() : "?"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <input
                type="file"
                id="profile-image"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Label
                htmlFor="profile-image"
                className="cursor-pointer inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
              >
                <Upload className="h-4 w-4" />
                Upload Profile Photo
              </Label>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="artistName">Artist Name *</Label>
              <Input
                id="artistName"
                placeholder="Your stage name or band name"
                value={formData.artistName}
                onChange={(e) => setFormData(prev => ({ ...prev, artistName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Primary Genre *</Label>
            <Select value={formData.genre} onValueChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select your primary genre" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Artist Bio *</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about your music, influences, and what makes you unique..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="min-h-[120px]"
            />
            <p className="text-sm text-muted-foreground">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Social Links (Optional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://yourwebsite.com"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  placeholder="@yourusername"
                  value={formData.instagram}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input
                id="twitter"
                placeholder="@yourusername"
                value={formData.twitter}
                onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
              />
            </div>
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
              {isSubmitting ? "Saving..." : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}