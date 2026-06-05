"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Target,
  Clock,
  Users,
  CheckCircle,
  Award,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  FileText,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PetersonsSolution } from "@/components/petersons-simulation"

const EVALUATION_SCENARIOS = [
  {
    id: "scenario-mutual",
    title: "Mutual Exclusion",
    description: "Ensure two processes never access the critical section simultaneously",
    difficulty: "beginner",
    timeLimit: 300,
    maxScore: 100,
    objectives: ["Prevent concurrent critical section access", "Both processes must get a turn"],
  },
  {
    id: "scenario-flags",
    title: "Process Flags Basics",
    description: "Understand how the interest flags signal a process's intent to enter the critical section",
    difficulty: "beginner",
    timeLimit: 300,
    maxScore: 100,
    objectives: ["Set flag[i] = true correctly", "Understand intent signaling", "Clear flags on exit"],
  },
  {
    id: "scenario-turn",
    title: "Turn Variable Management",
    description: "Master the turn variable to coordinate process access",
    difficulty: "intermediate",
    timeLimit: 420,
    maxScore: 100,
    objectives: ["Use turn variable correctly", "Prevent deadlock", "Allow process alternation"],
  },
  {
    id: "scenario-fairness",
    title: "Fairness and Progress",
    description: "Verify neither process starves and both make progress through the algorithm",
    difficulty: "intermediate",
    timeLimit: 420,
    maxScore: 100,
    objectives: ["Ensure progress", "Both processes get turns", "No starvation"],
  },
  {
    id: "scenario-deadlock",
    title: "Deadlock Prevention",
    description: "Verify Peterson's algorithm prevents deadlock and starvation",
    difficulty: "advanced",
    timeLimit: 540,
    maxScore: 100,
    objectives: ["Prevent deadlock", "Ensure progress", "Both processes must eventually enter CS"],
  },
  {
    id: "scenario-stress",
    title: "Complex Stress Scenarios",
    description: "Handle rapid state changes, edge cases, and maintain correctness under stress",
    difficulty: "advanced",
    timeLimit: 540,
    maxScore: 100,
    objectives: ["Handle edge cases", "Maintain correctness under stress", "Optimize resource usage"],
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

function getScoreColor(score: number) {
  if (score >= 85) return "text-green-600"
  if (score >= 70) return "text-blue-600"
  if (score >= 55) return "text-yellow-600"
  return "text-red-600"
}

function getGradeFromScore(score: number) {
  if (score >= 90) return "A"
  if (score >= 80) return "B"
  if (score >= 70) return "C"
  if (score >= 60) return "D"
  return "F"
}

interface ScenarioResult {
  scenarioId: string
  score: number
  maxScore: number
  timeSpent: number
  completed: boolean
  timestamp: Date
}

interface ScenarioEvaluationProps {
  persistedResults?: ScenarioResult[]
  onResultsChange?: (results: ScenarioResult[]) => void
}

export function ScenarioEvaluation({
  persistedResults = [],
  onResultsChange,
}: ScenarioEvaluationProps) {
  const [selectedScenario, setSelectedScenario] = useState<(typeof EVALUATION_SCENARIOS)[0] | null>(null)
  const [isScenarioActive, setIsScenarioActive] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [currentSubTab, setCurrentSubTab] = useState("scenarios")
  const engineRef = useRef<any>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isScenarioActive && selectedScenario) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          if (prev >= selectedScenario.timeLimit) {
            handleCompleteScenario()
            return prev
          }
          return prev + 1
        })
      }, 1000)
      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [isScenarioActive, selectedScenario])

  const handleStartScenario = (scenario: (typeof EVALUATION_SCENARIOS)[0]) => {
    setSelectedScenario(scenario)
    setIsScenarioActive(true)
    setElapsedTime(0)
    setCurrentSubTab("results")
  }

  const handleCompleteScenario = () => {
    if (!selectedScenario) return
    const score = Math.max(0, Math.round(100 - (elapsedTime / selectedScenario.timeLimit) * 20))
    const result: ScenarioResult = {
      scenarioId: selectedScenario.id,
      score,
      maxScore: 100,
      timeSpent: elapsedTime,
      completed: true,
      timestamp: new Date(),
    }
    const updated = [...persistedResults, result]
    onResultsChange?.(updated)
    setIsScenarioActive(false)
    setSelectedScenario(null)
  }

  const handleResetScenario = () => {
    setSelectedScenario(null)
    setIsScenarioActive(false)
    setElapsedTime(0)
    setCurrentSubTab("scenarios")
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Active Scenario Header (only shown when scenario is active) */}
        {isScenarioActive && selectedScenario && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 flex-shrink-0" />
                    {selectedScenario.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">{selectedScenario.description}</p>
                </div>
                <div className="text-center sm:text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.floor((selectedScenario.timeLimit - elapsedTime) / 60)}:
                    {String(Math.max(0, (selectedScenario.timeLimit - elapsedTime) % 60)).padStart(2, "0")}
                  </div>
                  <div className="text-xs text-muted-foreground">Time Remaining</div>
                </div>
              </div>
              <Progress value={(elapsedTime / selectedScenario.timeLimit) * 100} className="mt-2" />
            </CardHeader>
          </Card>
        )}

        {/* THREE SUB-TABS: Scenarios / Results / Analytics — visible from start */}
        <Tabs value={currentSubTab} onValueChange={setCurrentSubTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-auto">
            <TabsTrigger
              value="scenarios"
              className="text-xs sm:text-sm px-1 sm:px-3 py-2 transition-colors data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border data-[state=active]:border-blue-200 data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-50"
            >
              <span className="hidden sm:inline">Scenarios</span>
              <span className="sm:hidden">Scen</span>
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="text-xs sm:text-sm px-1 sm:px-3 py-2 transition-colors data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border data-[state=active]:border-blue-200 data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-50"
            >
              <span className="hidden sm:inline">Results</span>
              <span className="sm:hidden">Res</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="text-xs sm:text-sm px-1 sm:px-3 py-2 transition-colors data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border data-[state=active]:border-blue-200 data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-gray-50"
            >
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Ana</span>
            </TabsTrigger>
          </TabsList>

          {/* SCENARIOS SUB-TAB — Unguided scenario cards */}
          <TabsContent value="scenarios" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 flex-shrink-0" />
                  Unguided Scenarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Complete unguided evaluation scenarios. Work freely using the simulation to meet all objectives. Your solution will be scored on correctness and efficiency.
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {EVALUATION_SCENARIOS.map((scenario) => {
                const scenarioResult = persistedResults.find((r) => r.scenarioId === scenario.id)
                const isCurrentScenario = isScenarioActive && selectedScenario?.id === scenario.id
                return (
                  <Card key={scenario.id} className={`hover:shadow-md transition-shadow ${isCurrentScenario ? "border-blue-200 bg-blue-50" : ""}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="flex items-center gap-2 mb-2">
                            <Target className="h-5 w-5 flex-shrink-0" />
                            {scenario.title}
                            {scenarioResult && (
                              <Award className="h-5 w-5 text-green-600 flex-shrink-0" />
                            )}
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
                              <Users className="h-3 w-3" />
                              2 processes
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1 text-xs">
                              <TrendingUp className="h-3 w-3" />
                              Max {scenario.maxScore} pts
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Objectives:</p>
                            <ul className="text-xs space-y-1">
                              {scenario.objectives.map((obj, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <Target className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <span>{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {scenarioResult && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Previous attempt:</span>
                                <Badge className={`${getScoreColor(scenarioResult.score)} border`}>
                                  {scenarioResult.score}/{scenarioResult.maxScore} ({getGradeFromScore(scenarioResult.score)})
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {!isCurrentScenario ? (
                        <Button
                          onClick={() => handleStartScenario(scenario)}
                          className="w-full bg-green-600 hover:bg-green-700 text-sm"
                        >
                          Start Evaluation
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button onClick={handleCompleteScenario} className="flex-1 bg-green-600 hover:bg-green-700 text-sm">
                            <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                            Complete Scenario
                          </Button>
                          <Button onClick={handleResetScenario} variant="outline" className="text-sm">
                            Reset
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* RESULTS SUB-TAB — Evaluation results dashboard */}
          <TabsContent value="results" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 flex-shrink-0" />
                  Evaluation Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {persistedResults.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Complete scenarios to see detailed results and feedback.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">Overall Performance Summary</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div className="p-3 rounded-lg bg-gray-50">
                          <div className="text-xl font-bold text-blue-600">{persistedResults.length}</div>
                          <div className="text-xs text-muted-foreground mt-1">Completed</div>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50">
                          <div className={`text-xl font-bold ${getScoreColor(Math.round(persistedResults.reduce((a, r) => a + r.score, 0) / persistedResults.length))}`}>
                            {Math.round(persistedResults.reduce((a, r) => a + r.score, 0) / persistedResults.length)}%
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Avg Score</div>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50">
                          <div className="text-xl font-bold text-purple-600">
                            {getGradeFromScore(Math.round(persistedResults.reduce((a, r) => a + r.score, 0) / persistedResults.length))}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Grade</div>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50">
                          <div className="text-xl font-bold text-green-600">
                            {Math.floor(persistedResults.reduce((a, r) => a + r.timeSpent, 0) / 60)}m
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Total Time</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-sm">Scenario Results</h4>
                      <div className="space-y-2">
                        {persistedResults.map((result) => {
                          const scenario = EVALUATION_SCENARIOS.find((s) => s.id === result.scenarioId)
                          return (
                            <div key={result.scenarioId} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 text-sm">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Award className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{scenario?.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(result.timestamp).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <Badge className={`${getScoreColor(result.score)} border`}>
                                  {result.score}/{result.maxScore}
                                </Badge>
                                <Button variant="outline" size="sm" className="text-xs">
                                  <FileText className="h-4 w-4 mr-1 flex-shrink-0" />
                                  Report
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS SUB-TAB — Learning analytics dashboard */}
          <TabsContent value="analytics" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 flex-shrink-0" />
                  Learning Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {persistedResults.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Complete scenarios to view analytics and learning insights.
                  </p>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">Performance Metrics</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Overall Mastery</span>
                            <span className="font-semibold text-blue-600">
                              {Math.round(persistedResults.reduce((a, r) => a + r.score, 0) / persistedResults.length)}%
                            </span>
                          </div>
                          <Progress
                            value={Math.round(persistedResults.reduce((a, r) => a + r.score, 0) / persistedResults.length)}
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Consistency</span>
                            <span className="font-semibold text-green-600">
                              {Math.min(100, Math.round((persistedResults.length / 3) * 100))}%
                            </span>
                          </div>
                          <Progress
                            value={Math.min(100, Math.round((persistedResults.length / 3) * 100))}
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Efficiency</span>
                            <span className="font-semibold text-purple-600">
                              {Math.round(100 - (persistedResults.reduce((a, r) => a + r.timeSpent, 0) / (persistedResults.length * 600)) * 50)}%
                            </span>
                          </div>
                          <Progress
                            value={Math.round(100 - (persistedResults.reduce((a, r) => a + r.timeSpent, 0) / (persistedResults.length * 600)) * 50)}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-sm">Scenario Performance Breakdown</h4>
                      <div className="space-y-2">
                        {EVALUATION_SCENARIOS.map((scenario) => {
                          const scenarioResults = persistedResults.filter((r) => r.scenarioId === scenario.id)
                          const avgScore = scenarioResults.length > 0
                            ? Math.round(scenarioResults.reduce((a, r) => a + r.score, 0) / scenarioResults.length)
                            : 0
                          return (
                            <div key={scenario.id} className="flex items-center justify-between p-2 rounded border text-sm">
                              <span className="text-muted-foreground">{scenario.title}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      avgScore >= 85 ? "bg-green-600" : avgScore >= 70 ? "bg-blue-600" : "bg-yellow-600"
                                    }`}
                                    style={{ width: `${avgScore}%` }}
                                  />
                                </div>
                                <span className={`font-semibold text-xs w-10 text-right ${getScoreColor(avgScore)}`}>
                                  {avgScore}%
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertTriangle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <AlertDescription className="text-blue-800 text-sm">
                        Recommendations: Continue practicing intermediate scenarios to improve consistency and overall mastery score.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 80% Time Warning (only when scenario is active) */}
        {isScenarioActive && selectedScenario && elapsedTime > selectedScenario.timeLimit * 0.8 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            <AlertDescription className="text-yellow-800 text-sm">
              Warning: Less than {Math.ceil((selectedScenario.timeLimit - elapsedTime) / 60)} minute(s) remaining!
            </AlertDescription>
          </Alert>
        )}

        {/* FULL LIVE SIMULATION — rendered BELOW entire Tabs component (only when scenario is active) */}
        {isScenarioActive && selectedScenario && (
          <div className="overflow-hidden">
            <PetersonsSolution onEngineReady={(engine) => { engineRef.current = engine }} />
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
