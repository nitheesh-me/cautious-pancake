"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PhilosopherTable } from "./philosopher-table"
import { SCENARIOS } from "./scenarios-data"
import type { Philosopher, Chopstick } from "./dining-philosophers"

interface GuidedScenariosProps {
  philosophers: Philosopher[]
  chopsticks: Chopstick[]
  onPhilosopherClick: (id: number) => void
  onChopstickClick: (id: number) => void
  onReset: () => void
}

const difficultyBadgeClass = (difficulty: string) =>
  ({
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  })[difficulty] ?? "bg-gray-100 text-gray-800"

export function GuidedScenarios({
  philosophers,
  chopsticks,
  onPhilosopherClick,
  onChopstickClick,
  onReset,
}: GuidedScenariosProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  if (!selectedScenario) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              <path d="M5 3v4" />
              <path d="M19 17v4" />
              <path d="M3 5h4" />
              <path d="M17 19h4" />
            </svg>
            <h2 className="text-2xl font-semibold">Guided Learning Scenarios</h2>
          </div>
          <p className="text-gray-600">
            Learn dining philosophers concepts through interactive, step-by-step guided scenarios with immediate
            feedback and hints.
          </p>
        </div>

        <div className="space-y-4">
          {SCENARIOS.map((scenario) => (
            <div key={scenario.id} className="border rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold">{scenario.title}</h3>
                  <Badge variant="secondary" className={difficultyBadgeClass(scenario.difficulty)}>
                    {scenario.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {scenario.duration}
                </div>
              </div>
              <p className="text-gray-600 mb-4">{scenario.description}</p>

              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Learning Objectives:
                </h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  {scenario.objectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{scenario.steps.length} guided steps</span>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setSelectedScenario(scenario.slug)
                    setCurrentStep(0)
                    onReset()
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <polygon points="6 3 20 12 6 21 6 3" />
                  </svg>
                  Start Guided Learning
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const scenario = SCENARIOS.find((s) => s.slug === selectedScenario)!
  const step = scenario.steps[currentStep]
  const isStepComplete = step.validation ? step.validation(philosophers) : true

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{scenario.title}</h2>
          <p className="text-sm text-gray-600">
            Step {currentStep + 1} of {scenario.steps.length}
          </p>
        </div>
        <Button variant="outline" onClick={() => setSelectedScenario(null)}>
          Back to Scenarios
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border rounded-lg p-4 bg-white">
          <PhilosopherTable
            philosophers={philosophers}
            chopsticks={chopsticks}
            onPhilosopherClick={onPhilosopherClick}
            onChopstickClick={onChopstickClick}
            isSimulating={false}
          />
        </div>

        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-2">{step.title}</h3>
            <p className="text-sm text-gray-700 mb-3">{step.description}</p>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
              <p className="font-medium text-blue-900 mb-1">Hint:</p>
              <p className="text-blue-800">{step.hint}</p>
            </div>
            {isStepComplete && step.validation && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded p-3 text-sm">
                <p className="font-medium text-green-900">Step Complete!</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                Previous
              </Button>
            )}
            {currentStep < scenario.steps.length - 1 && (
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={step.validation ? !isStepComplete : false}
              >
                Next Step
              </Button>
            )}
            {currentStep === scenario.steps.length - 1 && (
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => setSelectedScenario(null)}>
                Complete Scenario
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
