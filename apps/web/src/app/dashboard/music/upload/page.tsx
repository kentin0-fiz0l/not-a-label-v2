"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Music, Info, Calendar, Globe, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UploadZone } from "@/components/upload-zone"
import { Stepper } from "@/components/ui/stepper"
import toast from "react-hot-toast"

const steps = [
  { title: "Upload Files", description: "Select your music files" },
  { title: "Track Details", description: "Add information about your track" },
  { title: "Distribution", description: "Choose where to release" },
  { title: "Review", description: "Confirm and publish" }
]

const genres = [
  "Pop", "Rock", "Hip Hop", "R&B", "Electronic", "Country", "Folk", 
  "Jazz", "Classical", "Reggae", "Blues", "Punk", "Metal", "Indie", "Alternative"
]

const moods = [
  "Happy", "Sad", "Energetic", "Calm", "Aggressive", "Romantic", 
  "Melancholic", "Uplifting", "Dark", "Chill", "Motivational"
]

const platforms = [
  { id: "spotify", name: "Spotify", icon: "🎵", popular: true },
  { id: "apple", name: "Apple Music", icon: "🎵", popular: true },
  { id: "youtube", name: "YouTube Music", icon: "📺", popular: true },
  { id: "soundcloud", name: "SoundCloud", icon: "☁️" },
  { id: "tidal", name: "Tidal", icon: "🌊" },
  { id: "deezer", name: "Deezer", icon: "🎶" },
  { id: "amazon", name: "Amazon Music", icon: "🛒" },
  { id: "pandora", name: "Pandora", icon: "📻" }
]

