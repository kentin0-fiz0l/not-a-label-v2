import { Stepper } from "@/components/ui/stepper"

const steps = [
  { title: "Welcome", description: "Get started with Not a Label" },
  { title: "Profile", description: "Tell us about yourself" },
  { title: "Goals", description: "Set your music career goals" },
  { title: "Complete", description: "You're all set!" }
]

export default function OnboardingLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { step?: string }
}) {
  const currentStep = params?.step ? parseInt(params.step) - 1 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold gradient-text mb-2">Welcome to Not a Label</h1>
          <p className="text-muted-foreground">Let's get you set up in just a few steps</p>
        </div>

        {/* Stepper */}
        <div className="mb-12 max-w-2xl mx-auto">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
}