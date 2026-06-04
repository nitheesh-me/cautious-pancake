"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Circle, AlertCircle, Lightbulb } from "lucide-react"

type PhilosopherState = "thinking" | "hungry" | "eating"

interface Philosopher {
  id: number
  name: string
  state: PhilosopherState
  leftChopstick: number | null
  rightChopstick: number | null
  eatingCount: number
}

interface Chopstick {
  id: number
  state: "available" | "taken"
  heldBy: number | null
}

type TutorialStep = {
  id: number
  title: string
  description: string
  objective: string
  hint: string
  validation: (
    philosophers: Philosopher[],
    chopsticks: Chopstick[],
    actionLog: string[],
  ) => {
    isComplete: boolean
    feedback: string
  }
}

const tutorials: TutorialStep[] = [
  {
    id: 1,
    title: "Understanding Process States",
    description: "Learn about the different states a philosopher can be in and how to transition between them.",
    objective: "Click on Philosopher 1 (the thinking philosopher) to make them hungry",
    hint: "Click directly on the thinking (gray) philosopher to change their state to hungry.",
    validation: (philosophers, chopsticks, actionLog) => {
      const phil1 = philosophers[0]
      if (phil1?.state === "hungry") {
        return {
          isComplete: true,
          feedback: "Great! Philosopher 1 is now hungry and ready to pick up chopsticks.",
        }
      }
      return {
        isComplete: false,
        feedback: "Click on Philosopher 1 to make them hungry.",
      }
    },
  },
  {
    id: 2,
    title: "Acquiring Resources",
    description: "Learn how to pick up chopsticks to acquire the resources needed for eating.",
    objective: "Click on the blue chopstick to the left of Philosopher 1 to pick it up",
    hint: "Chopsticks turn blue when available. Click on Philosopher 1's left chopstick (Chopstick 1).",
    validation: (philosophers, chopsticks, actionLog) => {
      const phil1 = philosophers[0]
      if (phil1?.leftChopstick !== null) {
        return {
          isComplete: true,
          feedback: "Excellent! Philosopher 1 has picked up their left chopstick. Notice the chopstick turned red.",
        }
      }
      return {
        isComplete: false,
        feedback: "Click on the left chopstick (blue) next to Philosopher 1.",
      }
    },
  },
  {
    id: 3,
    title: "Complete Resource Acquisition",
    description: "A philosopher needs both chopsticks to eat. Let's pick up the second chopstick.",
    objective: "Click on Philosopher 1's right chopstick (Chopstick 5) to pick it up",
    hint: "Look for the blue chopstick to the right of Philosopher 1 and click on it.",
    validation: (philosophers, chopsticks, actionLog) => {
      const phil1 = philosophers[0]
      if (phil1?.leftChopstick !== null && phil1?.rightChopstick !== null) {
        return {
          isComplete: true,
          feedback:
            "Perfect! Philosopher 1 now has both chopsticks and is eating. Notice the green state and both red chopsticks.",
        }
      }
      return {
        isComplete: false,
        feedback: "Click on the right chopstick (blue) next to Philosopher 1.",
      }
    },
  },
  {
    id: 4,
    title: "Releasing Resources",
    description: "After eating, philosophers must release their chopsticks so others can use them.",
    objective: "Click on Philosopher 1 (now eating) to finish eating and release chopsticks",
    hint: "Click directly on the eating (green) philosopher to make them finish eating.",
    validation: (philosophers, chopsticks, actionLog) => {
      const phil1 = philosophers[0]
      if (phil1?.state === "thinking" && phil1?.eatingCount >= 1) {
        return {
          isComplete: true,
          feedback:
            "Great job! Philosopher 1 finished eating and released both chopsticks. They're now thinking again.",
        }
      }
      return {
        isComplete: false,
        feedback: "Click on Philosopher 1 while they're eating to finish and release chopsticks.",
      }
    },
  },
  {
    id: 5,
    title: "Understanding Deadlock",
    description: "Create a deadlock scenario where all philosophers are waiting for resources.",
    objective: "Make all 5 philosophers hungry, then have each pick up only their LEFT chopstick",
    hint: "Click each philosopher to make them hungry, then click each left chopstick. Order matters!",
    validation: (philosophers, chopsticks, actionLog) => {
      const allHungryWithOneChopstick = philosophers.every(
        (p) => (p.state === "hungry" || p.state === "eating") && p.leftChopstick !== null && p.rightChopstick === null,
      )
      if (allHungryWithOneChopstick) {
        return {
          isComplete: true,
          feedback:
            "You've created a deadlock! All philosophers are holding one chopstick and waiting for another. This is a circular wait condition.",
        }
      }
      return {
        isComplete: false,
        feedback: "Make all philosophers hungry, then have each pick up their left chopstick only.",
      }
    },
  },
]