export default function MusicUploadPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  
  // Track details form data
  const [trackData, setTrackData] = useState({
    title: "",
    artist: "",
    album: "",
    genre: "",
    mood: "",
    year: new Date().getFullYear().toString(),
    description: "",
    lyrics: "",
    isExplicit: false,
    language: "English"
  })

  // Distribution settings
  const [distributionData, setDistributionData] = useState({
    platforms: ["spotify", "apple", "youtube"],
    releaseType: "immediate",
    releaseDate: "",
    pricing: "free",
    price: ""
  })

  const handleFilesAccepted = (files: File[]) => {
    setUploadedFiles(files)
    // Auto-fill track title from first file name
    if (files.length > 0 && !trackData.title) {
      const fileName = files[0].name.replace(/\.[^/.]+$/, "")
      setTrackData(prev => ({ ...prev, title: fileName }))
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast.success("Your track has been uploaded successfully!")
    router.push("/dashboard/music")
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return uploadedFiles.length > 0
      case 1:
        return trackData.title && trackData.artist && trackData.genre
      case 2:
        return distributionData.platforms.length > 0
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/music")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Music
        </Button>
        
        <h1 className="text-3xl font-bold">Upload Your Music</h1>
        <p className="text-muted-foreground mt-2">
          Share your creativity with the world
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: Upload Files */}
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Upload Your Track
              </CardTitle>
              <CardDescription>
                Upload your music files in high quality formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadZone 
                onFilesAccepted={handleFilesAccepted}
                maxFiles={1}
              />
              
              <Alert className="mt-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  For best quality, upload WAV or FLAC files. We'll automatically convert to streaming formats.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Track Details */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Track Information</CardTitle>
              <CardDescription>
                Help listeners discover your music with accurate metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Track Title *</Label>
                  <Input
                    id="title"
                    value={trackData.title}
                    onChange={(e) => setTrackData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter track title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="artist">Artist Name *</Label>
                  <Input
                    id="artist"
                    value={trackData.artist}
                    onChange={(e) => setTrackData(prev => ({ ...prev, artist: e.target.value }))}
                    placeholder="Artist or band name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="album">Album/EP Name</Label>
                  <Input
                    id="album"
                    value={trackData.album}
                    onChange={(e) => setTrackData(prev => ({ ...prev, album: e.target.value }))}
                    placeholder="Album or single name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="year">Release Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={trackData.year}
                    onChange={(e) => setTrackData(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="YYYY"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre *</Label>
                  <Select value={trackData.genre} onValueChange={(value) => setTrackData(prev => ({ ...prev, genre: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mood">Mood/Vibe</Label>
                  <Select value={trackData.mood} onValueChange={(value) => setTrackData(prev => ({ ...prev, mood: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {moods.map(mood => (
                        <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={trackData.description}
                  onChange={(e) => setTrackData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell the story behind your track..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="explicit"
                  checked={trackData.isExplicit}
                  onCheckedChange={(checked) => setTrackData(prev => ({ ...prev, isExplicit: checked as boolean }))}
                />
                <Label htmlFor="explicit" className="font-normal">
                  This track contains explicit content
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Distribution */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Distribution Settings
              </CardTitle>
              <CardDescription>
                Choose where and when to release your music
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Platform Selection */}
              <div className="space-y-4">
                <Label>Select Platforms</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {platforms.map(platform => (
                    <Card
                      key={platform.id}
                      className={cn(
                        "cursor-pointer transition-all",
                        distributionData.platforms.includes(platform.id)
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      )}
                      onClick={() => {
                        setDistributionData(prev => ({
                          ...prev,
                          platforms: prev.platforms.includes(platform.id)
                            ? prev.platforms.filter(p => p !== platform.id)
                            : [...prev.platforms, platform.id]
                        }))
                      }}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl mb-1">{platform.icon}</div>
                        <p className="text-xs font-medium">{platform.name}</p>
                        {platform.popular && (
                          <Badge variant="secondary" className="text-xs mt-1">Popular</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Release Type */}
              <div className="space-y-4">
                <Label>Release Schedule</Label>
                <RadioGroup 
                  value={distributionData.releaseType}
                  onValueChange={(value) => setDistributionData(prev => ({ ...prev, releaseType: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="immediate" id="immediate" />
                    <Label htmlFor="immediate" className="font-normal">
                      Release immediately after approval
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="scheduled" id="scheduled" />
                    <Label htmlFor="scheduled" className="font-normal">
                      Schedule for a specific date
                    </Label>
                  </div>
                </RadioGroup>
                
                {distributionData.releaseType === "scheduled" && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="releaseDate">Release Date</Label>
                    <Input
                      id="releaseDate"
                      type="date"
                      value={distributionData.releaseDate}
                      onChange={(e) => setDistributionData(prev => ({ ...prev, releaseDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <Label>Pricing Model</Label>
                <RadioGroup 
                  value={distributionData.pricing}
                  onValueChange={(value) => setDistributionData(prev => ({ ...prev, pricing: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free" id="free" />
                    <Label htmlFor="free" className="font-normal">
                      Free streaming (recommended)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="premium" id="premium" />
                    <Label htmlFor="premium" className="font-normal">
                      Premium only
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Upload</CardTitle>
                <CardDescription>
                  Make sure everything looks good before publishing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Track Info Summary */}
                <div className="space-y-4">
                  <h3 className="font-medium">Track Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Title</p>
                      <p className="font-medium">{trackData.title}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Artist</p>
                      <p className="font-medium">{trackData.artist}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Genre</p>
                      <p className="font-medium">{trackData.genre}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Files</p>
                      <p className="font-medium">{uploadedFiles.length} file(s)</p>
                    </div>
                  </div>
                </div>

                {/* Distribution Summary */}
                <div className="space-y-4">
                  <h3 className="font-medium">Distribution</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Selected Platforms</p>
                    <div className="flex flex-wrap gap-2">
                      {distributionData.platforms.map(platformId => {
                        const platform = platforms.find(p => p.id === platformId)
                        return platform ? (
                          <Badge key={platformId} variant="secondary">
                            {platform.icon} {platform.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Release Schedule</p>
                    <p className="text-sm font-medium">
                      {distributionData.releaseType === "immediate" 
                        ? "Immediate release after approval"
                        : `Scheduled for ${distributionData.releaseDate}`
                      }
                    </p>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Your track will be reviewed within 24-48 hours. You'll receive an email once it's live on all platforms.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-primary hover:opacity-90 text-white"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceed()}
              className="bg-gradient-primary hover:opacity-90 text-white"
            >
              {isSubmitting ? "Publishing..." : "Publish Track"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}