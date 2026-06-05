# OS Virtual Labs — Definitive Rebuild Prompt v4
## Reference: Process Life Cycle Management (PLM)
## Target: Peterson's Solution (and all future labs)

---

## WHAT THIS PROMPT FIXES (issues found after previous prompt)

1. **Evaluation sub-tabs appeared only after clicking "Start Evaluation"** — they must be visible immediately when the Evaluation tab loads, exactly as in PLM
2. **Evaluation sub-tab CSS was different from PLM** — the sub-tab bar uses `title=` attribute on triggers, NOT the `bg-white text-black border border-blue-200 shadow-sm` active class override that the main tabs use
3. **Tutorial had a duplicate "Steps" section** — the progress card and the step detail card are the ONLY two sections; there is NO separate list of step titles
4. **Cards/buttons/borders different from PLM** — every class string is specified exactly below
5. **Scoring gave 100/100 for doing nothing** — fixed with the zero-effort gate in `ScenarioEngine`
6. **Results and Analytics content different from PLM** — full JSX specified below

---

## PART 1 — `app/globals.css` — COPY VERBATIM (do not change a single character)

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
  --os-primary-blue: oklch(0.6 0.15 240);
  --os-primary-green: oklch(0.7 0.15 140);
  --os-accent-blue: oklch(0.8 0.1 220);
  --os-success-green: oklch(0.65 0.15 130);
  --os-warning-yellow: oklch(0.8 0.15 80);
  --os-error-red: oklch(0.6 0.2 20);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.145 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.269 0 0);
  --sidebar-ring: oklch(0.439 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}

.process-card { transition: all 0.2s ease-in-out; }
.process-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.simulation-border { border: 2px solid var(--os-primary-green); border-radius: 8px; }
.alert-error { background-color: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: rgb(153,27,27); }
.legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
.process-state-ready { background-color: var(--os-primary-blue); }
.process-state-running { background-color: var(--os-success-green); }
.process-state-io { background-color: var(--os-warning-yellow); }
.process-state-terminated { background-color: rgb(107,114,128); }
```

---

## PART 2 — MAIN TAB BAR CSS RULES (page.tsx)

The four main tabs (Simulation, Tutorial, Scenarios, Evaluation) use this exact CSS:

```tsx
/* TabsList — outer container */
<TabsList className="grid w-full grid-cols-4 mb-4 sm:mb-6 h-auto">

/* Each TabsTrigger — active state: bg-white text-black border border-blue-200 shadow-sm */
/* Each TabsTrigger — inactive: hover:bg-gray-50 */
<TabsTrigger
  value="simulation"
  className={`text-xs sm:text-sm px-1 sm:px-3 py-2 break-words transition-colors ${
    currentTab === "simulation"
      ? "bg-white text-black border border-blue-200 shadow-sm"
      : "hover:bg-gray-50"
  }`}
>
  <span className="hidden sm:inline">Simulation</span>
  <span className="sm:hidden">Sim</span>
</TabsTrigger>
```

Tab values and labels:
- `"simulation"` — full: "Simulation" / mobile: "Sim"
- `"manual"` — full: "Tutorial" / mobile: "Guide"
- `"guided-scenarios"` — full: "Scenarios" / mobile: "Guided"
- `"evaluation"` — full: "Evaluation" / mobile: "Eval"

Tab content mounting (forceMount + CSS hidden — no remount on tab switch):
```tsx
<TabsContent value="simulation" className="mt-0 outline-none focus-visible:ring-0" forceMount>
  <div className={currentTab !== "simulation" ? "hidden" : ""}>
    <PetersonsSolution />
  </div>
</TabsContent>
```

---

## PART 3 — EVALUATION SUB-TAB BAR CSS RULES

**CRITICAL — THIS IS DIFFERENT FROM THE MAIN TAB BAR.**

The three sub-tabs inside Evaluation (Scenarios / Results / Analytics) use the PLM pattern — NO custom active className override. They use the shadcn default active state. Each trigger uses `title=` attribute for tooltip, NOT a `<Tooltip>` wrapper.

```tsx
/* Sub-tab TabsList — same grid structure, NO mb class */
<TabsList className="grid w-full grid-cols-3 h-auto">

/* Each sub-tab trigger — NO className override for active state */
/* Uses shadcn default active/inactive rendering */
/* Uses title= attribute for browser tooltip, NOT <Tooltip> wrapper */
<TabsTrigger
  value="scenarios"
  title="Select and start evaluation scenarios"
  className="text-xs sm:text-sm px-2 py-2 sm:px-3"
>
  <span className="hidden sm:inline">Scenarios</span>
  <span className="sm:hidden">Tests</span>
</TabsTrigger>

<TabsTrigger
  value="results"
  title="View completed scenario results and performance analysis"
  className="text-xs sm:text-sm px-2 py-2 sm:px-3"
>
  Results
</TabsTrigger>

<TabsTrigger
  value="analytics"
  title="Detailed learning analytics and progress tracking"
  className="text-xs sm:text-sm px-2 py-2 sm:px-3"
>
  Analytics
</TabsTrigger>
```

The sub-tabs are visible IMMEDIATELY when the Evaluation tab loads. They are NOT hidden behind a "Start Evaluation" button.

---

## PART 4 — `components/guided-tutorial.tsx` — COMPLETE FILE

The Tutorial tab has exactly TWO sections:
1. A progress header Card (progress bar + step dots + progress text)
2. A two-column grid: left=step instructions Card (xl:col-span-1), right=full simulation (xl:col-span-3)

There is NO "Steps" section. There is NO list of step titles. The progress dots ARE the navigation.

The step instruction Card on the left has NO custom border class — it is a standard shadcn Card with default border.

```tsx
"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, CheckCircle, Info, Target, Lightbulb } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PetersonsSolution } from "@/components/petersons-simulation"

