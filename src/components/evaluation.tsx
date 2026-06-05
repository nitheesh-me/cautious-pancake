"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Info,
  Play,
  Clock,
  Target,
  Download,
  CheckCircle,
  AlertCircle,
  BarChart3,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"

interface EvaluationResult {
  scenarioId: number
  scenarioTitle: string
  score: number
  passed: boolean
  timeSeconds: number
  completedAt: string
}

interface EvaluationProps {
  evaluationResults: EvaluationResult[]
  onResultsChange: (results: EvaluationResult[]) => void
}

const SCENARIOS = [
  {
    id: 1,
    title: "Basic Mutual Exclusion",
    description: "Demonstrate how Peterson's Solution achieves mutual exclusion between two processes",
    difficulty: "beginner" as const,
    estimatedTime: 10,
    objectives: [
      "Understand the mutual exclusion concept",
      "Set flag[0]=true for Process 0 and attempt CS entry",
      "Verify only one process can be in CS at a time",
      "Exit CS and reset flags correctly",
    ],
    processes: 2,
    minThroughput: 2,
  },
  {
    id: 2,
    title: "Turn Variable Management",
    description: "Master the role of the turn variable in conflict resolution between processes",
    difficulty: "beginner" as const,
    estimatedTime: 12,
    objectives: [
      "Understand the turn variable purpose",
      "Set both flags to true and observe turn arbitration",
      "Demonstrate that the process with turn priority proceeds first",
      "Handle alternating process execution correctly",
    ],
    processes: 2,
    minThroughput: 2,
  },
  {
    id: 3,
    title: "Preventing Deadlock",
    description: "Show how Peterson's Solution prevents deadlock by always allowing one process to proceed",
    difficulty: "intermediate" as const,
    estimatedTime: 15,
    objectives: [
      "Identify the conditions that could cause deadlock",
      "Apply the turn variable to break the symmetry",
      "Complete both CS entries without deadlock",
      "Ensure progress for both processes throughout",
    ],
    processes: 2,
    minThroughput: 2,
  },
  {
    id: 4,
    title: "Race Condition Prevention",
    description: "Validate that Peterson's Solution eliminates race conditions in critical sections",
    difficulty: "intermediate" as const,
    estimatedTime: 18,
    objectives: [
      "Simulate concurrent CS entry attempts",
      "Verify mutual exclusion is never violated",
      "Prevent simultaneous critical section access",
      "Validate correct interleaving of flag and turn operations",
    ],
    processes: 2,
    minThroughput: 2,
  },
  {
    id: 5,
    title: "Complete Peterson's Algorithm",
    description: "Demonstrate full mastery of Peterson's Solution under various conditions and edge cases",
    difficulty: "advanced" as const,
    estimatedTime: 20,
    objectives: [
      "Execute the complete algorithm without guidance",
      "Handle all edge cases including repeated CS entry",
      "Maintain mutual exclusion for 5+ consecutive entries",
      "Achieve zero wrong moves and zero ME violations",
    ],
    processes: 2,
    minThroughput: 2,
  },
]

const difficultyClass = (difficulty: string) => {
  if (difficulty === "beginner") return "bg-green-100 text-green-800 border-green-200"
  if (difficulty === "intermediate") return "bg-yellow-100 text-yellow-800 border-yellow-200"
  return "bg-red-100 text-red-800 border-red-200"
}

function exportCSV(data: EvaluationResult[]) {
  const header = "Scenario,Score,Passed,Time(s),CompletedAt\n"
  const rows = data.map(r =>
    `"${r.scenarioTitle}",${r.score},${r.passed},${r.timeSeconds},"${r.completedAt}"`
  ).join("\n")
  const blob = new Blob([header + rows], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "evaluation-results.csv"
  a.click()
  URL.revokeObjectURL(url)
}

function exportJSON(data: EvaluationResult[]) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "evaluation-results.json"
  a.click()
  URL.revokeObjectURL(url)
}

