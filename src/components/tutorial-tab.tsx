"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, BookOpen, Target, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ManualSimulator, Process } from "@/components/manual-simulator"

const TUTORIAL_STEPS = [
  {
    title: "Step 1: Understanding the System Setup",
    description: "Learn about the initial configuration of the Banker's Algorithm simulator.",
    instructions: {
      text: "The Setup tab allows you to configure the system. You can set available resources (R0, R1, R2) and define each process's maximum resource needs and current allocations.",
      color: "blue",
    },
    objective: {
      text: "Understand how processes, resources, and allocations are structured in the Banker's Algorithm.",
      color: "green",
    },
    hint: {
      text: "Look at the default configuration: 5 processes (P0-P4), 3 resource types (R0-R2), and available resources [3, 3, 2]. The 'Need' column is automatically calculated as Max - Allocation.",
      color: "amber",
    },
  },
  {
    title: "Step 2: Understanding Resource Need Calculation",
    description: "Learn how the Need matrix is derived from Max and Allocation.",
    instructions: {
      text: "The Need for a process is calculated as: Need = Max - Allocation. This represents how many more resources a process might still request.",
      color: "blue",
    },
    objective: {
      text: "Understand the relationship between Max, Allocation, and Need values.",
      color: "green",
    },
    hint: {
      text: "For P1: Max = [3, 2, 2], Allocation = [2, 0, 0], so Need = [1, 2, 2]. Notice that P1 needs 1 more unit of R0, 2 of R1, and 2 of R2.",
      color: "amber",
    },
  },
  {
    title: "Step 3: Running the Safety Algorithm",
    description: "Learn how the Banker's Algorithm determines if a system is in a safe state.",
    instructions: {
      text: "Click 'Check System State' to run the safety algorithm. Watch the Action Log to see which processes can complete and how resources flow.",
      color: "blue",
    },
    objective: {
      text: "Run the safety check and understand the algorithm's decision-making process.",
      color: "green",
    },
    hint: {
      text: "The algorithm finds a process whose Need can be satisfied by Available resources. When that process finishes, it releases its Allocation, potentially allowing more processes to complete.",
      color: "amber",
    },
  },
  {
    title: "Step 4: Understanding the Safe Sequence",
    description: "Learn why the system generates a specific safe sequence.",
    instructions: {
      text: "Look at the Safe Sequence shown after running the safety algorithm. This sequence guarantees that all processes can complete without deadlock.",
      color: "blue",
    },
    objective: {
      text: "Understand why processes are ordered in the safe sequence and why it matters.",
      color: "green",
    },
    hint: {
      text: "If the sequence shows P1 → P0 → P2, it means P1 can complete first with current Available resources. After P1 finishes, P0's Need becomes satisfiable with the released resources.",
      color: "amber",
    },
  },
  {
    title: "Step 5: Running the Simulation",
    description: "Watch the algorithm execute processes step-by-step.",
    instructions: {
      text: "Click 'Simulate' to watch each process execute in the safe sequence. Observe as resources are released and the simulation progresses.",
      color: "blue",
    },
    objective: {
      text: "See the Banker's Algorithm in action as processes execute and release resources.",
      color: "green",
    },
    hint: {
      text: "Use the Simulation Speed slider to control how fast processes execute. Slower speeds help you see exactly what's happening at each step.",
      color: "amber",
    },
  },
]

const defaultProcesses: Process[] = [
  {
    id: "P0",
    allocation: [0, 1, 0],
    max: [7, 5, 3],
    need: [7, 4, 3],
  },
  {
    id: "P1",
    allocation: [2, 0, 0],
    max: [3, 2, 2],
    need: [1, 2, 2],
  },
  {
    id: "P2",
    allocation: [3, 0, 2],
    max: [9, 0, 2],
    need: [6, 0, 0],
  },
  {
    id: "P3",
    allocation: [2, 1, 1],
    max: [1, 6, 5],
    need: [0, 6, 3],
  },
  {
    id: "P4",
    allocation: [0, 0, 2],
    max: [4, 3, 3],
    need: [4, 3, 1],
  },
]

export default function TutorialTab() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const currentStep = TUTORIAL_STEPS[currentStepIndex]
  const progress = ((currentStepIndex + 1) / TUTORIAL_STEPS.length) * 100

  return (
    <div className="space-y-4">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Step Instructions */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-4 sticky top-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">{currentStep.title}</h2>
              <p className="text-sm text-gray-600">{currentStep.description}</p>
            </div>

            {/* Instructions Box */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <div className="flex items-start gap-2">
                <BookOpen className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Instructions</h4>
                  <p className="text-xs text-blue-800">{currentStep.instructions.text}</p>
                </div>
              </div>
            </div>

            {/* Objective Box */}
            <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-green-900 mb-1">Objective</h4>
                  <p className="text-xs text-green-800">{currentStep.objective.text}</p>
                </div>
              </div>
            </div>

            {/* Hint Box */}
            <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-amber-900 mb-1">Hint</h4>
                  <p className="text-xs text-amber-800">{currentStep.hint.text}</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium">Progress</span>
                <span className="text-xs text-gray-500">
                  {currentStepIndex + 1} / {TUTORIAL_STEPS.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#3498db] h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                disabled={currentStepIndex === 0}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                onClick={() => setCurrentStepIndex(Math.min(TUTORIAL_STEPS.length - 1, currentStepIndex + 1))}
                disabled={currentStepIndex === TUTORIAL_STEPS.length - 1}
                size="sm"
                className="flex-1 bg-[#3498db] hover:bg-[#2980b9]"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Simulation */}
        <div className="lg:col-span-2">
          <ManualSimulator initialAvailable={[3, 3, 2]} initialProcesses={defaultProcesses} resourceTypes={3} />
        </div>
      </div>
    </div>
  )
}
