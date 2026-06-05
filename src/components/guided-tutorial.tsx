"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, CheckCircle, Info, Target, Lightbulb } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PetersonsSolution } from "@/components/petersons-simulation"

const TUTORIAL_STEPS = [
  {
    id: 1,
    title: "Understanding Peterson's Solution",
    description: "Learn the foundational concepts: mutual exclusion, progress, and bounded waiting.",
    instruction: "Observe the simulation layout. Two processes (P0 and P1) compete for a critical section. The algorithm uses flag[0], flag[1] (intent signals) and turn (priority variable). Read the Legend in the Controls panel to understand each state color: gray=Inactive, blue=Active, yellow=Waiting, green=Critical Section.",
    objective: "Identify the two processes, both flag variables, and the turn variable in the simulation visualizer.",
    hint: "The Controls panel on the left shows the Legend. The visualizer (green-bordered card) shows P0, P1, flag[0], flag[1], and turn indicators.",
    completed: false,
    interactive: false,
  },
  {
    id: 2,
    title: "Starting the Simulation",
    description: "The simulation must be running before processes can be interacted with.",
    instruction: "Click the 'Start' button at the top of the Controls panel. The simulation status will change to Running.",
    objective: "Successfully start the simulation.",
    hint: "The Start button is the first button in the Controls card on the left.",
    completed: false,
    interactive: false,
  },
  {
    id: 3,
    title: "Selecting a Process",
    description: "Learn how to select a process to interact with its algorithm variables.",
    instruction: "Click on the Process 0 box in the visualizer. A blue ring will appear around it. The Controls panel will show action buttons for the selected process.",
    objective: "Select Process 0 by clicking on its box in the visualizer.",
    hint: "Process boxes labeled 'P0' and 'P1' are in the green-bordered visualizer card. Click directly on the colored P0 box.",
    completed: false,
    interactive: false,
  },
  {
    id: 4,
    title: "Setting flag[0] = true",
    description: "The first step of Peterson's algorithm: signal that a process wants to enter the critical section.",
    instruction: "With Process 0 selected, click 'Toggle flag[0]' in the process actions panel inside Controls. The flag[0] indicator in the visualizer should turn green (true).",
    objective: "Set flag[0] to true — signaling P0's intent to enter the critical section.",
    hint: "After selecting P0, a process actions panel appears inside the Controls card. Click 'Toggle flag[0]' to change it from false (gray) to true (green).",
    completed: false,
    interactive: false,
  },
  {
    id: 5,
    title: "Setting the turn Variable",
    description: "The turn variable gives priority to the OTHER process — this prevents deadlock.",
    instruction: "With Process 0 selected, click 'Set turn' to set turn=1. This yields priority to P1. Peterson's key rule: always set turn to the OTHER process's index.",
    objective: "Set turn=1 to yield priority to Process 1.",
    hint: "The 'Set turn' button toggles turn between 0 and 1. After clicking, the turn indicator should show 1.",
    completed: false,
    interactive: false,
  },
  {
    id: 6,
    title: "The Entry Condition",
    description: "Peterson's entry condition: enter CS only if (other flag is false) OR (turn favors self).",
    instruction: "Observe: flag[0]=true, flag[1]=false, turn=1. P0's entry condition is: !(flag[1] && turn==1). Since flag[1]=false, P0 can enter regardless of turn. This is the mathematical guarantee of Peterson's algorithm.",
    objective: "Understand the entry condition: !(flag[other] && turn==other).",
    hint: "When flag[1]=false, the condition !(false && turn==1) = !(false) = true. P0 can always enter when P1 hasn't declared interest.",
    completed: false,
    interactive: false,
  },
  {
    id: 7,
    title: "Mutual Exclusion in Action",
    description: "While P0 is in the critical section, P1 cannot enter — this is mutual exclusion.",
    instruction: "Now select Process 1. Set flag[1]=true and turn=0 (yielding to P0). Try to enter CS with P1. The system will block P1 because P0 is in CS. Only one process can be in CS simultaneously.",
    objective: "Demonstrate that P1 cannot enter CS while P0 is inside.",
    hint: "With P0 in CS (flag[0]=true), P1's entry condition !(flag[0] && turn==0) = !(true && true) = false when turn=0. P1 must wait.",
    completed: false,
    interactive: false,
  },
  {
    id: 8,
    title: "Exiting the Critical Section",
    description: "Proper exit resets the flag to false, immediately unblocking the waiting process.",
    instruction: "Select P0 and toggle flag[0] back to false. This is the exit protocol — it signals P0 is done. P1 can now detect that flag[0]=false and proceed to enter CS.",
    objective: "Exit the critical section by resetting flag[0]=false.",
    hint: "Exiting is simply setting flag[0]=false. This is the complete exit protocol — no other steps needed. P1 will be immediately unblocked.",
    completed: false,
    interactive: false,
  },
  {
    id: 9,
    title: "Reviewing Metrics and Full Cycle",
    description: "The Metrics panel tracks CS entries, ME violations, and wrong moves for learning analysis.",
    instruction: "Review the Metrics & Log card on the right. CS Entries = successful critical section entries. ME Violations MUST always be 0 — any value above 0 means two processes entered CS simultaneously (a correctness bug). Now complete a full cycle for P1: set flag[1]=true, turn=0, verify P1 can enter, then exit with flag[1]=false.",
    objective: "Complete a full enter/exit cycle for P1 and confirm ME Violations = 0 throughout.",
    hint: "The full Peterson's sequence: (1) flag=true (2) turn=other (3) wait if other wants CS AND turn=other (4) enter CS (5) exit: flag=false. ME Violations=0 proves mutual exclusion.",
    completed: false,
    interactive: false,
  },
]

