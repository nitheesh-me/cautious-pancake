"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  CheckCircle,
  Clock,
  Users,
  Target,
  ArrowRight,
  ArrowLeft,
  PartyPopper,
  Info,
  Lightbulb,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PetersonsSolution } from "@/components/petersons-simulation"

const GUIDED_SCENARIOS = [
  {
    id: "scenario-mutual",
    title: "Mutual Exclusion",
    description: "Ensure two processes never access the critical section simultaneously",
    difficulty: "beginner",
    timeLimit: 300,
    objectives: ["Prevent concurrent critical section access", "Both processes must get a turn"],
    steps: [
      {
        id: "mutual-1",
        title: "Start Both Processes",
        instruction: "Start the simulation. Both processes should initialize their state.",
        hint: "Click the Start button to begin the simulation.",
      },
      {
        id: "mutual-2",
        title: "Process 0 Enters Critical Section",
        instruction: "Arrange the state so P0 enters the critical section first.",
        hint: "Use the Controls to set flags and observe the Visualizer.",
      },
      {
        id: "mutual-3",
        title: "Process 1 Must Wait",
        instruction: "While P0 is in the CS, P1 should be blocked from entering.",
        hint: "Check the state display to verify mutual exclusion.",
      },
    ],
  },
  {
    id: "scenario-flags",
    title: "Process Flags Basics",
    description: "Understand how the interest flags signal a process's intent to enter the critical section",
    difficulty: "beginner",
    timeLimit: 300,
    objectives: ["Set flag[i] = true correctly", "Understand intent signaling", "Clear flags on exit"],
    steps: [
      {
        id: "flags-1",
        title: "Raise Process 0's Flag",
        instruction: "Set flag[0] to true to signal that Process 0 wants to enter the critical section.",
        hint: "The flag indicates a process's intent to enter the CS.",
      },
      {
        id: "flags-2",
        title: "Observe the Effect",
        instruction: "Watch how raising the flag affects the algorithm's decision logic.",
        hint: "The flag combined with the turn variable controls entry.",
      },
      {
        id: "flags-3",
        title: "Clear the Flag on Exit",
        instruction: "After P0 leaves the CS, set flag[0] back to false.",
        hint: "Clearing the flag lets the other process proceed.",
      },
    ],
  },
  {
    id: "scenario-turn",
    title: "Turn Variable Management",
    description: "Master the turn variable to coordinate process access",
    difficulty: "intermediate",
    timeLimit: 420,
    objectives: ["Use turn variable correctly", "Prevent deadlock", "Allow process alternation"],
    steps: [
      {
        id: "turn-1",
        title: "Set Turn to 0",
        instruction: "Initialize the turn variable to 0, giving priority to Process 0.",
        hint: "The turn variable determines which process has priority when both want the CS.",
      },
      {
        id: "turn-2",
        title: "Both Processes Want the CS",
        instruction: "Set both processes' flags to true simultaneously.",
        hint: "Observe how the turn variable prevents both from entering at once.",
      },
      {
        id: "turn-3",
        title: "Switch Turns",
        instruction: "After P0 exits, switch turn to 1 to give P1 a chance.",
        hint: "This ensures fairness—processes take turns entering the CS.",
      },
    ],
  },
  {
    id: "scenario-fairness",
    title: "Fairness and Progress",
    description: "Verify neither process starves and both make progress through the algorithm",
    difficulty: "intermediate",
    timeLimit: 420,
    objectives: ["Ensure progress", "Both processes get turns", "No starvation"],
    steps: [
      {
        id: "fairness-1",
        title: "Create Competing Requests",
        instruction: "Make both processes request the critical section repeatedly.",
        hint: "Alternate raising each process's flag to simulate competition.",
      },
      {
        id: "fairness-2",
        title: "Verify Alternation",
        instruction: "Confirm that the processes alternate access and neither is locked out.",
        hint: "The turn variable forces a process to yield after its turn.",
      },
      {
        id: "fairness-3",
        title: "Confirm No Starvation",
        instruction: "Ensure both processes have entered the CS a similar number of times.",
        hint: "Check the Metrics panel for balanced critical section entries.",
      },
    ],
  },
  {
    id: "scenario-deadlock",
    title: "Deadlock Prevention",
    description: "Verify Peterson's algorithm prevents deadlock and starvation",
    difficulty: "advanced",
    timeLimit: 540,
    objectives: ["Prevent deadlock", "Ensure progress", "Both processes must eventually enter CS"],
    steps: [
      {
        id: "deadlock-1",
        title: "Intense Competition",
        instruction: "Create a scenario where both processes repeatedly want the CS.",
        hint: "Use the simulation to stress-test the algorithm.",
      },
      {
        id: "deadlock-2",
        title: "Verify No Deadlock",
        instruction: "Confirm that at least one process always makes progress.",
        hint: "Check the Metrics for terminated processes.",
      },
      {
        id: "deadlock-3",
        title: "Complete the Cycle",
        instruction: "Ensure both processes have entered the CS multiple times.",
        hint: "The algorithm must guarantee both processes get turns.",
      },
    ],
  },
  {
    id: "scenario-stress",
    title: "Complex Stress Scenarios",
    description: "Handle rapid state changes, edge cases, and maintain correctness under stress",
    difficulty: "advanced",
    timeLimit: 540,
    objectives: ["Handle edge cases", "Maintain correctness under stress", "Optimize resource usage"],
    steps: [
      {
        id: "stress-1",
        title: "Rapid State Changes",
        instruction: "Rapidly toggle flags and turn values to stress the algorithm.",
        hint: "Quick changes test the robustness of the mutual exclusion guarantee.",
      },
      {
        id: "stress-2",
        title: "Handle Edge Cases",
        instruction: "Create simultaneous requests with conflicting turn values.",
        hint: "Peterson's algorithm must still guarantee correctness.",
      },
      {
        id: "stress-3",
        title: "Verify Correctness",
        instruction: "Confirm that no mutual exclusion violations occurred during the stress test.",
        hint: "Review the action log for any violation warnings.",
      },
    ],
  },
]

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "beginner":
      return "bg-green-100 text-green-800 border-green-200"
    case "intermediate":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "advanced":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