// ── Tutorial steps — comprehensive, covers every concept in the experiment ──
// Each step: interactive=true requires validation before Next unlocks
// interactive=false → "Mark Complete" button always passes

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
          {/* This is the EXACT same component as the Simulation tab */}
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
```

---

## PART 5 — `lib/scenario-engine.ts` — COMPLETE FILE FOR PETERSON'S

This is the scoring engine. It includes the **zero-effort gate** that prevents scoring 100/100 for doing nothing. Adapt keywords per lab.

```typescript
"use client"

export interface ScenarioConfig {
  id: number
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  timeLimit: number
  objectives: string[]
  initialProcesses: Array<{ id: number; label: string }>
  expectedOutcome: {
    minCSEntries: number
    maxWrongMoves: number
    maxMEViolations: number
  }
  scoringCriteria: {
    timeBonus: number
    accuracyWeight: number
    completionWeight: number
    transitionWeight: number
  }
}

export interface ScenarioResult {
  scenarioId: number
  score: number
  maxScore: number
  timeSpent: number
  timeLimit: number
  completed: boolean
  metrics: {
    csEntries: number
    meViolations: number
    wrongMoves: number
    actionsPerformed: string[]
  }
  feedback: {
    strengths: string[]
    improvements: string[]
    detailedAnalysis: string
  }
  timestamp: Date
}

export class ScenarioEngine {
  private currentScenario: ScenarioConfig | null = null
  private startTime: Date | null = null
  private actionLog: string[] = []
  private isRunning = false
  // Peterson's metrics tracked during scenario
  private csEntries = 0
  private meViolations = 0
  private wrongMoves = 0

  startScenario(scenario: ScenarioConfig): void {
    this.currentScenario = scenario
    this.startTime = new Date()
    this.actionLog = []
    this.isRunning = true
    this.csEntries = 0
    this.meViolations = 0
    this.wrongMoves = 0
  }

  // Call this from the simulation whenever the user does something meaningful
  logAction(action: string): void {
    if (this.isRunning) this.actionLog.push(action)
  }

  recordCSEntry(): void { if (this.isRunning) this.csEntries++ }
  recordMEViolation(): void { if (this.isRunning) this.meViolations++ }
  recordWrongMove(): void { if (this.isRunning) this.wrongMoves++ }

  getElapsedTime(): number {
    if (!this.startTime || !this.isRunning) return 0
    return Math.floor((new Date().getTime() - this.startTime.getTime()) / 1000)
  }