export function Evaluation({ evaluationResults, onResultsChange }: EvaluationProps) {
  const [evalTab, setEvalTab] = useState("scenarios")
  const [activeScenario, setActiveScenario] = useState<typeof SCENARIOS[0] | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (activeScenario && !submitted) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [activeScenario, submitted])

  const startScenario = (scenario: typeof SCENARIOS[0]) => {
    setActiveScenario(scenario)
    setElapsed(0)
    setSubmitted(false)
    setFeedback(null)
  }

  const submitScenario = () => {
    if (!activeScenario) return
    if (timerRef.current) clearInterval(timerRef.current)

    // Score based on time vs estimated: faster = higher score
    const expectedSeconds = activeScenario.estimatedTime * 60
    const ratio = Math.min(elapsed / expectedSeconds, 2)
    const score = Math.max(0, Math.round(100 - ratio * 30))
    const passed = score >= 60

    const result: EvaluationResult = {
      scenarioId: activeScenario.id,
      scenarioTitle: activeScenario.title,
      score,
      passed,
      timeSeconds: elapsed,
      completedAt: new Date().toLocaleString(),
    }

    onResultsChange([...evaluationResults, result])
    setSubmitted(true)
    setFeedback({
      type: passed ? "success" : "error",
      message: passed
        ? `Passed with ${score}% — completed in ${Math.floor(elapsed / 60)}m ${elapsed % 60}s.`
        : `Score ${score}% — below 60% pass threshold. Review objectives and try again.`,
    })
  }

  const abandonScenario = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setActiveScenario(null)
    setSubmitted(false)
    setFeedback(null)
  }

  const avgScore = evaluationResults.length
    ? Math.round(evaluationResults.reduce((s, r) => s + r.score, 0) / evaluationResults.length)
    : 0
  const bestScore = evaluationResults.length ? Math.max(...evaluationResults.map(r => r.score)) : 0
  const passRate = evaluationResults.length
    ? Math.round(evaluationResults.filter(r => r.passed).length / evaluationResults.length * 100)
    : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 flex-shrink-0" />
        <h2 className="text-base sm:text-lg font-bold">Instructor Evaluation Scenarios</h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 cursor-help flex-shrink-0" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>
              Comprehensive scenarios designed to test different aspects of Peterson&apos;s Solution
              knowledge. Each scenario includes detailed scoring and feedback for educational assessment.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground">
        Comprehensive performance analysis across all completed scenarios and identify learning gaps.
      </p>

      {/* Inner Tabs — Scenarios / Results / Analytics */}
      <Tabs value={evalTab} onValueChange={setEvalTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4 h-auto">
          <TabsTrigger
            value="scenarios"
            className={`text-xs sm:text-sm py-2 transition-colors ${
              evalTab === "scenarios"
                ? "bg-white text-black border border-blue-200 shadow-sm"
                : "hover:bg-gray-50"
            }`}
          >
            Scenarios
          </TabsTrigger>
          <TabsTrigger
            value="results"
            className={`text-xs sm:text-sm py-2 transition-colors ${
              evalTab === "results"
                ? "bg-white text-black border border-blue-200 shadow-sm"
                : "hover:bg-gray-50"
            }`}
          >
            Results
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className={`text-xs sm:text-sm py-2 transition-colors ${
              evalTab === "analytics"
                ? "bg-white text-black border border-blue-200 shadow-sm"
                : "hover:bg-gray-50"
            }`}
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* ── Sub-Tab 1: Scenarios ── */}
        <TabsContent value="scenarios" className="mt-0 outline-none focus-visible:ring-0">
          {!activeScenario ? (
            <div className="space-y-4">
              {SCENARIOS.map((scenario) => {
                const alreadyDone = evaluationResults.some(r => r.scenarioId === scenario.id && r.passed)
                return (
                  <Card key={scenario.id} className={alreadyDone ? "border-green-200 bg-green-50/30" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-sm sm:text-base">{scenario.title}</CardTitle>
                            <Badge variant="outline" className={`text-xs ${difficultyClass(scenario.difficulty)}`}>
                              {scenario.difficulty}
                            </Badge>
                            {alreadyDone && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{scenario.description}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          <span>~{scenario.estimatedTime}m</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                          <h4 className="font-semibold text-xs sm:text-sm">Learning Objectives:</h4>
                        </div>
                        <ul className="space-y-1">
                          {scenario.objectives.map((obj, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                              <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span>{scenario.processes} processes</span>
                        </span>
                        <span>Min throughput: {scenario.minThroughput}</span>
                      </div>
                      <Button
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => startScenario(scenario)}
                      >
                        <Play className="h-3 w-3" />
                        Start Scenario
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Timer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                  <span>{activeScenario.title}</span>
                  <Badge variant="outline" className={`text-xs ${difficultyClass(activeScenario.difficulty)}`}>
                    {activeScenario.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-muted-foreground">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  {Math.floor(elapsed / 60).toString().padStart(2, "0")}:
                  {Math.floor(elapsed % 60).toString().padStart(2, "0")}
                </div>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Objectives to Complete</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-1">
                    {activeScenario.objectives.map((obj, i) => (
                      <li key={i} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5 flex-shrink-0">•</span>
                        {obj}
                      </li>
                    ))}
                  </ul>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs sm:text-sm text-blue-800">
                      Use the Simulation tab to complete the objectives, then return here and click Submit to record your result.
                      No hints are available in evaluation mode.
                    </p>
                  </div>

                  {feedback && (
                    <Alert className={`border-2 ${feedback.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                      <AlertCircle className={`h-4 w-4 ${feedback.type === "success" ? "text-green-600" : "text-red-600"}`} />
                      <AlertDescription className={`text-xs sm:text-sm ${feedback.type === "success" ? "text-green-800" : "text-red-800"}`}>
                        {feedback.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={abandonScenario}
                  className="text-xs text-destructive hover:text-destructive gap-1"
                >
                  Abandon
                </Button>
                {!submitted ? (
                  <Button size="sm" onClick={submitScenario} className="gap-1 text-xs">
                    <CheckCircle className="h-3 w-3" />
                    Submit
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={abandonScenario} className="text-xs gap-1">
                    Back to Scenarios
                  </Button>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Sub-Tab 2: Results ── */}
        <TabsContent value="results" className="mt-0 outline-none focus-visible:ring-0">
          {evaluationResults.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No evaluations yet.</p>
              <p className="text-xs mt-1">Complete a scenario in the Scenarios tab to see results here.</p>
              <Button size="sm" className="mt-4 text-xs" onClick={() => setEvalTab("scenarios")}>
                Go to Scenarios
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Overall summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-lg sm:text-2xl font-bold font-mono">{evaluationResults.length}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-lg sm:text-2xl font-bold font-mono text-blue-600">{avgScore}%</div>
                  <div className="text-xs text-muted-foreground">Avg Score</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className={`text-lg sm:text-2xl font-bold font-mono ${passRate >= 60 ? "text-green-600" : "text-red-600"}`}>
                    {passRate >= 60 ? "Pass" : "F"}
                  </div>
                  <div className="text-xs text-muted-foreground">Overall Grade</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-lg sm:text-2xl font-bold font-mono">
                    {evaluationResults.reduce((s, r) => s + r.timeSeconds, 0)}s
                  </div>
                  <div className="text-xs text-muted-foreground">Total Time</div>
                </div>
              </div>

              {/* Per-scenario results */}
              <div className="space-y-2">
                {evaluationResults.map((result, i) => (
                  <div key={i} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{result.scenarioTitle}</p>
                      <p className="text-xs text-muted-foreground">{result.completedAt}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs font-mono">{result.timeSeconds}s</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          result.passed
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}
                      >
                        {result.score}%
                      </Badge>
                      <Badge className={result.passed ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                        {result.passed ? "Pass" : "Fail"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs gap-1">
                      <Download className="h-3 w-3" />
                      Export Results
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => exportCSV(evaluationResults)} className="text-xs">
                      Export CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportJSON(evaluationResults)} className="text-xs">
                      Export JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Sub-Tab 3: Analytics ── */}
        <TabsContent value="analytics" className="mt-0 outline-none focus-visible:ring-0">
          {evaluationResults.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Complete evaluations to see analytics.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-lg sm:text-2xl font-bold font-mono">{evaluationResults.length}</div>
                  <div className="text-xs text-muted-foreground">Total Attempts</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-lg sm:text-2xl font-bold font-mono text-green-600">{avgScore}%</div>
                  <div className="text-xs text-muted-foreground">Average Score</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-lg sm:text-2xl font-bold font-mono text-blue-600">{bestScore}%</div>
                  <div className="text-xs text-muted-foreground">Best Score</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-lg sm:text-2xl font-bold font-mono">{passRate}%</div>
                  <div className="text-xs text-muted-foreground">Pass Rate</div>
                </div>
              </div>

              {/* Score trend */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm">Score Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={evaluationResults.map((r, i) => ({ attempt: i + 1, score: r.score }))}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="attempt" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <RechartsTooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--os-primary-blue, #3b82f6)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Performance by difficulty */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm">Performance by Difficulty</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {["beginner", "intermediate", "advanced"].map((diff) => {
                    const diffResults = evaluationResults.filter(r => {
                      const scenario = SCENARIOS.find(s => s.id === r.scenarioId)
                      return scenario?.difficulty === diff
                    })
                    if (diffResults.length === 0) return null
                    const avg = Math.round(diffResults.reduce((s, r) => s + r.score, 0) / diffResults.length)
                    return (
                      <div key={diff} className="flex items-center justify-between text-xs sm:text-sm">
                        <Badge variant="outline" className={`text-xs ${difficultyClass(diff)}`}>
                          {diff}
                        </Badge>
                        <div className="flex-1 mx-3 bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${avg >= 60 ? "bg-green-500" : "bg-red-400"}`}
                            style={{ width: `${avg}%` }}
                          />
                        </div>
                        <span className="font-mono font-semibold">{avg}%</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
