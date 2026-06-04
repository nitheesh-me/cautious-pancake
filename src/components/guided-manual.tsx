"use client"

import { Button } from "@/components/ui/button"
import { PhilosopherTable } from "./philosopher-table"
import type { Philosopher, Chopstick } from "./dining-philosophers"
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, Lightbulb } from "lucide-react"
import { useState } from "react"

interface GuidedManualProps {
  philosophers: Philosopher[]
  chopsticks: Chopstick[]
  onPhilosopherClick: (id: number) => void
  onChopstickClick: (id: number) => void
  isSimulating: boolean
  logs: string[]
  onReset: () => void
  simulationMode: "auto" | "manual"
}

interface TutorialStep {
  id: number
  title: string
  description: string
  objective: string
  hint: string
  validation: (philosophers: Philosopher[], chopsticks: Chopstick[]) => boolean
  detailedInstructions: string[]
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Understanding Process States",
    description:
      "Learn about the different states a philosopher (process) can be in during the dining philosophers problem.",
    objective: "Click on Philosopher 1 to cycle through different states",
    hint: "Each click changes the philosopher's state: Thinking → Hungry → Eating (if chopsticks available) → Thinking",
    validation: (philosophers) => philosophers[0].state !== "thinking",
    detailedInstructions: [
      "Philosophers represent processes in an operating system",
      "Thinking = Process is executing independently",
      "Hungry = Process needs resources to continue",
      "Eating = Process has acquired resources and is executing critical section",
      "Click on Philosopher 1 (the top philosopher) to change their state",
    ],
  },
  {
    id: 2,
    title: "Resource Acquisition",
    description: "Understand how processes acquire shared resources (chopsticks) to enter their critical section.",
    objective: "Make Philosopher 1 acquire both chopsticks and start eating",
    hint: "Click Philosopher 1 until they become hungry, then click them again to try picking up chopsticks",
    validation: (philosophers) => philosophers[0].state === "eating",
    detailedInstructions: [
      "Chopsticks represent shared resources (like memory, files, or CPU time)",
      "A philosopher needs both adjacent chopsticks to eat",
      "Blue chopsticks are available, red chopsticks are taken",
      "Click Philosopher 1 until they become hungry (yellow)",
      "Click again to have them pick up chopsticks and start eating (green)",
    ],
  },
  {
    id: 3,
    title: "Resource Release",
    description: "Learn how processes release resources after completing their critical section.",
    objective: "Make Philosopher 1 finish eating and release their chopsticks",
    hint: "Click on the eating philosopher to make them finish and return to thinking",
    validation: (philosophers, chopsticks) => philosophers[0].state === "thinking" && philosophers[0].eatingCount >= 1,
    detailedInstructions: [
      "After completing work, processes must release their resources",
      "This allows other processes to access the shared resources",
      "Click on Philosopher 1 (who should be eating) to finish eating",
      "Watch as they release both chopsticks and return to thinking",
      "The chopsticks turn blue again, showing they're available",
    ],
  },
  {
    id: 4,
    title: "Resource Contention",
    description: "Observe what happens when multiple processes compete for the same resources.",
    objective: "Make Philosophers 1 and 2 both try to acquire chopsticks",
    hint: "Click Philosopher 1 to make them hungry, then click Philosopher 2 to make them hungry too",
    validation: (philosophers) => philosophers[0].state === "hungry" && philosophers[1].state === "hungry",
    detailedInstructions: [
      "Resource contention occurs when multiple processes need the same resource",
      "This is a common challenge in concurrent systems",
      "Make Philosopher 1 hungry by clicking them",
      "Then make Philosopher 2 hungry by clicking them",
      "Notice how both want to acquire the shared chopstick between them",
    ],
  },
  {
    id: 5,
    title: "Understanding Deadlock",
    description: "Learn how deadlock can occur when all processes are waiting for resources held by others.",
    objective: "Create a deadlock scenario by having all philosophers hold one chopstick",
    hint: "You can manually click chopsticks to assign them to philosophers. Give each philosopher their left chopstick.",
    validation: (philosophers, chopsticks) =>
      philosophers.every((p) => p.leftChopstick !== null && p.rightChopstick === null),
    detailedInstructions: [
      "Deadlock occurs when processes are waiting indefinitely for resources",
      "Classic deadlock: each philosopher holds left chopstick, waits for right",
      "Click on each chopstick to cycle its state and assign it to adjacent philosophers",
      "Try to create a situation where each philosopher has their left chopstick",
      "This creates a circular wait condition - a classic deadlock scenario",
    ],
  },
]