  completeScenario(externalMetrics?: { csEntries: number; meViolations: number; wrongMoves: number }): ScenarioResult | null {
    if (!this.currentScenario || !this.startTime || !this.isRunning) return null

    const endTime = new Date()
    const timeSpent = Math.floor((endTime.getTime() - this.startTime.getTime()) / 1000)

    const metrics = externalMetrics ?? {
      csEntries: this.csEntries,
      meViolations: this.meViolations,
      wrongMoves: this.wrongMoves,
    }

    // ── ZERO-EFFORT GATE ─────────────────────────────────────────────────────
    // If no meaningful actions were performed, score = 0 immediately.
    // "Meaningful" = any action that involves algorithm interaction.
    // Adapt keywords per lab:
    // Peterson's: "flag" | "turn" | "enter" | "exit" | "critical"
    // PLM:        "moved" | "created" | "terminated"
    // Buffer:     "produce" | "consume"
    // Dining:     "eat" | "pick" | "put" | "think"
    const hasPerformedActions =
      this.actionLog.length > 0 &&
      this.actionLog.some((a) =>
        a.includes("flag") ||
        a.includes("turn") ||
        a.includes("enter") ||
        a.includes("exit") ||
        a.includes("critical") ||
        a.includes("start") ||
        a.includes("select")
      )

    // Must have at least one CS entry to score
    const meetsMinimum = metrics.csEntries >= 1 || (hasPerformedActions && timeSpent > 10)

    if (!hasPerformedActions || !meetsMinimum) {
      const result: ScenarioResult = {
        scenarioId: this.currentScenario.id,
        score: 0,
        maxScore: 100,
        timeSpent,
        timeLimit: this.currentScenario.timeLimit,
        completed: true,
        metrics: {
          csEntries: 0,
          meViolations: 0,
          wrongMoves: 0,
          actionsPerformed: this.actionLog,
        },
        feedback: {
          strengths: [],
          improvements: [
            "No meaningful actions were performed during the scenario",
            "Complete the required objectives to receive a proper score",
            "Review the scenario objectives and try again",
          ],
          detailedAnalysis:
            "No performance to analyze — scenario was completed without attempting any objectives.",
        },
        timestamp: endTime,
      }
      this.isRunning = false
      return result
    }

    // ── SCORING: 4 components, 25 pts each ──────────────────────────────────
    const { expectedOutcome, scoringCriteria, timeLimit } = this.currentScenario

    // Time score (0-25): bonus for completing quickly
    const timeRatio = Math.min(timeSpent / timeLimit, 1)
    const timeScore = timeSpent < timeLimit
      ? Math.max(0, 25 * (1 - timeRatio) * scoringCriteria.timeBonus)
      : 0

    // Accuracy score (0-25): penalize wrong moves and ME violations
    const wrongRatio = (metrics.wrongMoves + metrics.meViolations * 3) / Math.max(expectedOutcome.maxWrongMoves + 1, 1)
    const accuracyScore = Math.max(0, 25 * (1 - Math.min(wrongRatio, 1)) * scoringCriteria.accuracyWeight)

    // Completion score (0-25): reward CS entries
    const completionRatio = metrics.csEntries / Math.max(expectedOutcome.minCSEntries, 1)
    const completionScore = Math.min(completionRatio, 1) * 25 * scoringCriteria.completionWeight

    // Transition score (0-25): reward correct algorithm usage
    const transitionScore = Math.min(metrics.csEntries / 5, 1) * 25 * scoringCriteria.transitionWeight

    // ME violations are a heavy penalty
    const meViolationPenalty = metrics.meViolations * 15

    const totalScore = Math.max(
      0,
      Math.round(timeScore + accuracyScore + completionScore + transitionScore - meViolationPenalty)
    )

    // ── FEEDBACK GENERATION ──────────────────────────────────────────────────
    const strengths: string[] = []
    const improvements: string[] = []

    if (metrics.meViolations === 0) {
      strengths.push("Maintained perfect mutual exclusion — no concurrent CS access occurred")
    } else {
      improvements.push(`${metrics.meViolations} mutual exclusion violation(s) — two processes entered CS simultaneously`)
    }

    if (metrics.csEntries >= expectedOutcome.minCSEntries) {
      strengths.push(`Achieved ${metrics.csEntries} critical section entries as required by the scenario`)
    } else {
      improvements.push(`Only ${metrics.csEntries} CS entries — target was ${expectedOutcome.minCSEntries}`)
    }

    if (metrics.wrongMoves === 0) {
      strengths.push("Zero wrong moves — executed the Peterson's algorithm sequence correctly")
    } else if (metrics.wrongMoves <= expectedOutcome.maxWrongMoves) {
      strengths.push("Kept incorrect attempts within acceptable limits")
    } else {
      improvements.push(`${metrics.wrongMoves} wrong moves — review the flag and turn sequence before acting`)
    }

    if (timeSpent < timeLimit * 0.5) {
      strengths.push("Excellent time management — completed the scenario in under half the allotted time")
    } else if (timeSpent > timeLimit * 0.9) {
      improvements.push("Work on completing the algorithm sequence more efficiently")
    }

    if (improvements.length === 0) {
      improvements.push("Continue to advanced scenarios to further test your understanding")
    }

    const result: ScenarioResult = {
      scenarioId: this.currentScenario.id,
      score: totalScore,
      maxScore: 100,
      timeSpent,
      timeLimit,
      completed: true,
      metrics: {
        csEntries: metrics.csEntries,
        meViolations: metrics.meViolations,
        wrongMoves: metrics.wrongMoves,
        actionsPerformed: this.actionLog,
      },
      feedback: {
        strengths,
        improvements,
        detailedAnalysis: `Score: ${totalScore}/100 | Time: ${timeSpent}s | CS Entries: ${metrics.csEntries} | ME Violations: ${metrics.meViolations} | Wrong Moves: ${metrics.wrongMoves}`,
      },
      timestamp: endTime,
    }

    this.isRunning = false
    return result
  }

  isScenarioRunning(): boolean { return this.isRunning }
  getCurrentScenario(): ScenarioConfig | null { return this.currentScenario }
}

