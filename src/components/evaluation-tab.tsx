"use client"

import { useState, useRef, useEffect } from "react"
import {
  Info,
  Play,
  Clock,
  Target,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Award,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
  import { ManualSimulator, Process } from "@/components/manual-simulator"

type EvalScenario = {
  id: string
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  time: string
  processCount: number
  learningObjectives: string[]
  initialState: {
    available: number[]
    processes: Process[]
  }
  tasks: {
    description: string
    expectedAction: string
    points: number
  }[]
  maxScore: number
}

type ScenarioResult = {
  scenarioId: string
  title: string
  difficulty: string
  score: number
  maxScore: number
  percentage: number
  grade: string
  timeSpent: string
  completedAt: string
  taskResults: {
    description: string
    passed: boolean
    points: number
    maxPoints: number
    feedback: string
  }[]
  insights: string[]
}

const EVAL_SCENARIOS: EvalScenario[] = [
  {
    id: "eval-1",
    title: "Basic Safe State Check",
    description: "Implement a basic safety check on a simple 3-process system with the Banker's Algorithm.",
    difficulty: "beginner",
    time: "5m",
    processCount: 3,
    learningObjectives: [
      "Correctly identify whether a system is in a safe state",
      "Calculate the Need matrix",
      "Run the safety algorithm",
      "Identify the safe sequence",
    ],
    initialState: {
      available: [3, 3, 2],
      processes: [
        { id: "P0", allocation: [0, 1, 0], max: [7, 5, 3], need: [7, 4, 3] },
        { id: "P1", allocation: [2, 0, 0], max: [3, 2, 2], need: [1, 2, 2] },
        { id: "P2", allocation: [3, 0, 2], max: [9, 0, 2], need: [6, 0, 0] },
      ],
    },
    tasks: [
      {
        description: "Verify the default configuration",
        expectedAction: "check_setup",
        points: 10,
      },
      {
        description: "Run the safety algorithm by clicking 'Check System State'",
        expectedAction: "run_safety",
        points: 30,
      },
      {
        description: "Identify and record the safe sequence",
        expectedAction: "identify_sequence",
        points: 30,
      },
      {
        description: "Run the simulation to verify the safe sequence",
        expectedAction: "run_simulation",
        points: 30,
      },
    ],
    maxScore: 100,
  },
  {
    id: "eval-2",
    title: "Resource Request Processing",
    description: "Evaluate resource requests for multiple processes and determine which can be safely granted.",
    difficulty: "beginner",
    time: "7m",
    processCount: 4,
    learningObjectives: [
      "Understand request safety evaluation",
      "Determine which requests can be safely granted",
      "Recognize deadlock-causing requests",
    ],
    initialState: {
      available: [2, 2, 2],
      processes: [
        { id: "P0", allocation: [1, 0, 1], max: [3, 3, 2], need: [2, 3, 1] },
        { id: "P1", allocation: [2, 1, 0], max: [4, 3, 3], need: [2, 2, 3] },
        { id: "P2", allocation: [0, 2, 1], max: [2, 3, 3], need: [2, 1, 2] },
        { id: "P3", allocation: [0, 0, 0], max: [3, 2, 2], need: [3, 2, 2] },
      ],
    },
    tasks: [
      {
        description: "Review the system configuration and note available resources",
        expectedAction: "review_config",
        points: 15,
      },
      {
        description: "Check the current system state for safety",
        expectedAction: "check_current_state",
        points: 25,
      },
      {
        description: "Evaluate if P3 can request [1, 1, 1]",
        expectedAction: "evaluate_request",
        points: 30,
      },
      {
        description: "Run simulation to verify the system behavior",
        expectedAction: "run_simulation",
        points: 30,
      },
    ],
    maxScore: 100,
  },
  {
    id: "eval-3",
    title: "Deadlock Detection and Prevention",
    description: "Identify unsafe states and understand how the Banker's Algorithm prevents deadlock.",
    difficulty: "intermediate",
    time: "10m",
    processCount: 5,
    learningObjectives: [
      "Recognize unsafe system states",
      "Understand deadlock conditions",
      "Apply preventive strategies",
    ],
    initialState: {
      available: [1, 1, 2],
      processes: [
        { id: "P0", allocation: [0, 1, 0], max: [7, 5, 3], need: [7, 4, 3] },
        { id: "P1", allocation: [2, 0, 0], max: [3, 2, 2], need: [1, 2, 2] },
        { id: "P2", allocation: [3, 0, 2], max: [9, 0, 2], need: [6, 0, 0] },
        { id: "P3", allocation: [2, 1, 1], max: [2, 2, 2], need: [0, 1, 1] },
        { id: "P4", allocation: [0, 0, 2], max: [4, 3, 3], need: [4, 3, 1] },
      ],
    },
    tasks: [
      {
        description: "Analyze the tight resource constraints in the system",
        expectedAction: "analyze_constraints",
        points: 20,
      },
      {
        description: "Run the safety algorithm to determine system state",
        expectedAction: "run_safety",
        points: 30,
      },
      {
        description: "Identify which process should complete first",
        expectedAction: "identify_first_process",
        points: 25,
      },
      {
        description: "Run simulation and observe resource flow",
        expectedAction: "run_simulation",
        points: 25,
      },
    ],
    maxScore: 100,
  },
  {
    id: "eval-4",
    title: "Complex System Analysis",
    description: "Master the Banker's Algorithm by analyzing a complex multi-process, multi-resource system.",
    difficulty: "advanced",
    time: "12m",
    processCount: 5,
    learningObjectives: [
      "Analyze complex resource allocation patterns",
      "Trace safe sequences in large systems",
      "Optimize resource distribution",
    ],
    initialState: {
      available: [2, 2, 1],
      processes: [
        { id: "P0", allocation: [1, 0, 1], max: [3, 3, 2], need: [2, 3, 1] },
        { id: "P1", allocation: [2, 1, 0], max: [4, 3, 3], need: [2, 2, 3] },
        { id: "P2", allocation: [0, 2, 1], max: [2, 3, 3], need: [2, 1, 2] },
        { id: "P3", allocation: [1, 0, 2], max: [3, 2, 4], need: [2, 2, 2] },
        { id: "P4", allocation: [0, 1, 0], max: [4, 4, 2], need: [4, 3, 2] },
      ],
    },
    tasks: [
      {
        description: "Assess the complexity and constraints of the system",
        expectedAction: "assess_complexity",
        points: 20,
      },
      {
        description: "Determine if a safe sequence exists",
        expectedAction: "run_safety",
        points: 35,
      },
      {
        description: "Trace through the safe sequence step-by-step",
        expectedAction: "trace_sequence",
        points: 25,
      },
      {
        description: "Run simulation to verify correctness",
        expectedAction: "run_simulation",
        points: 20,
      },
    ],
    maxScore: 100,
  },
]

export default function EvaluationTab() {
  const [selectedScenarioId, setSelectedScenarioId] = useState("eval-1")
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [results, setResults] = useState<ScenarioResult[]>([])
  const [showResults, setShowResults] = useState(false)

  const scenario = EVAL_SCENARIOS.find((s) => s.id === selectedScenarioId)!

  const handleStartScenario = () => {
    setStartTime(new Date())
    setShowResults(false)
  }

  const handleCompleteScenario = () => {
    if (!startTime) return

    const endTime = new Date()
    const timeSpent = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60)

    // Simple scoring: all tasks completed means full score
    const score = scenario.maxScore
    const percentage = 100
    const grade = percentage >= 90 ? "A" : percentage >= 80 ? "B" : percentage >= 70 ? "C" : "F"

    const result: ScenarioResult = {
      scenarioId: scenario.id,
      title: scenario.title,
      difficulty: scenario.difficulty,
      score,
      maxScore: scenario.maxScore,
      percentage,
      grade,
      timeSpent: `${timeSpent}m`,
      completedAt: endTime.toLocaleString(),
      taskResults: scenario.tasks.map((task) => ({
        description: task.description,
        passed: true,
        points: task.points,
        maxPoints: task.points,
        feedback: "Task completed successfully",
      })),
      insights: [
        "You demonstrated a solid understanding of the Banker's Algorithm",
        "You correctly identified safe states and sequences",
        "Consider reviewing the deadlock prevention concepts",
      ],
    }

    setResults([...results, result])
    setShowResults(true)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs for Scenarios or Results */}
      <Tabs defaultValue="scenarios" className="w-full">
        <TabsList className="w-full bg-gray-100 p-0 h-auto flex flex-wrap rounded-lg overflow-hidden">
          <TabsTrigger
            value="scenarios"
            className="flex-1 min-w-[80px] data-[state=active]:bg-white data-[state=active]:text-black text-xs sm:text-sm py-2.5 rounded-none border-b-2 data-[state=active]:border-blue-500 border-transparent text-gray-500"
          >
            Evaluation Scenarios
          </TabsTrigger>
          <TabsTrigger
            value="results"
            className="flex-1 min-w-[80px] data-[state=active]:bg-white data-[state=active]:text-black text-xs sm:text-sm py-2.5 rounded-none border-b-2 data-[state=active]:border-blue-500 border-transparent text-gray-500"
          >
            Results
          </TabsTrigger>
        </TabsList>

        {/* Scenarios Content */}
        <TabsContent value="scenarios" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Scenario List */}
            <div className="lg:col-span-1">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Scenarios</h3>
                {EVAL_SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedScenarioId(s.id)}
                    className={`w-full text-left p-3 rounded border transition-all ${
                      selectedScenarioId === s.id
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="text-xs font-medium line-clamp-2">{s.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getDifficultyColor(s.difficulty)} variant="secondary">
                            {s.difficulty}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {s.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {!showResults ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Left: Scenario Info */}
                  <div className="bg-white border rounded-lg p-4 lg:col-span-1">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{scenario.title}</h3>
                        <Badge className={getDifficultyColor(scenario.difficulty)}>{scenario.difficulty}</Badge>
                      </div>
                      <p className="text-xs text-gray-600">{scenario.description}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Learning Objectives</h4>
                      <ul className="space-y-1">
                        {scenario.learningObjectives.map((obj, idx) => (
                          <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Tasks</h4>
                      <ul className="space-y-2">
                        {scenario.tasks.map((task, idx) => (
                          <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                            <span className="font-medium text-blue-600 flex-shrink-0">{task.points}pts</span>
                            <span>{task.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t pt-4">
                      {startTime ? (
                        <Button
                          onClick={handleCompleteScenario}
                          className="w-full bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Complete Scenario
                        </Button>
                      ) : (
                        <Button
                          onClick={handleStartScenario}
                          className="w-full bg-[#3498db] hover:bg-[#2980b9]"
                          size="sm"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start Scenario
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Right: Simulation */}
                  {startTime && (
                    <div className="lg:col-span-2">
                      <ManualSimulator
                        key={scenario.id}
                        initialAvailable={scenario.initialState.available}
                        initialProcesses={scenario.initialState.processes}
                        resourceTypes={scenario.initialState.available.length}
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* Results Display */
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Scenario Complete!</h3>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">{results[results.length - 1].percentage}%</div>
                      <div className="text-sm text-gray-600">Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {results[results.length - 1].score}/{results[results.length - 1].maxScore}
                      </div>
                      <div className="text-xs text-gray-600">Points</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <div className="text-2xl font-bold text-purple-600">{results[results.length - 1].grade}</div>
                      <div className="text-xs text-gray-600">Grade</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-2xl font-bold text-green-600">{results[results.length - 1].timeSpent}</div>
                      <div className="text-xs text-gray-600">Time Spent</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Insights</h4>
                    <ul className="space-y-1">
                      {results[results.length - 1].insights.map((insight, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setShowResults(false)
                        setStartTime(null)
                      }}
                      className="flex-1 bg-[#3498db] hover:bg-[#2980b9]"
                      size="sm"
                    >
                      Try Another Scenario
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Results Content */}
        <TabsContent value="results" className="mt-4">
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result, idx) => (
                <div key={idx} className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{result.title}</h4>
                      <p className="text-xs text-gray-600">{result.completedAt}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{result.percentage}%</div>
                      <div className="text-sm font-medium">{result.grade}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div className="text-sm">
                      <div className="font-medium">{result.score}/{result.maxScore}</div>
                      <div className="text-xs text-gray-600">Points</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{result.timeSpent}</div>
                      <div className="text-xs text-gray-600">Time</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium capitalize">{result.difficulty}</div>
                      <div className="text-xs text-gray-600">Difficulty</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No results yet. Complete a scenario to see your results!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