export function GuidedManual({
  philosophers,
  chopsticks,
  onPhilosopherClick,
  onChopstickClick,
  isSimulating,
  logs,
  onReset,
  simulationMode,
}: GuidedManualProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const step = tutorialSteps[currentStep]
  const isStepCompleted = step.validation(philosophers, chopsticks)

  // Check if step just got completed
  if (isStepCompleted && !completedSteps.includes(step.id)) {
    setCompletedSteps([...completedSteps, step.id])
  }

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      setShowHint(false)
      onReset()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setShowHint(false)
      onReset()
    }
  }

  const handleStepSelect = (stepIndex: number) => {
    setCurrentStep(stepIndex)
    setShowHint(false)
    onReset()
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left Sidebar - Tutorial Steps */}
      <div className="lg:w-80 flex-shrink-0">
        <div className="bg-white rounded-lg border p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Guided Tutorial - Process Scheduling</h3>
            <p className="text-sm text-gray-600">
              Complete each step to learn about process synchronization and resource management.
            </p>
          </div>

          {/* Step Progress */}
          <div className="space-y-2">
            {tutorialSteps.map((s, index) => (
              <button
                key={s.id}
                onClick={() => handleStepSelect(index)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  currentStep === index
                    ? "border-blue-500 bg-blue-50"
                    : completedSteps.includes(s.id)
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-2">
                  {completedSteps.includes(s.id) ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      Step {s.id}: {s.title}
                    </div>
                    {currentStep === index && <div className="text-xs text-gray-600 mt-1">{s.description}</div>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center - Interactive Simulation */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-lg border p-6">
          {/* Current Step Details */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">
                Step {step.id}: {step.title}
              </h2>
              <span className="text-sm text-gray-500">
                {currentStep + 1} of {tutorialSteps.length}
              </span>
            </div>
            <p className="text-gray-700 mb-4">{step.description}</p>

            {/* Objective Box */}
            <div
              className={`p-4 rounded-lg border-2 ${isStepCompleted ? "border-green-500 bg-green-50" : "border-blue-500 bg-blue-50"}`}
            >
              <div className="flex items-center gap-2">
                {isStepCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
                <div>
                  <div className="font-semibold text-sm">{isStepCompleted ? "Objective Completed!" : "Objective"}</div>
                  <div className="text-sm">{step.objective}</div>
                </div>
              </div>
            </div>

            {/* Detailed Instructions */}
            <div className="mt-4 space-y-2">
              <h4 className="font-semibold text-sm">Instructions:</h4>
              <ul className="space-y-1">
                {step.detailedInstructions.map((instruction, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-gray-400">•</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hint Button */}
            {!isStepCompleted && (
              <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)} className="mt-4 gap-2">
                <Lightbulb className="w-4 h-4" />
                {showHint ? "Hide Hint" : "Show Hint"}
              </Button>
            )}

            {showHint && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900">
                  <strong>Hint:</strong> {step.hint}
                </p>
              </div>
            )}
          </div>

          {/* Interactive Simulation Area */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-center font-semibold mb-4">Interactive Simulation</h3>
            <PhilosopherTable
              philosophers={philosophers}
              chopsticks={chopsticks}
              onPhilosopherClick={onPhilosopherClick}
              onChopstickClick={onChopstickClick}
              isSimulating={isSimulating}
            />
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" onClick={onReset}>
                Reset Step
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentStep === tutorialSteps.length - 1}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Action Log */}
      <div className="lg:w-80 flex-shrink-0">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-3">Action Log</h3>
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {logs.slice(-10).map((log, index) => (
              <div key={index} className="text-xs text-gray-700 py-1 border-b border-gray-100">
                {log}
              </div>
            ))}
            {logs.length === 0 && <div className="text-xs text-gray-400">No actions yet. Start interacting!</div>}
          </div>
        </div>

        {/* Quick Reference */}
        <div className="bg-white rounded-lg border p-4 mt-4">
          <h3 className="font-semibold mb-3 text-sm">Quick Reference</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-200 border-2 border-gray-400"></div>
              <span>Thinking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-200 border-2 border-yellow-400"></div>
              <span>Hungry</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-200 border-2 border-green-400"></div>
              <span>Eating</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-6 rounded-full bg-[#3498db]"></div>
              <span>Available Chopstick</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-6 rounded-full bg-red-400"></div>
              <span>Taken Chopstick</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