export function InteractiveManualGuide() {
  const [currentStep, setCurrentStep] = useState(0)
  const [philosophers, setPhilosophers] = useState<Philosopher[]>([])
  const [chopsticks, setChopsticks] = useState<Chopstick[]>([])
  const [actionLog, setActionLog] = useState<string[]>([])
  const [showHint, setShowHint] = useState(false)
  const [stepComplete, setStepComplete] = useState(false)
  const [feedback, setFeedback] = useState("")

  const tutorial = tutorials[currentStep]

  // Initialize state
  useEffect(() => {
    resetTutorial()
  }, [])

  // Check validation whenever state changes
  useEffect(() => {
    if (tutorial && philosophers.length > 0) {
      const result = tutorial.validation(philosophers, chopsticks, actionLog)
      setStepComplete(result.isComplete)
      setFeedback(result.feedback)
    }
  }, [philosophers, chopsticks, actionLog, tutorial])

  const resetTutorial = () => {
    const initialPhilosophers: Philosopher[] = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: `Philosopher ${i + 1}`,
      state: "thinking",
      leftChopstick: null,
      rightChopstick: null,
      eatingCount: 0,
    }))

    const initialChopsticks: Chopstick[] = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      state: "available",
      heldBy: null,
    }))

    setPhilosophers(initialPhilosophers)
    setChopsticks(initialChopsticks)
    setActionLog([])
    setShowHint(false)
    setStepComplete(false)
    setFeedback("")
  }

  const addLog = (message: string) => {
    setActionLog((prev) => [...prev, message])
  }

  const getPhilosopherChopsticks = (philosopherId: number) => {
    const leftChopstickId = philosopherId
    const rightChopstickId = (philosopherId - 1 + 5) % 5
    return { leftChopstickId, rightChopstickId }
  }

  const handlePhilosopherClick = (philosopherId: number) => {
    const philosopher = philosophers[philosopherId]

    if (philosopher.state === "thinking") {
      setPhilosophers((prev) => {
        const updated = [...prev]
        updated[philosopherId] = { ...updated[philosopherId], state: "hungry" }
        return updated
      })
      addLog(`${philosopher.name} is now hungry`)
    } else if (philosopher.state === "eating") {
      // Put down chopsticks
      if (philosopher.leftChopstick !== null) {
        setChopsticks((prev) => {
          const updated = [...prev]
          updated[philosopher.leftChopstick!] = {
            ...updated[philosopher.leftChopstick!],
            state: "available",
            heldBy: null,
          }
          return updated
        })
      }
      if (philosopher.rightChopstick !== null) {
        setChopsticks((prev) => {
          const updated = [...prev]
          updated[philosopher.rightChopstick!] = {
            ...updated[philosopher.rightChopstick!],
            state: "available",
            heldBy: null,
          }
          return updated
        })
      }

      setPhilosophers((prev) => {
        const updated = [...prev]
        updated[philosopherId] = {
          ...updated[philosopherId],
          state: "thinking",
          leftChopstick: null,
          rightChopstick: null,
        }
        return updated
      })
      addLog(`${philosopher.name} finished eating and is now thinking`)
    }
  }

  const handleChopstickClick = (chopstickId: number) => {
    const chopstick = chopsticks[chopstickId]

    if (chopstick.state === "available") {
      // Find which philosopher can pick this up
      const philosopherWhoCanPickUp = philosophers.find((p) => {
        const { leftChopstickId, rightChopstickId } = getPhilosopherChopsticks(p.id)
        return (
          p.state === "hungry" &&
          (leftChopstickId === chopstickId || rightChopstickId === chopstickId) &&
          (leftChopstickId === chopstickId ? p.leftChopstick === null : p.rightChopstick === null)
        )
      })

      if (philosopherWhoCanPickUp) {
        const { leftChopstickId, rightChopstickId } = getPhilosopherChopsticks(philosopherWhoCanPickUp.id)
        const isLeftChopstick = leftChopstickId === chopstickId

        setChopsticks((prev) => {
          const updated = [...prev]
          updated[chopstickId] = { ...updated[chopstickId], state: "taken", heldBy: philosopherWhoCanPickUp.id }
          return updated
        })

        setPhilosophers((prev) => {
          const updated = [...prev]
          const phil = { ...updated[philosopherWhoCanPickUp.id] }

          if (isLeftChopstick) {
            phil.leftChopstick = chopstickId
            addLog(`${phil.name} picked up left chopstick ${chopstickId + 1}`)
          } else {
            phil.rightChopstick = chopstickId
            addLog(`${phil.name} picked up right chopstick ${chopstickId + 1}`)
          }

          // Check if philosopher now has both chopsticks
          if (phil.leftChopstick !== null && phil.rightChopstick !== null) {
            phil.state = "eating"
            phil.eatingCount += 1
            addLog(`${phil.name} is now eating`)
          }

          updated[philosopherWhoCanPickUp.id] = phil
          return updated
        })
      }
    }
  }

  const getPosition = (index: number, total: number, radius: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2
    return {
      x: 150 + radius * Math.cos(angle),
      y: 150 + radius * Math.sin(angle),
    }
  }

  const getPhilosopherColor = (state: PhilosopherState) => {
    switch (state) {
      case "thinking":
        return "bg-gray-400"
      case "hungry":
        return "bg-yellow-400"
      case "eating":
        return "bg-green-500"
    }
  }

  const getChopstickColor = (state: "available" | "taken") => {
    return state === "available" ? "bg-blue-500" : "bg-red-500"
  }

  const nextStep = () => {
    if (currentStep < tutorials.length - 1) {
      setCurrentStep((prev) => prev + 1)
      resetTutorial()
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
      resetTutorial()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Tutorial Steps */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="p-4">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Guided Tutorial - Process Scheduling</h3>
            </div>
            <div className="flex gap-1">
              {tutorials.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => {
                    setCurrentStep(idx)
                    resetTutorial()
                  }}
                  className={`flex-1 h-1 rounded ${
                    idx === currentStep ? "bg-blue-600" : idx < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Step {currentStep + 1} of {tutorials.length}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-base mb-2">{tutorial.title}</h4>
              <p className="text-sm text-gray-600">{tutorial.description}</p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-start gap-2">
                <Circle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-900 mb-1">Objective</p>
                  <p className="text-xs text-blue-800">{tutorial.objective}</p>
                </div>
              </div>
            </div>

            {showHint && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-yellow-900 mb-1">Hint</p>
                    <p className="text-xs text-yellow-800">{tutorial.hint}</p>
                  </div>
                </div>
              </div>
            )}

            {!showHint && (
              <Button variant="outline" size="sm" onClick={() => setShowHint(true)} className="w-full">
                <Lightbulb className="w-4 h-4 mr-2" />
                Show Hint
              </Button>
            )}

            {feedback && (
              <div
                className={`p-3 border rounded ${
                  stepComplete ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  {stepComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  )}
                  <p className={`text-xs ${stepComplete ? "text-green-800" : "text-orange-800"}`}>{feedback}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={currentStep === 0}
                className="flex-1 bg-transparent"
              >
                Previous
              </Button>
              {stepComplete ? (
                <Button
                  onClick={nextStep}
                  disabled={currentStep === tutorials.length - 1}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {currentStep === tutorials.length - 1 ? "Complete" : "Next Step"}
                </Button>
              ) : (
                <Button onClick={resetTutorial} variant="outline" className="flex-1 bg-transparent">
                  Reset
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Quick Reference */}
        <Card className="p-4">
          <h4 className="font-semibold text-sm mb-3">Quick Reference Guide</h4>
          <div className="space-y-3 text-xs">
            <div>
              <p className="font-medium mb-1">Event Types:</p>
              <ul className="space-y-1 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                  <span>Thinking: Process is idle</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                  <span>Hungry: Process requests CPU</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span>Eating: Process is executing</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Key Actions:</p>
              <ul className="space-y-1 text-gray-600">
                <li>• Click philosopher to change state</li>
                <li>• Click blue chopstick to acquire</li>
                <li>• Both resources needed to execute</li>
                <li>• Release resources after executing</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Center Panel - Interactive Visualization */}
      <div className="lg:col-span-1">
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Process Scheduling Simulation</h3>
          <div className="relative w-[300px] h-[300px] mx-auto">
            {/* Philosophers */}
            {philosophers.map((philosopher, index) => {
              const position = getPosition(index, philosophers.length, 80)
              return (
                <button
                  key={philosopher.id}
                  onClick={() => handlePhilosopherClick(philosopher.id)}
                  className={`absolute w-12 h-12 rounded-full ${getPhilosopherColor(
                    philosopher.state,
                  )} flex items-center justify-center text-white text-xs font-bold shadow-lg hover:opacity-80 transition-opacity cursor-pointer`}
                  style={{
                    left: position.x,
                    top: position.y,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  P{philosopher.id + 1}
                </button>
              )
            })}

            {/* Chopsticks */}
            {chopsticks.map((chopstick, index) => {
              const position = getPosition(index, chopsticks.length, 50)
              return (
                <button
                  key={chopstick.id}
                  onClick={() => handleChopstickClick(chopstick.id)}
                  className={`absolute w-3 h-8 rounded-full ${getChopstickColor(
                    chopstick.state,
                  )} shadow-md hover:opacity-80 transition-opacity cursor-pointer`}
                  style={{
                    left: position.x,
                    top: position.y,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              )
            })}

            {/* Center Label */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-xs font-semibold text-gray-400">Resources</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
            <p className="font-medium mb-1">Legend:</p>
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Available
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                In Use
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Panel - Action Log */}
      <div className="lg:col-span-1">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Action Feed</h3>
            <Button variant="ghost" size="sm" onClick={() => setActionLog([])}>
              Clear
            </Button>
          </div>
          <div className="bg-gray-50 rounded p-3 h-[400px] overflow-y-auto">
            {actionLog.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No actions yet. Start interacting with the simulation.</p>
            ) : (
              <div className="space-y-1">
                {actionLog.map((log, idx) => (
                  <div key={idx} className="text-xs text-gray-700 border-b border-gray-200 pb-1">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