// ── Predefined Evaluation Scenarios for Peterson's Solution ─────────────────
// These are the UNGUIDED scenarios used in the Evaluation tab.
// Same concepts as Guided Scenarios, but NO hints, NO step validation.
export const PREDEFINED_SCENARIOS: ScenarioConfig[] = [
  {
    id: 1,
    title: "Basic Mutual Exclusion",
    description: "Demonstrate that Peterson's algorithm prevents two processes from entering the critical section simultaneously.",
    difficulty: "beginner",
    timeLimit: 300,
    objectives: [
      "Start the simulation",
      "Set flag[0]=true and turn=1 for Process 0",
      "Enter the critical section with P0 (no ME violations)",
      "Exit correctly by resetting flag[0]=false",
    ],
    initialProcesses: [{ id: 0, label: "P0" }, { id: 1, label: "P1" }],
    expectedOutcome: { minCSEntries: 1, maxWrongMoves: 2, maxMEViolations: 0 },
    scoringCriteria: { timeBonus: 1.0, accuracyWeight: 1.2, completionWeight: 1.0, transitionWeight: 1.0 },
  },
  {
    id: 2,
    title: "Turn Variable Arbitration",
    description: "Both processes declare interest simultaneously. Use the turn variable to resolve competition correctly.",
    difficulty: "beginner",
    timeLimit: 360,
    objectives: [
      "Set both flag[0]=true and flag[1]=true",
      "Demonstrate that turn determines who enters CS first",
      "Complete an enter/exit cycle for both P0 and P1",
      "Maintain zero ME violations throughout",
    ],
    initialProcesses: [{ id: 0, label: "P0" }, { id: 1, label: "P1" }],
    expectedOutcome: { minCSEntries: 2, maxWrongMoves: 2, maxMEViolations: 0 },
    scoringCriteria: { timeBonus: 1.0, accuracyWeight: 1.2, completionWeight: 1.2, transitionWeight: 1.0 },
  },
  {
    id: 3,
    title: "No Deadlock Proof",
    description: "Prove that Peterson's Solution never deadlocks by completing 3 consecutive enter/exit cycles.",
    difficulty: "intermediate",
    timeLimit: 480,
    objectives: [
      "Complete 3 full alternating P0/P1 CS cycles",
      "Demonstrate that at least one process always proceeds",
      "Keep ME Violations = 0 throughout all cycles",
    ],
    initialProcesses: [{ id: 0, label: "P0" }, { id: 1, label: "P1" }],
    expectedOutcome: { minCSEntries: 3, maxWrongMoves: 3, maxMEViolations: 0 },
    scoringCriteria: { timeBonus: 0.8, accuracyWeight: 1.0, completionWeight: 1.2, transitionWeight: 1.0 },
  },
  {
    id: 4,
    title: "Bounded Waiting Validation",
    description: "Show that no process waits more than one turn for the critical section (starvation-free).",
    difficulty: "intermediate",
    timeLimit: 420,
    objectives: [
      "P0 completes a full CS cycle first",
      "P1 enters immediately after P0 exits (bounded wait)",
      "P0 re-enters after P1 exits",
      "Demonstrate alternating access without starvation",
    ],
    initialProcesses: [{ id: 0, label: "P0" }, { id: 1, label: "P1" }],
    expectedOutcome: { minCSEntries: 3, maxWrongMoves: 2, maxMEViolations: 0 },
    scoringCriteria: { timeBonus: 1.0, accuracyWeight: 1.2, completionWeight: 1.2, transitionWeight: 0.8 },
  },
  {
    id: 5,
    title: "Full Algorithm Mastery",
    description: "Execute Peterson's Solution correctly for 5 alternating cycles with zero violations.",
    difficulty: "advanced",
    timeLimit: 600,
    objectives: [
      "Complete 5 alternating P0/P1 CS cycles",
      "ME Violations must remain 0 throughout",
      "Wrong Moves must be 0",
      "CS Entries must be at least 5",
    ],
    initialProcesses: [{ id: 0, label: "P0" }, { id: 1, label: "P1" }],
    expectedOutcome: { minCSEntries: 5, maxWrongMoves: 0, maxMEViolations: 0 },
    scoringCriteria: { timeBonus: 0.8, accuracyWeight: 1.5, completionWeight: 1.2, transitionWeight: 1.0 },
  },
]
```

---

## PART 6 — `components/scenario-evaluation.tsx` — COMPLETE FILE

This is the complete file. Every className is identical to PLM. The sub-tabs appear immediately. The simulation appears below `<Tabs>` when active. Scoring uses the engine from Part 5.

```tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle, Clock, Users, Target, TrendingUp, Award,
  AlertTriangle, FileText, BarChart3, Info,
} from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScenarioEngine, PREDEFINED_SCENARIOS, type ScenarioConfig, type ScenarioResult } from "@/lib/scenario-engine"
import { PetersonsSolution } from "./petersons-simulation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Export helpers
function exportResultsCSV(results: ScenarioResult[], scenarios: ScenarioConfig[]) {
  const rows = results.map((r) => {
    const s = scenarios.find((sc) => sc.id === r.scenarioId)
    return `"${s?.title ?? r.scenarioId}",${r.score},${r.maxScore},${r.timeSpent},${r.metrics.csEntries},${r.metrics.meViolations},${r.metrics.wrongMoves}`
  })
  const csv = ["Title,Score,MaxScore,TimeSpent,CSEntries,MEViolations,WrongMoves", ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = "evaluation-results.csv"; a.click()
  URL.revokeObjectURL(url)
}

function exportResultsJSON(results: ScenarioResult[], scenarios: ScenarioConfig[]) {
  const data = results.map((r) => ({ ...r, scenarioTitle: scenarios.find((s) => s.id === r.scenarioId)?.title }))
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = "evaluation-results.json"; a.click()
  URL.revokeObjectURL(url)
}

interface ScenarioEvaluationProps {
  persistedResults?: any[]
  onResultsChange?: (results: ScenarioResult[]) => void
}

export function ScenarioEvaluation({ persistedResults, onResultsChange }: ScenarioEvaluationProps = {}) {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioConfig | null>(null)
  const [currentTab, setCurrentTab] = useState("scenarios")
  const [evaluationResults, setEvaluationResults] = useState<ScenarioResult[]>((persistedResults ?? []) as ScenarioResult[])
  const [scenarioEngine] = useState(() => new ScenarioEngine())
  const [isScenarioActive, setIsScenarioActive] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showDetailedResults, setShowDetailedResults] = useState<number | null>(null)

  useEffect(() => { onResultsChange?.(evaluationResults) }, [evaluationResults, onResultsChange])

  useEffect(() => {
    if (!isScenarioActive) return
    const interval = setInterval(() => setElapsedTime(scenarioEngine.getElapsedTime()), 1000)
    return () => clearInterval(interval)
  }, [isScenarioActive, scenarioEngine])

  const getDifficultyColor = (d: string) => ({
    beginner: "bg-green-100 text-green-800 border-green-200",
    intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200",
    advanced: "bg-red-100 text-red-800 border-red-200",
  }[d] ?? "bg-gray-100 text-gray-800 border-gray-200")

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 55) return "text-yellow-600"
    return "text-red-600"
  }

  const getGradeFromScore = (score: number) => {
    if (score >= 90) return "A"
    if (score >= 80) return "B"
    if (score >= 70) return "C"
    if (score >= 60) return "D"
    return "F"
  }

  const startScenario = (scenario: ScenarioConfig) => {
    setSelectedScenario(scenario)
    scenarioEngine.startScenario(scenario)
    setIsScenarioActive(true)
    setElapsedTime(0)
    setCurrentTab("results")  // switch to results sub-tab while scenario runs
  }

  const completeScenario = useCallback(() => {
    if (!isScenarioActive || !selectedScenario) return
    const result = scenarioEngine.completeScenario()
    if (result) {
      setEvaluationResults((prev) => [...prev.filter((r) => r.scenarioId !== result.scenarioId), result])
      setIsScenarioActive(false)
      setCurrentTab("results")
    }
  }, [isScenarioActive, selectedScenario, scenarioEngine])

  const resetScenario = () => {
    setIsScenarioActive(false)
    setSelectedScenario(null)
    setElapsedTime(0)
    setCurrentTab("scenarios")
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs value={currentTab} onValueChange={setCurrentTab}>

        {/* ── SUB-TAB BAR — uses title= NOT className active override ── */}
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger
            value="scenarios"
            title="Select and start evaluation scenarios"
            className="text-xs sm:text-sm px-2 py-2 sm:px-3"
          >
            <span className="hidden sm:inline">Scenarios</span>
            <span className="sm:hidden">Tests</span>
          </TabsTrigger>
          <TabsTrigger
            value="results"
            title="View completed scenario results and performance analysis"
            className="text-xs sm:text-sm px-2 py-2 sm:px-3"
          >
            Results
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            title="Detailed learning analytics and progress tracking"
            className="text-xs sm:text-sm px-2 py-2 sm:px-3"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* ── SCENARIOS SUB-TAB ──────────────────────────────────────────── */}
        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl">
                <Target className="h-5 w-5 flex-shrink-0" />
                <span>Peterson&apos;s Solution Evaluation</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-600 cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Scenarios to test your understanding of Peterson&apos;s Solution. Each includes detailed scoring and feedback based on your actions.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Comprehensive unguided scenarios to evaluate your understanding of mutual exclusion, turn variable management, and Peterson&apos;s algorithm correctness.
              </p>
            </CardHeader>
          </Card>

          <div className="grid gap-4 grid-cols-1">
            {PREDEFINED_SCENARIOS.map((scenario) => {
              const result = evaluationResults.find((r) => r.scenarioId === scenario.id)
              return (
                <Card key={scenario.id} className="relative">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col gap-3">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base sm:text-lg break-words flex-1 min-w-0">
                            {scenario.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge className={getDifficultyColor(scenario.difficulty)}>
                              {scenario.difficulty}
                            </Badge>
                            {result && result.completed && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Completed</span>
                                <span className="sm:hidden">Done</span>
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm">{scenario.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span>{Math.floor(scenario.timeLimit / 60)}m</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 flex-shrink-0" />
                        Objectives:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
                        {scenario.objectives.map((obj, i) => (
                          <li key={i} className="break-words">{obj}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span>{scenario.initialProcesses.length} processes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 flex-shrink-0" />
                        <span>Min CS entries: {scenario.expectedOutcome.minCSEntries}</span>
                      </div>
                    </div>

                    {/* Previous result alert: border-green-200 bg-green-50, Award icon */}
                    {result && result.completed && (
                      <Alert className="border-green-200 bg-green-50">
                        <Award className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <AlertDescription className="text-green-800">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className="text-sm break-words">
                              Score: {result.score}/{result.maxScore} ({getGradeFromScore(result.score)}) | Time: {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowDetailedResults(showDetailedResults === result.scenarioId ? null : result.scenarioId)}
                              className="text-xs px-2 py-1 flex-shrink-0"
                            >
                              {showDetailedResults === result.scenarioId ? "Hide" : "Show"} Details
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Detailed results panel: bg-blue-50 border-blue-200 */}
                    {showDetailedResults === scenario.id && result && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Detailed Performance Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="font-medium">Algorithm Metrics</div>
                              <div className="space-y-1 text-muted-foreground">
                                <div>CS Entries: {result.metrics.csEntries}</div>
                                <div>ME Violations: {result.metrics.meViolations}</div>
                                <div>Wrong Moves: {result.metrics.wrongMoves}</div>
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">Score Breakdown</div>
                              <div className="space-y-1 text-muted-foreground">
                                <div>Time Management: /25</div>
                                <div>Accuracy: /25</div>
                                <div>Completion: /25</div>
                                <div>Transitions: /25</div>
                              </div>
                            </div>
                          </div>
                          {result.feedback.strengths.length > 0 && (
                            <div>
                              <div className="font-medium text-green-700 mb-1">Strengths:</div>
                              <ul className="list-disc list-inside text-sm text-green-600 pl-2">
                                {result.feedback.strengths.map((s, i) => (
                                  <li key={i} className="break-words">{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {result.feedback.improvements.length > 0 && (
                            <div>
                              <div className="font-medium text-orange-700 mb-1">Areas for Improvement:</div>
                              <ul className="list-disc list-inside text-sm text-orange-600 pl-2">
                                {result.feedback.improvements.map((s, i) => (
                                  <li key={i} className="break-words">{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button onClick={() => startScenario(scenario)} className="bg-blue-600 hover:bg-blue-700 text-sm">
                        {result && result.completed ? "Retry Scenario" : "Start Scenario"}
                      </Button>
                      {result && result.completed && (
                        <Button variant="outline" onClick={() => setShowDetailedResults(scenario.id)} className="text-sm">
                          <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                          View Report
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ── RESULTS SUB-TAB ────────────────────────────────────────────── */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl">
                <Award className="h-5 w-5 flex-shrink-0" />
                <span>Evaluation Results</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-600 cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Comprehensive performance analysis across all completed scenarios with detailed scoring and feedback.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                  Comprehensive performance analysis across all completed scenarios.
                </p>
                {evaluationResults.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1 flex-shrink-0" aria-label="Export evaluation results">
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => exportResultsCSV(evaluationResults, PREDEFINED_SCENARIOS)} className="text-xs">
                        Results (CSV)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportResultsJSON(evaluationResults, PREDEFINED_SCENARIOS)} className="text-xs">
                        Results (JSON)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
          </Card>

          {evaluationResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">No completed scenarios yet.</p>
                <Button onClick={() => setCurrentTab("scenarios")} className="text-sm">
                  Start Your First Scenario
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Overall Performance Summary — 4-stat grid */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Overall Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">
                        {evaluationResults.length}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(Math.round(evaluationResults.reduce((a, r) => a + r.score, 0) / evaluationResults.length))}`}>
                        {Math.round(evaluationResults.reduce((a, r) => a + r.score, 0) / evaluationResults.length)}%
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Avg Score</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-purple-600">
                        {getGradeFromScore(Math.round(evaluationResults.reduce((a, r) => a + r.score, 0) / evaluationResults.length))}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Overall Grade</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {Math.floor(evaluationResults.reduce((a, r) => a + r.timeSpent, 0) / 60)}m
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Total Time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Per-result cards */}
              {evaluationResults.map((result) => {
                const scenario = PREDEFINED_SCENARIOS.find((s) => s.id === result.scenarioId)
                if (!scenario) return null
                return (
                  <Card key={result.scenarioId}>
                    <CardHeader className="pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <CardTitle className="text-base sm:text-lg break-words flex-1 min-w-0">
                          {scenario.title}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={`${getScoreColor(result.score)} border-current text-xs`}>
                            {result.score}/{result.maxScore} ({getGradeFromScore(result.score)})
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">Algorithm Metrics</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>CS Entries:</span>
                              <span className="font-mono text-green-600">{result.metrics.csEntries}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>ME Violations:</span>
                              <span className="font-mono text-red-600">{result.metrics.meViolations}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Wrong Moves:</span>
                              <span className="font-mono">{result.metrics.wrongMoves}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">Key Insights</h4>
                          <div className="text-sm space-y-1">
                            {result.feedback.strengths.slice(0, 2).map((s, i) => (
                              <div key={i} className="text-green-600 break-words">{"+"} {s}</div>
                            ))}
                            {result.feedback.improvements.slice(0, 2).map((s, i) => (
                              <div key={i} className="text-orange-600 break-words">{"->"} {s}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ── ANALYTICS SUB-TAB ──────────────────────────────────────────── */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl">
                <BarChart3 className="h-5 w-5 flex-shrink-0" />
                <span>Learning Analytics Dashboard</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-600 cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Detailed analytics to track progress, identify learning gaps, and assess overall performance trends.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Detailed analytics to track your progress and identify learning gaps.
              </p>
            </CardHeader>
            <CardContent>
              {evaluationResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-4">Complete some scenarios to see analytics data.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Performance by Difficulty */}
                  <div>
                    <h4 className="font-semibold mb-3 text-sm">Performance by Difficulty</h4>
                    <div className="space-y-2">
                      {["beginner", "intermediate", "advanced"].map((difficulty) => {
                        const diffResults = evaluationResults.filter((r) =>
                          PREDEFINED_SCENARIOS.find((s) => s.id === r.scenarioId)?.difficulty === difficulty
                        )
                        const avgScore = diffResults.length > 0
                          ? Math.round(diffResults.reduce((a, r) => a + r.score, 0) / diffResults.length)
                          : 0
                        return (
                          <div key={difficulty} className="flex items-center justify-between">
                            <span className="capitalize text-sm">{difficulty}:</span>
                            <div className="flex items-center gap-2">
                              <Progress value={avgScore} className="w-16 sm:w-20" />
                              <span className={`font-mono text-xs ${getScoreColor(avgScore)}`}>{avgScore}%</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Common Areas for Improvement */}
                  <div>
                    <h4 className="font-semibold mb-3 text-sm">Common Areas for Improvement</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(
                        evaluationResults
                          .flatMap((r) => r.feedback.improvements)
                          .reduce((acc: { [k: string]: number }, imp) => {
                            acc[imp] = (acc[imp] || 0) + 1
                            return acc
                          }, {})
                      )
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .slice(0, 3)
                        .map(([improvement, count]) => (
                          <div key={improvement} className="flex items-start justify-between gap-2">
                            <span className="text-orange-600 text-xs break-words flex-1">{"*"} {improvement}</span>
                            <Badge variant="outline" className="text-xs flex-shrink-0">{count}</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── ACTIVE SCENARIO — OUTSIDE <Tabs>, BELOW all TabsContent ───────── */}
      {selectedScenario && isScenarioActive && (
        <div className="space-y-4">
          {/* Scenario info card: border-blue-200 bg-blue-50, countdown timer */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center gap-2 text-lg break-words">
                    <Target className="h-5 w-5 flex-shrink-0" />
                    <span>{selectedScenario.title}</span>
                  </CardTitle>
                  <p className="text-muted-foreground mt-1 text-sm break-words">{selectedScenario.description}</p>
                </div>
                {/* Countdown timer — large blue bold number */}
                <div className="text-center sm:text-right flex-shrink-0">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {Math.floor((selectedScenario.timeLimit - elapsedTime) / 60)}:
                    {String(Math.max(0, (selectedScenario.timeLimit - elapsedTime) % 60)).padStart(2, "0")}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Time Remaining</div>
                </div>
              </div>
              <Progress value={(elapsedTime / selectedScenario.timeLimit) * 100} className="mt-2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Objectives:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1 pl-2">
                    {selectedScenario.objectives.map((obj, i) => (
                      <li key={i} className="break-words">{obj}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={completeScenario} className="bg-green-600 hover:bg-green-700 text-sm">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    Complete Scenario
                  </Button>
                  <Button onClick={resetScenario} variant="outline" className="text-sm bg-transparent">
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full live simulation — NO guidance overlays, user works freely */}
          <div className="overflow-hidden">
            <PetersonsSolution />
          </div>

          {/* 80% time warning */}
          {elapsedTime > selectedScenario.timeLimit * 0.8 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
              <AlertDescription className="text-yellow-800 text-sm break-words">
                Warning: You have less than {Math.ceil((selectedScenario.timeLimit - elapsedTime) / 60)} minutes remaining!
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}
```

---

## PART 7 — `components/petersons-simulation.tsx` — REQUIRED CHANGES ONLY

Do NOT rewrite this file. Make ONLY these three targeted changes:

### Change 1: Add the optional props to the component interface and signature

```tsx
interface PetersonsSolutionProps {
  onEngineReady?: (engine: any) => void
  onStateChange?: (state: any) => void
}

export function PetersonsSolution({ onEngineReady, onStateChange }: PetersonsSolutionProps = {}) {
```

### Change 2: Add useEffect for onEngineReady + broadcast state after every mutation

After all the useState declarations, add:

```tsx
// Broadcast engine reference on mount (for Tutorial)
useEffect(() => {
  onEngineReady?.({
    getState: () => ({
      simulationState,
      isRunning: simulationState === "running",
      flag0, flag1, turn,
      process0State, process1State,
      selectedProcess,
      criticalEntries,
      mutualExclusionViolations,
      wrongMoves,
    })
  })
}, [])  // empty deps — fires once on mount

// Broadcast state after every change (for Tutorial validation and Scenarios)
useEffect(() => {
  onStateChange?.({
    simulationState,
    isRunning: simulationState === "running",
    flag0, flag1, turn,
    process0State, process1State,
    selectedProcess,
    criticalEntries,
    mutualExclusionViolations,
    wrongMoves,
  })
}, [flag0, flag1, turn, process0State, process1State, simulationState, criticalEntries, mutualExclusionViolations, wrongMoves])
```

### Change 3: Fix the Export button — remove the Download icon

Find this in the existing code:
```tsx
<Button variant="outline" size="sm" className="h-7 text-xs gap-1" aria-label="Export data">
  <Download className="h-3 w-3 flex-shrink-0" />
  Export
</Button>
```
Replace with (no icon):
```tsx
<Button variant="outline" size="sm" className="h-7 text-xs gap-1" aria-label="Export data">
  Export
</Button>
```

---

## PART 8 — CARD BORDER REFERENCE TABLE

Copy this table. Every card in every component must match.

| Card | className |
|---|---|
| Controls card | `"lg:col-span-1 xl:col-span-1 order-1"` — default shadcn Card, NO extra border |
| Visualizer card | `"lg:col-span-1 xl:col-span-2 border-2 border-green-200 relative overflow-hidden order-2 lg:order-2"` |
| Metrics & Log card | `"lg:col-span-2 xl:col-span-1 order-3"` — default shadcn Card, NO extra border |
| History/Sync History card | `"mt-4"` — default shadcn Card, NO extra border |
| Tutorial progress header | default shadcn Card |
| Tutorial step instructions | `"xl:col-span-1"` — default shadcn Card, NO extra border (was `border-blue-200` in current code — REMOVE IT) |
| Guided Scenario selection card | default shadcn Card |
| Guided Scenario active header | `"border-green-200 bg-green-50"` |
| Guided Scenario active step | `"border-blue-200"` (border width is default, NOT border-2) |
| Guided Scenario completion | `"border-green-200 bg-green-50"` |
| Evaluation scenario card | default shadcn Card, NO extra border |
| Evaluation previous result alert | `"border-green-200 bg-green-50"` Alert |
| Evaluation detailed results panel | `"bg-blue-50 border-blue-200"` Card |
| Evaluation active scenario info | `"border-blue-200 bg-blue-50"` Card |
| Evaluation Results per-result card | default shadcn Card |
| Evaluation Analytics card | default shadcn Card |
| Results summary card | default shadcn Card |

---

## PART 9 — BUTTON CSS REFERENCE TABLE

| Button | className |
|---|---|
| Start | `className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm w-full"` — NO icon |
| Pause | `variant="outline" className="flex items-center gap-2 bg-transparent text-xs sm:text-sm w-full"` — NO icon |
| Reset (simulation) | `variant="outline" className="flex items-center gap-2 bg-transparent text-xs sm:text-sm w-full"` — NO icon |
| Advance Clock | `variant="outline" className="flex items-center gap-2 bg-transparent text-xs sm:text-sm w-full"` — HAS Clock icon |
| Create Process | `className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm w-full"` — NO icon |
| Mark Complete (tutorial) | `className="w-full bg-blue-600 hover:bg-blue-700"` — HAS CheckCircle icon |
| Previous (tutorial) | `variant="outline" className="flex-1 flex items-center justify-center gap-1 bg-transparent"` |
| Next (tutorial) | `className="flex-1 flex items-center justify-center gap-1"` — disabled until step.completed |
| Start Guided Learning | `className="bg-green-600 hover:bg-green-700"` — no icon |
| Check & Complete Step | `className="bg-green-600 hover:bg-green-700"` — HAS CheckCircle icon |
| Reset Simulation (scenarios) | `variant="outline"` — no icon |
| Go Back (scenarios) | `variant="outline"` — HAS ArrowLeft icon |
| Start Scenario (evaluation) | `className="bg-blue-600 hover:bg-blue-700 text-sm"` — no icon |
| Retry Scenario | `className="bg-blue-600 hover:bg-blue-700 text-sm"` — no icon |
| View Report | `variant="outline" className="text-sm"` — HAS FileText icon |
| Complete Scenario | `className="bg-green-600 hover:bg-green-700 text-sm"` — HAS CheckCircle icon |
| Reset (evaluation active) | `variant="outline" className="text-sm bg-transparent"` — no icon |
| Export | `variant="outline" size="sm" className="h-7 text-xs gap-1"` — NO icon, text "Export" only |
| Start Your First Scenario | `className="text-sm"` — no icon |

---

## PART 10 — ICON REFERENCE TABLE

| Where | Icon | Props |
|---|---|---|
| Controls CardTitle | `Activity` | `h-4 w-4 flex-shrink-0` |
| Visualizer CardTitle | `Cpu` | `h-4 w-4 flex-shrink-0` |
| Metrics & Log CardTitle | `BookOpen` | `h-4 w-4 flex-shrink-0` |
| History CardTitle | `History` | `h-4 w-4 flex-shrink-0` |
| All Info tooltip triggers | `Info` | `h-3 w-3 sm:h-4 sm:w-4 text-blue-600 cursor-help flex-shrink-0` |
| Simulation alert icon | `AlertCircle` | `h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0` |
| Tutorial alert icon | `Info` (NOT AlertCircle) | `h-4 w-4` |
| Tutorial step CardTitle | `Target` | `h-5 w-5` |
| Tutorial Objective block | `Target` | `h-4 w-4` |
| Tutorial Instructions block | `Info` | `h-4 w-4` |
| Tutorial Hint block | `Lightbulb` | `h-4 w-4` |
| Tutorial step dot completed | `CheckCircle` | `h-4 w-4` |
| Mark Complete button | `CheckCircle` | `h-4 w-4 mr-2` |
| Previous button | `ChevronLeft` | `h-4 w-4` |
| Next button | `ChevronRight` | `h-4 w-4` |
| Guided Scenarios header | `BookOpen` | `h-5 w-5` |
| Scenario active header | `BookOpen` | `h-5 w-5` |
| Scenario step title | `Target` | `h-5 w-5 text-blue-600` |
| Scenario instruction alert | `Info` | `h-4 w-4 text-blue-600` |
| Scenario hint button | `Lightbulb` | `h-4 w-4` |
| Scenario hint alert | `Lightbulb` | `h-4 w-4 text-yellow-600` |
| Scenario step feedback | `Info` | `h-4 w-4` |
| Check & Complete Step | `CheckCircle` | `h-4 w-4 mr-2` |
| Go Back | `ArrowLeft` | `h-4 w-4 mr-2` |
| Completion | `PartyPopper` | `h-6 w-6` |
| Evaluation Scenarios header | `Target` | `h-5 w-5 flex-shrink-0` |
| Scenario Objectives label | `Target` | `h-4 w-4 flex-shrink-0` |
| Process count | `Users` | `h-4 w-4 flex-shrink-0` |
| Min CS entries | `TrendingUp` | `h-4 w-4 flex-shrink-0` |
| Previous result alert | `Award` | `h-4 w-4 text-green-600 flex-shrink-0` |
| View Report button | `FileText` | `h-4 w-4 mr-2 flex-shrink-0` |
| Evaluation active scenario | `Target` | `h-5 w-5 flex-shrink-0` |
| Complete Scenario button | `CheckCircle` | `h-4 w-4 mr-2 flex-shrink-0` |
| 80% time warning | `AlertTriangle` | `h-4 w-4 text-yellow-600 flex-shrink-0` |
| Results CardTitle | `Award` | `h-5 w-5 flex-shrink-0` |
| Analytics CardTitle | `BarChart3` | `h-5 w-5 flex-shrink-0` |
| Keyboard dialog button | `Keyboard` | `h-3 w-3 sm:h-4 sm:w-4` |
| Reset All button | `RotateCcw` | `h-3 w-3 sm:h-4 sm:w-4` |
| Start button | NO icon | — |
| Pause button | NO icon | — |
| Reset (simulation) button | NO icon | — |
| Create Process button | NO icon | — |
| Export button | NO icon | — |

---

## PART 11 — WHAT NOT TO DO (the exact mistakes that keep happening)

1. **DO NOT** put the sub-tabs (Scenarios/Results/Analytics) inside a scenario card or behind a "Start Evaluation" button. They must be the first thing visible when the Evaluation tab loads.

2. **DO NOT** use `bg-white text-black border border-blue-200 shadow-sm` as the active state for the EVALUATION sub-tabs. That CSS is only for the MAIN four tabs. The evaluation sub-tabs use shadcn's default active state via `title=` attribute only.

3. **DO NOT** create a "Steps" section in Tutorial that lists step titles. The progress dots in the header card ARE the step navigation. The left panel shows only the current step details.

4. **DO NOT** add `border-blue-200` to the Tutorial step instructions Card. It should have the default shadcn Card border.

5. **DO NOT** score based on time alone. The zero-effort gate in `ScenarioEngine.completeScenario()` checks `hasPerformedActions` and `meetsMinimum` — if either fails, score = 0.

6. **DO NOT** add icons to Start, Pause, Reset, Create Process, or Export buttons.

7. **DO NOT** put the active evaluation simulation inside a `TabsContent`. It renders BELOW the entire `<Tabs>` component, outside all TabsContent.

8. **DO NOT** add `border-2` to the Controls card or Metrics & Log card. Only the Visualizer card gets `border-2 border-green-200`.
