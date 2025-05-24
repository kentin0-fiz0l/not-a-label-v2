"use client"

import React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  title: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps.map((step, index) => (
            <li key={step.title} className={cn("relative", index !== steps.length - 1 && "pr-8 sm:pr-20")}>
              {index !== steps.length - 1 ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className={cn(
                      "h-0.5 w-full",
                      index < currentStep ? "bg-gradient-to-r from-purple-500 to-blue-500" : "bg-gray-200"
                    )} />
                  </div>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white">
                    {index < currentStep ? (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    ) : index === currentStep ? (
                      <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                    )}
                  </div>
                </>
              ) : (
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white">
                  {index < currentStep ? (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  ) : index === currentStep ? (
                    <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
                  ) : (
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                  )}
                </div>
              )}
              <span className="ml-4 text-sm font-medium text-gray-900">
                {step.title}
              </span>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}