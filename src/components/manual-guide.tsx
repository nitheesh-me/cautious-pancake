"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Info,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Lightbulb,
  BookOpen,
} from "lucide-react"

const STEPS = [
  {
    title: "Understanding Process States",
    objective: "Identify all process states",
    description:
      "In Peterson's Solution, each process can be in one of four states throughout its lifetime.",
    instruction:
      "Observe the process visualisation in the Simulation tab. Each process box displays its current state via colour: gray = Inactive, blue = Active (flag set), yellow = Waiting, green = In Critical Section.",
    hint: "Look at the Legend panel in the Controls card for a quick reference of all colours and their meaning.",
    completed: false,
  },
  {
    title: "Working with Flags",
    objective: "Toggle flags correctly",
    description:
      "Each process has a boolean flag that signals its intention to enter the critical section. flag[i]=true means Process i wants access.",
    instruction:
      "Go to Simulation, click Start, select P0, then click the Flag[0] circle to toggle it to true (turns green). Notice the process state changes from Inactive to Active.",
    hint: "You must have a process selected before toggling its flag. Flags can only be changed by their owner process.",
    completed: false,
  },
  {
    title: "Understanding the Turn Variable",
    objective: "Toggle turn and observe arbitration",
    description:
      "The turn variable breaks ties when both processes want the critical section simultaneously. Only one value of turn is possible at any time: 0 or 1.",
    instruction:
      "With both flags set to true, click the turn indicator in the centre of the simulation. Watch which process gets blocked and which proceeds based on turn.",
    hint: "Peterson's key insight: setting turn = other_process gives that process priority, but only if the other process also has its flag set.",
    completed: false,
  },
  {
    title: "Entering the Critical Section",
    objective: "Complete a correct CS entry",
    description:
      "A process can enter the critical section only when the conditions !(flag[other] && turn == other) are satisfied.",
    instruction:
      "Select P0. Set flag[0]=true, toggle turn to 1 (yielding to P1), then click 'Enter CS'. Since flag[1]=false, P0 enters immediately. Observe the CS box turns green.",
    hint: "The three-step entry sequence is: (1) set own flag, (2) set turn to other, (3) wait until safe, then enter.",
    completed: false,
  },
  {
    title: "Exiting the Critical Section",
    objective: "Exit and reset flags properly",
    description:
      "When a process finishes in the critical section it must set its flag to false, freeing the other process.",
    instruction:
      "With P0 in the critical section, click 'Exit CS'. Observe flag[0] resets to false and the CS box returns to its idle state.",
    hint: "Failing to reset the flag after exit would block the other process indefinitely — this is why the exit step is mandatory.",
    completed: false,
  },
  {
    title: "Proving Mutual Exclusion",
    objective: "Verify no simultaneous CS access",
    description:
      "Peterson's Solution mathematically guarantees that no two processes are ever in the critical section at the same time.",
    instruction:
      "While P0 is in the CS, select P1, set flag[1]=true, and try to 'Enter CS'. The simulation will block P1 and show an informational message.",
    hint: "The Metrics panel tracks ME Violations. A perfect run keeps this counter at zero throughout the session.",
    completed: false,
  },
  {
    title: "Full Algorithm Walkthrough",
    objective: "Run two consecutive CS cycles",
    description:
      "Combine everything: alternate P0 and P1 through two complete enter-and-exit cycles with no errors.",
    instruction:
      "P0 enters → P0 exits → P1 enters → P1 exits. Monitor the Action Log and confirm zero ME Violations and zero Wrong Moves in the Metrics panel.",
    hint: "You can use Reset at any time to start fresh. Review the Action Log to trace every step.",
    completed: false,
  },
]

export function ManualGuide() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [showHint, setShowHint] = useState(false)

  const markComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep])
    }
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1)
      setShowHint(false)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
      setShowHint(false)
    }
  }

  const reset = () => {
    setIsActive(false)
    setCurrentStep(0)
    setCompletedSteps([])
    setShowHint(false)
  }

  if (!isActive) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 flex-shrink-0" />
          <h2 className="text-base sm:text-lg font-bold">Guided Tutorial — Process Scheduling</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 cursor-help flex-shrink-0" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Interactive step-by-step tutorial for understanding Peterson&apos;s Solution</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">Interactive Tutorial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Learn the fundamentals of Peterson&apos;s Solution through an interactive, step-by-step
              guided tutorial covering all aspects of the algorithm.
            </p>

            <div>
              <h3 className="text-xs sm:text-sm font-semibold mb-2">What You&apos;ll Learn:</h3>
              <ul className="space-y-1">
                {STEPS.map((step, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5 flex-shrink-0">•</span>
                    {step.title}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                {STEPS.length} guided steps
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                ~10 minutes
              </span>
            </div>

            <Button
              onClick={() => setIsActive(true)}
              className="gap-1 text-xs sm:text-sm"
            >
              <ChevronRight className="h-4 w-4" />
              Start Interactive Tutorial
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const step = STEPS[currentStep]
  const isStepDone = completedSteps.includes(currentStep)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 flex-shrink-0" />
          <h2 className="text-base sm:text-lg font-bold">Guided Tutorial</h2>
        </div>
        <Button variant="outline" size="sm" onClick={reset} className="text-xs gap-1">
          Go Back
        </Button>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
          Step {currentStep + 1} of {STEPS.length}
        </span>
        <Progress value={((currentStep + 1) / STEPS.length) * 100} className="flex-1 h-2" />
        <span className="text-xs sm:text-sm font-mono text-muted-foreground whitespace-nowrap">
          {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
        </span>
      </div>

      {/* Step card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">{step.objective}</Badge>
            {isStepDone && <CheckCircle className="h-4 w-4 text-green-600" />}
          </div>
          <CardTitle className="text-sm sm:text-base">{step.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs sm:text-sm text-muted-foreground">{step.description}</p>

          {/* Instruction box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-blue-800">{step.instruction}</p>
            </div>
          </div>

          {/* Hint toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHint((h) => !h)}
            className="text-xs gap-1"
          >
            <Lightbulb className="h-3 w-3 text-amber-500" />
            {showHint ? "Hide Hint" : "Show Hint"}
          </Button>
          {showHint && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-amber-800">{step.hint}</p>
              </div>
            </div>
          )}

          {currentStep === STEPS.length - 1 && isStepDone && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs sm:text-sm font-semibold text-green-900 mb-1">
                Tutorial complete!
              </p>
              <p className="text-xs text-green-800">
                You now understand Peterson&apos;s Solution. Try the Guided Scenarios or Evaluation tabs to test your knowledge.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="gap-1 text-xs sm:text-sm"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          Previous
        </Button>
        <Button
          size="sm"
          onClick={markComplete}
          disabled={isStepDone}
          className="gap-1 text-xs"
        >
          <CheckCircle className="h-3 w-3" />
          Mark Complete
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={nextStep}
          disabled={currentStep === STEPS.length - 1}
          className="gap-1 text-xs sm:text-sm"
        >
          Next
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  )
}