interface GuidedScenariosProps {
  persistedCompletedScenarios?: string[]
  onCompletedScenariosChange?: (ids: string[]) => void
}

export function GuidedScenarios({
  persistedCompletedScenarios = [],
  onCompletedScenariosChange,
}: GuidedScenariosProps) {
  const [selectedScenario, setSelectedScenario] = useState<(typeof GUIDED_SCENARIOS)[0] | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)
  const [completedScenarios, setCompletedScenarios] = useState<string[]>(persistedCompletedScenarios)
  const [showHint, setShowHint] = useState(false)
  const latestSimState = useRef<any>(null)

  const handleStartScenario = (scenario: (typeof GUIDED_SCENARIOS)[0]) => {
    setSelectedScenario(scenario)
    setCurrentStepIndex(0)
    setShowCompletion(false)
    setShowHint(false)
  }

  const handleCompleteStep = () => {
    if (currentStepIndex < selectedScenario!.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
      setShowHint(false)
    } else {
      // Scenario complete
      if (!completedScenarios.includes(selectedScenario!.id)) {
        const updated = [...completedScenarios, selectedScenario!.id]
        setCompletedScenarios(updated)
        onCompletedScenariosChange?.(updated)
      }
      setShowCompletion(true)
    }
  }

  const handleGoBack = () => {
    setSelectedScenario(null)
    setCurrentStepIndex(0)
    setShowCompletion(false)
    setShowHint(false)
  }

  // VIEW A: Scenario Selection (Card Grid)
  if (!selectedScenario) {
    return (
      <TooltipProvider>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Guided Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Learn Peterson's Solution through guided step-by-step scenarios with embedded simulation.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {GUIDED_SCENARIOS.map((scenario) => {
              const isCompleted = completedScenarios.includes(scenario.id)
              return (
                <Card key={scenario.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="flex items-center gap-2 mb-2">
                          {scenario.title}
                          {isCompleted && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge className={`text-xs border ${getDifficultyColor(scenario.difficulty)}`}>
                            {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1 text-xs">
                            <Clock className="h-3 w-3" />
                            {Math.ceil(scenario.timeLimit / 60)} min
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1 text-xs">
                            <ArrowRight className="h-3 w-3" />
                            {scenario.steps.length} steps
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Objectives:</p>
                          <ul className="text-xs space-y-1">
                            {scenario.objectives.map((obj, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleStartScenario(scenario)}
                      className="w-full bg-green-600 hover:bg-green-700 text-sm"
                    >
                      Start Guided Learning
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // VIEW C: Completion Screen
  if (showCompletion) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-md border-green-200 bg-green-50">
          <CardContent className="pt-8 text-center">
            <PartyPopper className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold mb-2">Scenario Complete!</h2>
            <p className="text-muted-foreground mb-6">You&apos;ve successfully completed: {selectedScenario!.title}</p>
            <div className="flex gap-2">
              <Button onClick={handleGoBack} variant="outline" className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleGoBack} className="flex-1 bg-green-600 hover:bg-green-700">
                Next Scenario
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // VIEW B: Active Scenario with Steps and Simulation Below
  const currentStep = selectedScenario.steps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / selectedScenario.steps.length) * 100

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Scenario Header Card */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5" />
                  {selectedScenario.title}
                </CardTitle>
                <p className="text-muted-foreground text-sm">{selectedScenario.description}</p>
                <Progress value={progress} className="mt-4 h-2" />
                <div className="text-xs text-muted-foreground mt-2">
                  Step {currentStepIndex + 1} of {selectedScenario.steps.length}
                </div>
              </div>
              <Button onClick={handleGoBack} variant="outline" size="sm" className="flex-shrink-0">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Go Back
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Step Instructions Card */}
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              {currentStep.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">{currentStep.instruction}</AlertDescription>
            </Alert>

            {showHint && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 text-sm">{currentStep.hint}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCompleteStep}
                className="flex-1 bg-green-600 hover:bg-green-700 text-sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Check &amp; Complete Step
              </Button>
              <Button onClick={() => setShowHint(!showHint)} variant="outline" className="text-sm">
                <Lightbulb className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FULL LIVE SIMULATION — rendered as sibling below step card */}
        <PetersonsSolution
          onStateChange={(state) => {
            latestSimState.current = state
          }}
        />
      </div>
    </TooltipProvider>
  )
}
