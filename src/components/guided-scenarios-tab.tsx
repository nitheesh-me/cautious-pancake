"use client"

import { useState } from "react"
import { Play, ChevronLeft, ChevronRight, Target, Lightbulb, BookOpen, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ManualSimulator, Process } from "@/components/manual-simulator"

type Scenario = {
  id: string
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  time: string
  processCount: number
  stepsCount: number
  learningObjectives: string[]
  initialState: {
    available: number[]
    processes: Process[]
  }
  steps: {
    title: string
    instructions: string
    objective: string
    hint: string
    validation: string
    successMessage: string
  }[]
}

const SCENARIOS: Scenario[] = [
  {
    id: "scenario-1",
    title: "Basic Safe State Identification",
    description:
      "Learn the fundamentals of the Banker's Algorithm by identifying whether a simple system is in a safe state.",
    difficulty: "beginner",
    time: "~8m",
    processCount: 3,
    stepsCount: 4,
    learningObjectives: [
      "Understand the concept of a safe state",
      "Calculate the Need matrix from Max and Allocation",
      "Run the safety algorithm on a simple system",
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
    steps: [
      {
        title: "Review the Initial Configuration",
        instructions: "Observe the system configuration: 3 processes with 3 resource types. Available resources are [3, 3, 2].",
        objective: "Understand the initial system configuration and identify all resource values.",
        hint: "The Need matrix is pre-calculated as Max - Allocation. For P1: Need = [3,2,2] - [2,0,0] = [1,2,2].",
        validation: "Can you identify the Need values for all 3 processes?",
        successMessage: "Correct! You understand how Need is calculated from Max and Allocation.",
      },
      {
        title: "Run the Safety Algorithm",
        instructions: "Click 'Check System State'. Observe the action log to see which processes can complete first.",
        objective: "Execute the safety check and observe the algorithm's process.",
        hint: "The algorithm finds a process whose Need can be satisfied by Available resources. P1 needs [1,2,2] and Available is [3,3,2], so P1 can go first.",
        validation: "Did the system report a safe state?",
        successMessage: "The system is safe! The algorithm found a valid sequence.",
      },
      {
        title: "Understand the Safe Sequence",
        instructions: "Look at the safe sequence displayed. Trace through why each process is in that position.",
        objective: "Understand why the safe sequence is ordered the way it is.",
        hint: "After P1 completes, it releases [2,0,0] making Available = [5,3,2]. Now check which remaining process can proceed next.",
        validation: "Can you explain why each process appears in its position in the sequence?",
        successMessage: "Excellent! You understand how the safe sequence is determined step by step.",
      },
      {
        title: "Run the Simulation",
        instructions: "Click 'Simulate' to watch all processes execute in the safe sequence and complete successfully.",
        objective: "Observe processes completing in the safe sequence without deadlock.",
        hint: "Watch the simulation progress bar and the System Status section to see the sequence execute.",
        validation: "Did all processes complete in the safe sequence?",
        successMessage: "Perfect! You completed the first scenario successfully!",
      },
    ],
  },
  {
    id: "scenario-2",
    title: "Detecting Unsafe States",
    description: "Learn to identify when a system is in an unsafe state and understand the deadlock risk.",
    difficulty: "beginner",
    time: "~7m",
    processCount: 3,
    stepsCount: 3,
    learningObjectives: [
      "Recognize unsafe states",
      "Understand deadlock conditions",
      "Learn when the Banker's Algorithm denies requests",
    ],
    initialState: {
      available: [1, 2, 2],
      processes: [
        { id: "P0", allocation: [2, 1, 0], max: [4, 3, 2], need: [2, 2, 2] },
        { id: "P1", allocation: [1, 2, 1], max: [2, 3, 3], need: [1, 1, 2] },
        { id: "P2", allocation: [0, 1, 1], max: [3, 3, 3], need: [3, 2, 2] },
      ],
    },
    steps: [
      {
        title: "Observe an Unsafe System",
        instructions: "Review the configuration. Available resources are only [1, 2, 2] with 3 demanding processes.",
        objective: "Identify potential deadlock conditions in the system state.",
        hint: "Notice that Available [1,2,2] is insufficient to satisfy any process's Need. P0 needs [2,2,2], P1 needs [1,1,2], P2 needs [3,2,2].",
        validation: "Which process, if any, can complete with available resources?",
        successMessage: "Right! No process can complete, leading to deadlock.",
      },
      {
        title: "Run the Safety Algorithm",
        instructions: "Click 'Check System State'. The system should report an UNSAFE STATE.",
        objective: "See how the algorithm detects and reports unsafe states.",
        hint: "The algorithm tries to find any process that can complete. If it can't find one, it indicates deadlock.",
        validation: "Did the system correctly identify the unsafe state?",
        successMessage: "Excellent! You recognized the unsafe state.",
      },
      {
        title: "Understand the Risk",
        instructions: "Observe why this system cannot guarantee all processes will complete.",
        objective: "Learn why unsafe states lead to potential deadlock.",
        hint: "In unsafe states, there's no safe sequence. Any process allocation might leave others permanently blocked.",
        validation: "Why is this system state dangerous?",
        successMessage: "Perfect! You understand unsafe states and why the Banker's Algorithm prevents them.",
      },
    ],
  },
  {
    id: "scenario-3",
    title: "Complex Resource Management",
    description: "Work with a larger system involving multiple resource types and more complex allocation patterns.",
    difficulty: "intermediate",
    time: "~10m",
    processCount: 5,
    stepsCount: 3,
    learningObjectives: [
      "Manage complex multi-resource systems",
      "Trace through safety algorithms with multiple processes",
      "Understand resource bottlenecks",
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
    steps: [
      {
        title: "Analyze the Complex System",
        instructions: "Examine a system with 5 processes and 3 resource types. This is more realistic than simpler scenarios.",
        objective: "Understand how the Banker's Algorithm scales to more complex systems.",
        hint: "With 5 processes and only [1,1,2] available, resource allocation is tight. Some processes might need to complete before others can proceed.",
        validation: "Which process has the smallest Need?",
        successMessage: "Good observation! Finding processes with smaller needs is key to finding safe sequences.",
      },
      {
        title: "Run the Safety Algorithm",
        instructions: "Click 'Check System State' to find the safe sequence for this complex system.",
        objective: "See how the algorithm manages complex scenarios with multiple processes and resources.",
        hint: "The algorithm still uses the same principle: find processes that can complete with current Available, release their resources, and repeat.",
        validation: "Did the system find a safe sequence?",
        successMessage: "Excellent! Even complex systems can have safe sequences.",
      },
      {
        title: "Run the Simulation",
        instructions: "Start the simulation to watch how the complex system executes in the safe order.",
        objective: "Observe resource flow and process completion in a real system.",
        hint: "Pay attention to how Available resources grow as processes complete and release their allocations.",
        validation: "How does resource availability change as processes complete?",
        successMessage: "Perfect! You mastered managing complex resource systems!",
      },
    ],
  },
  {
    id: "scenario-4",
    title: "Resource Request Evaluation",
    description: "Understand how the Banker's Algorithm evaluates resource requests and prevents deadlock.",
    difficulty: "intermediate",
    time: "~9m",
    processCount: 4,
    stepsCount: 4,
    learningObjectives: [
      "Evaluate safety of resource requests",
      "Understand request approval/denial logic",
      "Learn dynamic resource allocation",
    ],
    initialState: {
      available: [3, 3, 2],
      processes: [
        { id: "P0", allocation: [0, 1, 0], max: [7, 5, 3], need: [7, 4, 3] },
        { id: "P1", allocation: [2, 0, 0], max: [3, 2, 2], need: [1, 2, 2] },
        { id: "P2", allocation: [3, 0, 2], max: [9, 0, 2], need: [6, 0, 0] },
        { id: "P3", allocation: [0, 0, 0], max: [4, 3, 3], need: [4, 3, 3] },
      ],
    },
    steps: [
      {
        title: "Understand Request Safety",
        instructions: "In this scenario, processes make resource requests. The Banker's Algorithm must evaluate if each request can be safely granted.",
        objective: "Learn how dynamic requests affect system safety.",
        hint: "A request is only granted if accepting it would keep the system in a safe state.",
        validation: "Why would some requests be denied even if resources are available?",
        successMessage: "Right! Requests are denied if they could lead to deadlock.",
      },
      {
        title: "Check Current System State",
        instructions: "Click 'Check System State' to determine if the system is currently safe.",
        objective: "Establish a baseline for system safety before any new requests.",
        hint: "The current allocations and available resources should allow at least some processes to complete.",
        validation: "What is the safe sequence for the current state?",
        successMessage: "Good! You have a baseline safe sequence.",
      },
      {
        title: "Analyze Request Scenarios",
        instructions: "Consider what would happen if P3 requests 1 unit of each resource type [1, 1, 1].",
        objective: "Predict whether the system would remain safe after the request.",
        hint: "After granting P3's request, Available becomes [2, 2, 1]. Would the system still have a safe sequence?",
        validation: "Would this request be safe to grant?",
        successMessage: "Excellent analysis! You can predict request outcomes.",
      },
      {
        title: "See the Logic in Action",
        instructions: "Use the simulation to verify your predictions about request handling.",
        objective: "Confirm that the Banker's Algorithm follows your analysis.",
        hint: "Watch the action log carefully as the system processes requests and decisions.",
        validation: "Does the actual behavior match your predictions?",
        successMessage: "Perfect! You understand resource request evaluation!",
      },
    ],
  },
  {
    id: "scenario-5",
    title: "Advanced Deadlock Prevention",
    description: "Master the Banker's Algorithm by solving a complex scenario with multiple tight resource constraints.",
    difficulty: "advanced",
    time: "~12m",
    processCount: 5,
    stepsCount: 4,
    learningObjectives: [
      "Solve complex resource allocation puzzles",
      "Optimize resource distribution",
      "Prevent deadlock in constrained systems",
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
    steps: [
      {
        title: "Assess the Critical System",
        instructions: "Examine a highly constrained system with 5 processes, limited resources [2,2,1], and demanding requirements.",
        objective: "Understand challenges in tightly constrained environments.",
        hint: "With only [2,2,1] available and all processes having needs, finding ANY safe sequence is challenging.",
        validation: "Estimate: Do you think a safe sequence exists for this system?",
        successMessage: "Your intuition was tested! Check the actual result.",
      },
      {
        title: "Execute the Safety Algorithm",
        instructions: "Click 'Check System State'. The algorithm will work hard to find if a safe sequence exists.",
        objective: "See advanced algorithm behavior on a difficult system.",
        hint: "The algorithm must carefully trace through all processes to find any valid ordering.",
        validation: "Did the algorithm find a safe sequence or detect deadlock?",
        successMessage: "Observe how the algorithm handled this complex scenario.",
      },
      {
        title: "Trace the Safe Sequence",
        instructions: "If a safe sequence was found, trace through it step-by-step. If not, understand why.",
        objective: "Deeply understand the algorithm's decision-making process.",
        hint: "Focus on which process can complete first with [2,2,1], then trace from there.",
        validation: "Can you manually verify the safe sequence correctness?",
        successMessage: "Advanced understanding! You can trace complex sequences.",
      },
      {
        title: "Simulate the Advanced Scenario",
        instructions: "Run the full simulation to watch the complex system execute.",
        objective: "Master the Banker's Algorithm through complete simulation.",
        hint: "Pay close attention to how Available resources fluctuate as processes complete.",
        validation: "Did all processes complete successfully?",
        successMessage: "Congratulations! You've mastered the Banker's Algorithm!",
      },
    ],
  },
]

export default function GuidedScenariosTab() {
  const [selectedScenarioId, setSelectedScenarioId] = useState("scenario-1")
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const scenario = SCENARIOS.find((s) => s.id === selectedScenarioId)!
  const currentStep = scenario.steps[currentStepIndex]

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
      {/* Scenarios List or Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Scenario List */}
        <div className="lg:col-span-1">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Scenarios</h3>
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedScenarioId(s.id)
                  setCurrentStepIndex(0)
                }}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Instructions */}
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

              {/* Step Content */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm mb-3">{currentStep.title}</h4>

                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-xs font-medium text-blue-900 mb-1">Instructions</h5>
                      <p className="text-xs text-blue-800">{currentStep.instructions}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-xs font-medium text-green-900 mb-1">Objective</h5>
                      <p className="text-xs text-green-800">{currentStep.objective}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded p-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-xs font-medium text-amber-900 mb-1">Hint</h5>
                      <p className="text-xs text-amber-800">{currentStep.hint}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Progress */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium">Step Progress</span>
                  <span className="text-xs text-gray-500">
                    {currentStepIndex + 1} / {scenario.steps.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#3498db] h-2 rounded-full transition-all"
                    style={{ width: `${((currentStepIndex + 1) / scenario.steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-2 mt-4">
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
                  onClick={() => setCurrentStepIndex(Math.min(scenario.steps.length - 1, currentStepIndex + 1))}
                  disabled={currentStepIndex === scenario.steps.length - 1}
                  size="sm"
                  className="flex-1 bg-[#3498db] hover:bg-[#2980b9]"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Right: Simulation */}
            <div className="lg:col-span-2">
              <ManualSimulator
                key={scenario.id}
                initialAvailable={scenario.initialState.available}
                initialProcesses={scenario.initialState.processes}
                resourceTypes={scenario.initialState.available.length}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
