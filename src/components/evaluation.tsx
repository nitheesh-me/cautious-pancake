"use client"

import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { PhilosopherTable } from "./philosopher-table"
import {
  CheckCircle, Clock, Users, Target, TrendingUp, Award,
  AlertTriangle, FileText, BarChart3, Info, Play,
} from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SCENARIOS, type Scenario } from "./scenarios-data"
import type { Philosopher, Chopstick } from "./dining-philosophers"

interface ScenarioResult {
  scenarioId: number
  score: number
  maxScore: number
  timeSpent: number
  timeLimit: number
  completed: boolean
  metrics: {
    eatingCycles: number
    deadlocks: number
    starvationEvents: number
    actionsPerformed: string[]
  }
  feedback: {
    strengths: string[]
    improvements: string[]
    detailedAnalysis: string
  }
  timestamp: Date
}

// Export helpers
function exportResultsCSV(results: ScenarioResult[], scenarios: Scenario[]) {
  const rows = results.map((r) => {
    const s = scenarios.find((sc) => sc.id === r.scenarioId)
    return `"${s?.title ?? r.scenarioId}",${r.score},${r.maxScore},${r.timeSpent},${r.metrics.eatingCycles},${r.metrics.deadlocks},${r.metrics.starvationEvents}`
  })
  const csv = ["Title,Score,MaxScore,TimeSpent,EatingCycles,Deadlocks,StarvationEvents", ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = "evaluation-results.csv"; a.click()
  URL.revokeObjectURL(url)
}

function exportResultsJSON(results: ScenarioResult[], scenarios: Scenario[]) {
  const data = results.map((r) => ({ ...r, scenarioTitle: scenarios.find((s) => s.id === r.scenarioId)?.title }))
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = "evaluation-results.json"; a.click()
  URL.revokeObjectURL(url)
}

interface EvaluationProps {
  philosophers?: Philosopher[]
  chopsticks?: Chopstick[]
  onPhilosopherClick?: (id: number) => void
  onChopstickClick?: (id: number) => void
  onReset?: () => void
}

export function Evaluation({
  philosophers = [],
  chopsticks = [],
  onPhilosopherClick = () => {},
  onChopstickClick = () => {},
  onReset = () => {},
}: EvaluationProps) {
  const [activeSubTab, setActiveSubTab] = useState("scenarios")
  const [evaluationResults, setEvaluationResults] = useState<ScenarioResult[]>([])
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [isScenarioActive, setIsScenarioActive] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [actionLog, setActionLog] = useState<string[]>([])
  const [showDetailedResults, setShowDetailedResults] = useState<number | null>(null)

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

  const startScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario)
    setIsScenarioActive(true)
    setElapsedTime(0)
    setActionLog([])
    onReset()
    
    // Start timer
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setElapsedTime(elapsed)
      if (elapsed >= scenario.timeLimit) {
        clearInterval(interval)
        completeScenario()
      }
    }, 1000)
    
    // Store interval ID for cleanup
    ;(window as any).__evaluationInterval = interval
  }

  const completeScenario = useCallback(() => {
    if (!isScenarioActive || !selectedScenario) return
    
    // Clear timer
    if ((window as any).__evaluationInterval) {
      clearInterval((window as any).__evaluationInterval)
    }

    // Calculate metrics from current state
    const eatingCycles = philosophers.reduce((sum, p) => sum + p.eatingCount, 0)
    const philosophersWhoAte = philosophers.filter(p => p.eatingCount > 0).length
    
    // Check for deadlock (all hungry with one chopstick)
    const isDeadlock = philosophers.every(
      p => p.state === "hungry" && 
      ((p.leftChopstick !== null && p.rightChopstick === null) ||
       (p.leftChopstick === null && p.rightChopstick !== null))
    )

    // Zero-effort gate
    const hasPerformedActions = actionLog.length > 0 || eatingCycles > 0
    const meetsMinimum = eatingCycles >= 1 || hasPerformedActions

    let score = 0
    let strengths: string[] = []
    let improvements: string[] = []

    if (!hasPerformedActions || !meetsMinimum) {
      improvements = [
        "No meaningful actions were performed during the scenario",
        "Complete the required objectives to receive a proper score",
        "Review the scenario objectives and try again",
      ]
    } else {
      // Calculate score components
      const { expectedOutcome, scoringCriteria, timeLimit } = selectedScenario

      // Time score (0-25)
      const timeRatio = Math.min(elapsedTime / timeLimit, 1)
      const timeScore = elapsedTime < timeLimit
        ? Math.max(0, 25 * (1 - timeRatio) * scoringCriteria.timeBonus)
        : 0

      // Completion score (0-25)
      const completionRatio = Math.min(eatingCycles / Math.max(expectedOutcome.minEatingCycles, 1), 1)
      const completionScore = completionRatio * 25 * scoringCriteria.completionWeight

      // Accuracy score (0-25) - penalize deadlocks
      const deadlockPenalty = isDeadlock ? 15 : 0
      const accuracyScore = Math.max(0, 25 - deadlockPenalty) * scoringCriteria.accuracyWeight

      // Fairness score (0-25)
      const fairnessRatio = Math.min(philosophersWhoAte / Math.max(expectedOutcome.minPhilosophers, 1), 1)
      const fairnessScore = fairnessRatio * 25 * scoringCriteria.fairnessWeight

      score = Math.round(Math.max(0, Math.min(100, timeScore + completionScore + accuracyScore + fairnessScore)))

      // Generate feedback
      if (eatingCycles >= expectedOutcome.minEatingCycles) {
        strengths.push(`Achieved ${eatingCycles} eating cycles as required`)
      } else {
        improvements.push(`Only ${eatingCycles} eating cycles - target was ${expectedOutcome.minEatingCycles}`)
      }

      if (!isDeadlock) {
        strengths.push("Avoided deadlock conditions")
      } else {
        improvements.push("Deadlock occurred - review resource allocation strategy")
      }

      if (philosophersWhoAte >= expectedOutcome.minPhilosophers) {
        strengths.push(`${philosophersWhoAte} philosophers ate - good resource distribution`)
      } else {
        improvements.push(`Only ${philosophersWhoAte} philosophers ate - improve fairness`)
      }

      if (elapsedTime < timeLimit * 0.5) {
        strengths.push("Excellent time management")
      } else if (elapsedTime > timeLimit * 0.9) {
        improvements.push("Work on completing objectives more efficiently")
      }
    }

    const result: ScenarioResult = {
      scenarioId: selectedScenario.id,
      score,
      maxScore: 100,
      timeSpent: elapsedTime,
      timeLimit: selectedScenario.timeLimit,
      completed: true,
      metrics: {
        eatingCycles,
        deadlocks: isDeadlock ? 1 : 0,
        starvationEvents: 0,
        actionsPerformed: actionLog,
      },
      feedback: {
        strengths,
        improvements,
        detailedAnalysis: `Score: ${score}/100 | Time: ${elapsedTime}s | Eating Cycles: ${eatingCycles} | Philosophers Fed: ${philosophersWhoAte}`,
      },
      timestamp: new Date(),
    }

    setEvaluationResults(prev => [...prev.filter(r => r.scenarioId !== result.scenarioId), result])
    setIsScenarioActive(false)
    setSelectedScenario(null)
    setActiveSubTab("results")
  }, [isScenarioActive, selectedScenario, philosophers, elapsedTime, actionLog])

  const resetScenario = () => {
    if ((window as any).__evaluationInterval) {
      clearInterval((window as any).__evaluationInterval)
    }
    setIsScenarioActive(false)
    setSelectedScenario(null)
    setElapsedTime(0)
    setActionLog([])
    onReset()
  }

  // If a scenario is active, show the simulation view
  if (isScenarioActive && selectedScenario) {
    return (
      <div className="space-y-4">
        {/* Scenario Header */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{selectedScenario.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{selectedScenario.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    / {Math.floor(selectedScenario.timeLimit / 60)}:{(selectedScenario.timeLimit % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <Progress value={(elapsedTime / selectedScenario.timeLimit) * 100} className="w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={completeScenario} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Scenario
              </Button>
              <Button variant="outline" onClick={resetScenario}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Objectives */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {selectedScenario.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  {obj}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Simulation Area */}
        <Card className="border-2 border-green-500">
          <CardContent className="p-4">
            <PhilosopherTable
              philosophers={philosophers}
              chopsticks={chopsticks}
              onPhilosopherClick={onPhilosopherClick}
              onChopstickClick={onChopstickClick}
              isSimulating={false}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
            <Target className="h-6 w-6" />
            Instructor Evaluation Scenarios
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-blue-600 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Comprehensive scenarios designed to test different aspects of dining philosophers knowledge. Each scenario includes detailed scoring and feedback.</p>
              </TooltipContent>
            </Tooltip>
          </h2>
          <p className="text-gray-600">
            Comprehensive scenarios designed to test different aspects of dining philosophers knowledge. Each scenario
            includes detailed scoring and feedback for educational assessment.
          </p>
        </div>

        <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
          {/* Sub-tab bar - uses title= attribute, NOT className active override */}
          <TabsList className="grid w-full grid-cols-3 h-auto mb-6">
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

          {/* Scenarios Sub-Tab */}
          <TabsContent value="scenarios">
            <div className="space-y-4">
              {SCENARIOS.map((scenario) => {
                const result = evaluationResults.find((r) => r.scenarioId === scenario.id)
                return (
                  <Card key={scenario.id}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-lg">{scenario.title}</CardTitle>
                            <Badge className={getDifficultyColor(scenario.difficulty)}>
                              {scenario.difficulty}
                            </Badge>
                            {result && result.completed && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm">{scenario.description}</p>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {Math.floor(scenario.timeLimit / 60)}m
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                          <Target className="h-4 w-4" />
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

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          5 philosophers
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          Min cycles: {scenario.expectedOutcome.minEatingCycles}
                        </div>
                      </div>

                      {/* Previous result alert */}
                      {result && result.completed && (
                        <Alert className="border-green-200 bg-green-50">
                          <Award className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">
                                Score: {result.score}/{result.maxScore} ({getGradeFromScore(result.score)}) | Time: {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDetailedResults(showDetailedResults === result.scenarioId ? null : result.scenarioId)}
                                className="text-xs"
                              >
                                {showDetailedResults === result.scenarioId ? "Hide" : "Show"} Details
                              </Button>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Detailed results panel */}
                      {showDetailedResults === scenario.id && result && (
                        <Card className="bg-blue-50 border-blue-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Detailed Performance Analysis</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="font-medium">Metrics</div>
                                <div className="space-y-1 text-muted-foreground">
                                  <div>Eating Cycles: {result.metrics.eatingCycles}</div>
                                  <div>Deadlocks: {result.metrics.deadlocks}</div>
                                  <div>Starvation Events: {result.metrics.starvationEvents}</div>
                                </div>
                              </div>
                              <div>
                                <div className="font-medium">Score Breakdown</div>
                                <div className="space-y-1 text-muted-foreground">
                                  <div>Time Management: /25</div>
                                  <div>Accuracy: /25</div>
                                  <div>Completion: /25</div>
                                  <div>Fairness: /25</div>
                                </div>
                              </div>
                            </div>
                            {result.feedback.strengths.length > 0 && (
                              <div>
                                <div className="font-medium text-green-700 mb-1">Strengths:</div>
                                <ul className="list-disc list-inside text-sm text-green-600">
                                  {result.feedback.strengths.map((s, i) => (
                                    <li key={i}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {result.feedback.improvements.length > 0 && (
                              <div>
                                <div className="font-medium text-orange-700 mb-1">Areas for Improvement:</div>
                                <ul className="list-disc list-inside text-sm text-orange-600">
                                  {result.feedback.improvements.map((s, i) => (
                                    <li key={i}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      <div className="flex gap-2">
                        <Button onClick={() => startScenario(scenario)} className="bg-blue-600 hover:bg-blue-700">
                          <Play className="h-4 w-4 mr-2" />
                          {result && result.completed ? "Retry Scenario" : "Start Scenario"}
                        </Button>
                        {result && result.completed && (
                          <Button variant="outline" onClick={() => setShowDetailedResults(scenario.id)}>
                            <FileText className="h-4 w-4 mr-2" />
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

          {/* Results Sub-Tab */}
          <TabsContent value="results">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Evaluation Results
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-blue-600 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Comprehensive performance analysis across all completed scenarios.</p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                  {evaluationResults.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">Export</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => exportResultsCSV(evaluationResults, SCENARIOS)}>
                          Results (CSV)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportResultsJSON(evaluationResults, SCENARIOS)}>
                          Results (JSON)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  Comprehensive performance analysis across all completed scenarios.
                </p>
              </CardHeader>
            </Card>

            {evaluationResults.length === 0 ? (
              <Card className="mt-4">
                <CardContent className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">No completed scenarios yet</p>
                  <Button variant="outline" onClick={() => setActiveSubTab("scenarios")}>
                    Start First Scenario
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 mt-4">
                {/* Overall Performance Summary */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Overall Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {evaluationResults.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${getScoreColor(Math.round(evaluationResults.reduce((a, r) => a + r.score, 0) / evaluationResults.length))}`}>
                          {Math.round(evaluationResults.reduce((a, r) => a + r.score, 0) / evaluationResults.length)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Score</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {getGradeFromScore(Math.round(evaluationResults.reduce((a, r) => a + r.score, 0) / evaluationResults.length))}
                        </div>
                        <div className="text-sm text-muted-foreground">Overall Grade</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {Math.floor(evaluationResults.reduce((a, r) => a + r.timeSpent, 0) / 60)}m
                        </div>
                        <div className="text-sm text-muted-foreground">Total Time</div>
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
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{scenario.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getScoreColor(result.score)} border-current`}>
                              {result.score}/{result.maxScore} ({getGradeFromScore(result.score)})
                            </Badge>
                            <Badge variant="outline">
                              {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2 text-sm">Metrics</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Eating Cycles:</span>
                                <span>{result.metrics.eatingCycles}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Deadlocks:</span>
                                <span className={result.metrics.deadlocks > 0 ? "text-red-600" : "text-green-600"}>
                                  {result.metrics.deadlocks}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2 text-sm">Feedback</h4>
                            <p className="text-sm text-muted-foreground">{result.feedback.detailedAnalysis}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Analytics Sub-Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Learning Analytics Dashboard
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-600 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Detailed analytics for instructors to track student progress and identify learning gaps.</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Detailed analytics for instructors to track student progress and identify learning gaps.
                </p>
              </CardHeader>
              <CardContent>
                {evaluationResults.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    Complete some evaluation scenarios to see your learning analytics
                  </p>
                ) : (
                  <div className="space-y-6">
                    {/* Performance by Difficulty */}
                    <div>
                      <h4 className="font-semibold mb-3">Performance by Difficulty</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {["beginner", "intermediate", "advanced"].map((diff) => {
                          const diffResults = evaluationResults.filter(r => {
                            const scenario = PREDEFINED_SCENARIOS.find(s => s.id === r.scenarioId)
                            return scenario?.difficulty === diff
                          })
                          const avgScore = diffResults.length > 0
                            ? Math.round(diffResults.reduce((a, r) => a + r.score, 0) / diffResults.length)
                            : 0
                          return (
                            <Card key={diff} className={getDifficultyColor(diff)}>
                              <CardContent className="p-4 text-center">
                                <div className="text-xl font-bold">{avgScore}%</div>
                                <div className="text-sm capitalize">{diff}</div>
                                <div className="text-xs text-muted-foreground">{diffResults.length} completed</div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>

                    {/* Areas for Improvement */}
                    <div>
                      <h4 className="font-semibold mb-3 text-orange-700">Common Areas for Improvement</h4>
                      <ul className="list-disc list-inside text-sm text-orange-600 space-y-1">
                        {Array.from(new Set(evaluationResults.flatMap(r => r.feedback.improvements))).slice(0, 5).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