type TutorialStep = typeof TUTORIAL_STEPS[0]

export function GuidedTutorial() {
  const [steps, setSteps] = useState<TutorialStep[]>(TUTORIAL_STEPS)
  const [currentStep, setCurrentStep] = useState(0)
  const [tutorialAlert, setTutorialAlert] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null)
  const engineRef = useRef<any>(null)

  const showTutorialAlert = useCallback((message: string, type: "info" | "success" | "error" = "info") => {
    setTutorialAlert({ message, type })
    setTimeout(() => setTutorialAlert(null), 4000)
  }, [])

  const handleStepComplete = () => {
    setSteps((prev) => prev.map((s) => s.id === steps[currentStep].id ? { ...s, completed: true } : s))
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      showTutorialAlert("Congratulations! You have completed the guided tutorial for Peterson's Solution!", "success")
    }
  }

  const handlePrevious = () => { if (currentStep > 0) setCurrentStep(currentStep - 1) }

  const handleNext = () => {
    if (currentStep < steps.length - 1 && steps[currentStep].completed) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSkipToStep = (index: number) => {
    const canNavigate = index <= currentStep || steps.slice(0, index).every((s) => s.completed)
    if (canNavigate) setCurrentStep(index)
  }

  const resetTutorial = () => {
    setSteps(TUTORIAL_STEPS)
    setCurrentStep(0)
    setTutorialAlert(null)
  }

  const currentStepData = steps[currentStep]
  const completedCount = steps.filter((s) => s.completed).length
  const progressPercentage = (completedCount / steps.length) * 100

  return (
    <TooltipProvider>
      <div className="space-y-6">

        {/* ── ROW 1: Progress Header Card ─────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Guided Tutorial - Peterson&apos;s Solution</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">{completedCount}/{steps.length} Complete</span>
                <Button onClick={resetTutorial} variant="outline" size="sm">Reset Tutorial</Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progressPercentage} className="w-full" />

              {/* Step dot navigation */}
              <div className="flex flex-wrap gap-2">
                {steps.map((step, index) => {
                  const canNavigate = index <= currentStep || steps.slice(0, index).every((s) => s.completed)
                  return (
                    <Tooltip key={step.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleSkipToStep(index)}
                          disabled={!canNavigate}
                          className={`w-8 h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                            step.completed
                              ? "bg-green-500 text-white"
                              : index === currentStep
                                ? "bg-blue-500 text-white"
                                : canNavigate
                                  ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                          }`}
                        >
                          {step.completed ? <CheckCircle className="h-4 w-4" /> : step.id}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{step.title}{!canNavigate ? " (complete previous steps first)" : ""}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>

              <div className="text-sm text-muted-foreground">
                Progress: {Math.round(progressPercentage)}% | Step {currentStep + 1} of {steps.length}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── ROW 2: Step Instructions (25%) | Live Simulation (75%) ──────── */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* LEFT: Step instructions — xl:col-span-1, standard Card (no special border) */}
          <Card className="xl:col-span-1">
            <div className="relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Step {currentStep + 1}: {currentStepData.title}
                  {currentStepData.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                </CardTitle>
              </CardHeader>
              <p className="text-muted-foreground px-6 pb-2 text-sm">{currentStepData.description}</p>

              {/* Tutorial alert — overlays header area, uses Info icon (NOT AlertCircle), border-*-300 */}
              {tutorialAlert && (
                <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
                  <Alert className={`w-full shadow-lg ${
                    tutorialAlert.type === "error" ? "border-red-300 bg-red-50"
                    : tutorialAlert.type === "success" ? "border-green-300 bg-green-50"
                    : "border-blue-300 bg-blue-50"
                  }`}>
                    <Info className={`h-4 w-4 ${
                      tutorialAlert.type === "error" ? "text-red-600"
                      : tutorialAlert.type === "success" ? "text-green-600"
                      : "text-blue-600"
                    }`} />
                    <AlertDescription className={`text-sm font-semibold ${
                      tutorialAlert.type === "error" ? "text-red-800"
                      : tutorialAlert.type === "success" ? "text-green-800"
                      : "text-blue-800"
                    }`}>
                      {tutorialAlert.message}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>

            <CardContent className="space-y-4 pt-0">
              {/* Objective — bg-blue-50 border-blue-200, Target icon */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Objective:
                </h4>
                <p className="text-blue-800 text-sm">{currentStepData.objective}</p>
              </div>

              {/* Instructions — bg-green-50 border-green-200, Info icon */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Instructions:
                </h4>
                <p className="text-green-800 text-sm">{currentStepData.instruction}</p>
              </div>

              {/* Hint — bg-yellow-50 border-yellow-200, Lightbulb icon (only if hint exists) */}
              {currentStepData.hint && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Hint:
                  </h4>
                  <p className="text-yellow-800 text-sm">{currentStepData.hint}</p>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4">
                {/* Button row 1 (full width): Mark Complete (blue) for all steps */}
                <Button onClick={handleStepComplete} className="w-full bg-blue-600 hover:bg-blue-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>

                {/* Button row 2: Previous + Next (flex) */}
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex-1 flex items-center justify-center gap-1 bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  {/* Next is disabled until current step is marked complete */}
                  <Button
                    onClick={handleNext}
                    disabled={currentStep === steps.length - 1 || !currentStepData.completed}
                    className="flex-1 flex items-center justify-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: Full live simulation — xl:col-span-3 */}
          <div className="xl:col-span-3">
            <PetersonsSolution
              onEngineReady={(engine) => { engineRef.current = engine }}
            />
          </div>

        </div>
      </div>
    </TooltipProvider>
  )
}
