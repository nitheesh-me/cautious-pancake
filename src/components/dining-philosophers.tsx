"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PhilosopherTable } from "./philosopher-table"
import { ActionLog } from "./action-log"
import { GuidedScenarios } from "./guided-scenarios"
import { Evaluation } from "./evaluation"
import { GuidedManual } from "./guided-manual"

export type PhilosopherState = "thinking" | "hungry" | "eating"
export type ChopstickState = "available" | "taken"

export interface Philosopher {
  id: number
  name: string
  state: PhilosopherState
  leftChopstick: number | null
  rightChopstick: number | null
  eatingCount: number
  thinkingTime: number
  eatingTime: number
}

export interface Chopstick {
  id: number
  state: ChopstickState
  heldBy: number | null
}

export function DiningPhilosophers() {
  const [philosophers, setPhilosophers] = useState<Philosopher[]>([])
  const [chopsticks, setChopsticks] = useState<Chopstick[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const simulationRef = useRef<NodeJS.Timeout | null>(null)
  const [activeTab, setActiveTab] = useState("simulation")
  const [deadlockDetected, setDeadlockDetected] = useState(false)
  const [starvationDetected, setStarvationDetected] = useState(false)
  const [simulationMode, setSimulationMode] = useState<"auto" | "manual">("manual")

  // Initialize philosophers and chopsticks
  useEffect(() => {
    initializeSimulation()
  }, [])

  const initializeSimulation = () => {
    const philosopherCount = 5
    const newPhilosophers: Philosopher[] = []
    const newChopsticks: Chopstick[] = []

    // Create philosophers
    for (let i = 0; i < philosopherCount; i++) {
      newPhilosophers.push({
        id: i,
        name: `Philosopher ${i + 1}`,
        state: "thinking",
        leftChopstick: null,
        rightChopstick: null,
        eatingCount: 0,
        thinkingTime: Math.floor(Math.random() * 5) + 3, // 3-7 seconds
        eatingTime: Math.floor(Math.random() * 3) + 2, // 2-4 seconds,
      })
    }

    // Create chopsticks
    for (let i = 0; i < philosopherCount; i++) {
      newChopsticks.push({
        id: i,
        state: "available",
        heldBy: null,
      })
    }

    setPhilosophers(newPhilosophers)
    setChopsticks(newChopsticks)
    setLogs(["Simulation initialized. All philosophers are thinking."])
    setDeadlockDetected(false)
    setStarvationDetected(false)
  }

  const addLog = (message: string) => {
    setLogs((prevLogs) => [...prevLogs, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const showAlertMessage = (message: string) => {
    setAlertMessage(message)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000)
  }

  // Get the correct chopstick IDs for a philosopher
  const getPhilosopherChopsticks = (philosopherId: number) => {
    const totalPhilosophers = philosophers.length
    // Left chopstick has the same ID as the philosopher
    const leftChopstickId = philosopherId
    // Right chopstick is the previous chopstick (or the last one for philosopher 0)
    const rightChopstickId = (philosopherId + totalPhilosophers - 1) % totalPhilosophers

    return { leftChopstickId, rightChopstickId }
  }

  const handleChopstickClick = (chopstickId: number) => {
    if (isSimulating) return

    const chopstick = chopsticks[chopstickId]

    if (chopstick.state === "available") {
      // Find philosophers who can pick up this chopstick
      let foundPhilosopher = false

      for (let i = 0; i < philosophers.length; i++) {
        const philosopher = philosophers[i]
        const { leftChopstickId, rightChopstickId } = getPhilosopherChopsticks(i)

        // Check if this philosopher can pick up this chopstick
        if (philosopher.state === "hungry") {
          if (leftChopstickId === chopstickId && philosopher.leftChopstick === null) {
            pickUpChopstickForPhilosopher(i, "left", chopstickId)
            foundPhilosopher = true
            break
          } else if (rightChopstickId === chopstickId && philosopher.rightChopstick === null) {
            pickUpChopstickForPhilosopher(i, "right", chopstickId)
            foundPhilosopher = true
            break
          }
        }
      }

      if (!foundPhilosopher) {
        showAlertMessage("No hungry philosopher can pick up this chopstick right now. Make a philosopher hungry first.")
      }
    } else {
      // If chopstick is taken, find who's holding it and put it down
      if (chopstick.heldBy !== null) {
        const philosopher = philosophers[chopstick.heldBy]

        if (philosopher.leftChopstick === chopstickId) {
          putDownChopstickForPhilosopher(chopstick.heldBy, "left")
        } else if (philosopher.rightChopstick === chopstickId) {
          putDownChopstickForPhilosopher(chopstick.heldBy, "right")
        }
      }
    }
  }

  const pickUpChopstickForPhilosopher = (philosopherId: number, side: "left" | "right", chopstickId: number) => {
    // First, check if the philosopher exists
    if (philosopherId < 0 || philosopherId >= philosophers.length) {
      console.error(`Invalid philosopher ID: ${philosopherId}`)
      return
    }

    // Get current state
    const philosopher = philosophers[philosopherId]

    // Check if philosopher is hungry
    if (philosopher.state !== "hungry") {
      showAlertMessage(`${philosopher.name} must be hungry to pick up chopsticks.`)
      return
    }

    // Check if chopstick is available
    if (chopsticks[chopstickId].state !== "available") {
      showAlertMessage(`Chopstick ${chopstickId + 1} is already taken.`)
      return
    }

    // Update chopstick state
    setChopsticks((prevChopsticks) => {
      const newChopsticks = [...prevChopsticks]
      newChopsticks[chopstickId] = {
        ...newChopsticks[chopstickId],
        state: "taken",
        heldBy: philosopherId,
      }
      return newChopsticks
    })

    // Update philosopher state
    setPhilosophers((prevPhilosophers) => {
      const newPhilosophers = [...prevPhilosophers]
      if (side === "left") {
        newPhilosophers[philosopherId] = {
          ...newPhilosophers[philosopherId],
          leftChopstick: chopstickId,
        }
        addLog(`${philosopher.name} picked up left chopstick ${chopstickId + 1}.`)
      } else {
        newPhilosophers[philosopherId] = {
          ...newPhilosophers[philosopherId],
          rightChopstick: chopstickId,
        }
        addLog(`${philosopher.name} picked up right chopstick ${chopstickId + 1}.`)
      }

      // Check if philosopher can now eat
      const updatedPhilosopher = newPhilosophers[philosopherId]
      if (updatedPhilosopher.leftChopstick !== null && updatedPhilosopher.rightChopstick !== null) {
        newPhilosophers[philosopherId] = {
          ...updatedPhilosopher,
          state: "eating",
          eatingCount: updatedPhilosopher.eatingCount + 1,
        }
        addLog(`${updatedPhilosopher.name} is eating (count: ${updatedPhilosopher.eatingCount + 1}).`)
      }

      return newPhilosophers
    })
  }

  const putDownChopstickForPhilosopher = (philosopherId: number, side: "left" | "right") => {
    // First, check if the philosopher exists
    if (philosopherId < 0 || philosopherId >= philosophers.length) {
      console.error(`Invalid philosopher ID: ${philosopherId}`)
      return
    }

    const philosopher = philosophers[philosopherId]
    const chopstickId = side === "left" ? philosopher.leftChopstick : philosopher.rightChopstick

    if (chopstickId === null) {
      showAlertMessage(`${philosopher.name} doesn't have a ${side} chopstick.`)
      return
    }

    // Update chopstick state
    setChopsticks((prevChopsticks) => {
      const newChopsticks = [...prevChopsticks]
      newChopsticks[chopstickId] = {
        ...newChopsticks[chopstickId],
        state: "available",
        heldBy: null,
      }
      return newChopsticks
    })

    // Update philosopher state
    setPhilosophers((prevPhilosophers) => {
      const newPhilosophers = [...prevPhilosophers]

      if (side === "left") {
        newPhilosophers[philosopherId] = {
          ...newPhilosophers[philosopherId],
          leftChopstick: null,
        }
        addLog(`${philosopher.name} put down left chopstick ${chopstickId + 1}.`)
      } else {
        newPhilosophers[philosopherId] = {
          ...newPhilosophers[philosopherId],
          rightChopstick: null,
        }
        addLog(`${philosopher.name} put down right chopstick ${chopstickId + 1}.`)
      }

      // If philosopher was eating and now has no chopsticks, start thinking again
      const updatedPhilosopher = newPhilosophers[philosopherId]
      if (
        updatedPhilosopher.state === "eating" &&
        updatedPhilosopher.leftChopstick === null &&
        updatedPhilosopher.rightChopstick === null
      ) {
        newPhilosophers[philosopherId] = {
          ...updatedPhilosopher,
          state: "thinking",
        }
        addLog(`${updatedPhilosopher.name} is thinking.`)
      }

      return newPhilosophers
    })
  }

  const pickUpChopsticks = (philosopherId: number) => {
    // First, check if the philosopher exists
    if (philosopherId < 0 || philosopherId >= philosophers.length) {
      console.error(`Invalid philosopher ID: ${philosopherId}`)
      return
    }

    // Get current state
    const philosopher = philosophers[philosopherId]
    const { leftChopstickId, rightChopstickId } = getPhilosopherChopsticks(philosopherId)

    // Philosopher becomes hungry if thinking
    if (philosopher.state === "thinking") {
      setPhilosophers((prevPhilosophers) => {
        const newPhilosophers = [...prevPhilosophers]
        newPhilosophers[philosopherId] = {
          ...newPhilosophers[philosopherId],
          state: "hungry",
        }
        return newPhilosophers
      })
      addLog(`${philosopher.name} is hungry and wants to eat.`)
      return
    }

    // If philosopher is not hungry, show alert
    if (philosopher.state !== "hungry") {
      showAlertMessage(`${philosopher.name} must be hungry to pick up chopsticks.`)
      return
    }

    // Already has chopsticks or is eating
    if (philosopher.leftChopstick !== null && philosopher.rightChopstick !== null) {
      showAlertMessage(`${philosopher.name} already has both chopsticks.`)
      return
    }

    // Try to pick up left chopstick
    let leftChopstickTaken = false
    if (philosopher.leftChopstick === null && chopsticks[leftChopstickId]?.state === "available") {
      setChopsticks((prevChopsticks) => {
        const newChopsticks = [...prevChopsticks]
        newChopsticks[leftChopstickId] = {
          ...newChopsticks[leftChopstickId],
          state: "taken",
          heldBy: philosopherId,
        }
        return newChopsticks
      })

      setPhilosophers((prevPhilosophers) => {
        const newPhilosophers = [...prevPhilosophers]
        newPhilosophers[philosopherId] = {
          ...newPhilosophers[philosopherId],
          leftChopstick: leftChopstickId,
        }
        return newPhilosophers
      })

      addLog(`${philosopher.name} picked up left chopstick ${leftChopstickId + 1}.`)
      leftChopstickTaken = true
    } else if (philosopher.leftChopstick === null) {
      showAlertMessage(`Left chopstick ${leftChopstickId + 1} is already taken by another philosopher.`)
    }

    // Try to pick up right chopstick
    let rightChopstickTaken = false
    if (philosopher.rightChopstick === null && chopsticks[rightChopstickId]?.state === "available") {
      setChopsticks((prevChopsticks) => {
        const newChopsticks = [...prevChopsticks]
        newChopsticks[rightChopstickId] = {
          ...newChopsticks[rightChopstickId],
          state: "taken",
          heldBy: philosopherId,
        }
        return newChopsticks
      })

      setPhilosophers((prevPhilosophers) => {
        const newPhilosophers = [...prevPhilosophers]
        newPhilosophers[philosopherId] = {
          ...newPhilosophers[philosopherId],
          rightChopstick: rightChopstickId,
        }
        return newPhilosophers
      })

      addLog(`${philosopher.name} picked up right chopstick ${rightChopstickId + 1}.`)
      rightChopstickTaken = true
    } else if (philosopher.rightChopstick === null) {
      showAlertMessage(`Right chopstick ${rightChopstickId + 1} is already taken by another philosopher.`)
    }

    // If both chopsticks are picked up (or were already held), start eating
    if (
      (leftChopstickTaken || philosopher.leftChopstick !== null) &&
      (rightChopstickTaken || philosopher.rightChopstick !== null)
    ) {
      setPhilosophers((prevPhilosophers) => {
        const newPhilosophers = [...prevPhilosophers]
        const phil = newPhilosophers[philosopherId]
        if (phil.leftChopstick !== null && phil.rightChopstick !== null) {
          newPhilosophers[philosopherId] = {
            ...phil,
            state: "eating",
            eatingCount: phil.eatingCount + 1,
          }
          addLog(`${phil.name} is eating (count: ${phil.eatingCount + 1}).`)
        }
        return newPhilosophers
      })
    }
  }

  const putDownChopsticks = (philosopherId: number) => {
    // First, check if the philosopher exists
    if (philosopherId < 0 || philosopherId >= philosophers.length) {
      console.error(`Invalid philosopher ID: ${philosopherId}`)
      return
    }

    const philosopher = philosophers[philosopherId]

    if (philosopher.state !== "eating") {
      showAlertMessage(`${philosopher.name} must be eating to put down chopsticks.`)
      return
    }

    // Put down left chopstick
    if (philosopher.leftChopstick !== null) {
      const leftChopstickId = philosopher.leftChopstick

      setChopsticks((prevChopsticks) => {
        const newChopsticks = [...prevChopsticks]
        newChopsticks[leftChopstickId] = {
          ...newChopsticks[leftChopstickId],
          state: "available",
          heldBy: null,
        }
        return newChopsticks
      })

      addLog(`${philosopher.name} put down left chopstick ${leftChopstickId + 1}.`)
    }

    // Put down right chopstick
    if (philosopher.rightChopstick !== null) {
      const rightChopstickId = philosopher.rightChopstick

      setChopsticks((prevChopsticks) => {
        const newChopsticks = [...prevChopsticks]
        newChopsticks[rightChopstickId] = {
          ...newChopsticks[rightChopstickId],
          state: "available",
          heldBy: null,
        }
        return newChopsticks
      })

      addLog(`${philosopher.name} put down right chopstick ${rightChopstickId + 1}.`)
    }

    // Start thinking again
    setPhilosophers((prevPhilosophers) => {
      const newPhilosophers = [...prevPhilosophers]
      newPhilosophers[philosopherId] = {
        ...newPhilosophers[philosopherId],
        state: "thinking",
        leftChopstick: null,
        rightChopstick: null,
      }
      return newPhilosophers
    })

    addLog(`${philosopher.name} is thinking.`)
  }

  const detectDeadlock = () => {
    // Check if all philosophers are hungry and have one chopstick
    const allHungryWithOneChopstick = philosophers.every(
      (philosopher) =>
        philosopher.state === "hungry" &&
        ((philosopher.leftChopstick !== null && philosopher.rightChopstick === null) ||
          (philosopher.leftChopstick === null && philosopher.rightChopstick !== null)),
    )

    if (allHungryWithOneChopstick && !deadlockDetected) {
      setDeadlockDetected(true)
      addLog("DEADLOCK DETECTED: All philosophers are hungry and holding one chopstick!")
      showAlertMessage(
        "Deadlock detected! All philosophers are waiting for a chopstick that is held by another philosopher.",
      )
      return true
    }

    return false
  }

  const detectStarvation = () => {
    // Check if some philosophers have eaten much more than others
    if (philosophers.length === 0) return false

    const maxEatingCount = Math.max(...philosophers.map((p) => p.eatingCount))
    const minEatingCount = Math.min(...philosophers.map((p) => p.eatingCount))

    // If the difference is significant and simulation has been running for a while
    if (maxEatingCount > 5 && maxEatingCount - minEatingCount >= 5 && !starvationDetected) {
      const starvedPhilosophers = philosophers.filter((p) => p.eatingCount <= minEatingCount)
      setStarvationDetected(true)
      addLog(`STARVATION DETECTED: ${starvedPhilosophers.map((p) => p.name).join(", ")} are starving!`)
      showAlertMessage("Starvation detected! Some philosophers are not getting a chance to eat.")
      return true
    }

    return false
  }

  const runSimulationStep = () => {
    // Check for deadlock or starvation
    if (detectDeadlock() || detectStarvation()) {
      stopSimulation()
      return
    }

    // For each philosopher
    philosophers.forEach((philosopher, index) => {
      const randomAction = Math.random()

      if (philosopher.state === "thinking") {
        // 30% chance to become hungry
        if (randomAction < 0.3) {
          pickUpChopsticks(index)
        }
      } else if (philosopher.state === "hungry") {
        // Try to pick up chopsticks
        pickUpChopsticks(index)
      } else if (philosopher.state === "eating") {
        // 20% chance to finish eating
        if (randomAction < 0.2) {
          putDownChopsticks(index)
        }
      }
    })
  }

  const startSimulation = () => {
    if (isSimulating) return

    setIsSimulating(true)
    setSimulationMode("auto")
    addLog("Automatic simulation started.")

    simulationRef.current = setInterval(() => {
      runSimulationStep()
    }, 1000)
  }

  const stopSimulation = () => {
    if (!isSimulating) return

    if (simulationRef.current) {
      clearInterval(simulationRef.current)
      simulationRef.current = null
    }

    setIsSimulating(false)
    addLog("Simulation paused.")
  }

  const resetSimulation = () => {
    if (isSimulating) {
      stopSimulation()
    }

    initializeSimulation()
    setSimulationMode("manual")
    addLog("Simulation reset. You can now interact with philosophers and chopsticks.")
  }

  const handlePhilosopherAction = (philosopherId: number) => {
    if (isSimulating) return

    const philosopher = philosophers[philosopherId]

    if (philosopher.state === "thinking") {
      pickUpChopsticks(philosopherId)
    } else if (philosopher.state === "hungry") {
      pickUpChopsticks(philosopherId)
    } else if (philosopher.state === "eating") {
      putDownChopsticks(philosopherId)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="border-b bg-white px-4 py-3">
        <div className="flex items-center justify-between max-w-[1920px] mx-auto">
          <h1 className="text-xl font-semibold">Dining Philosopher's Problem</h1>
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              Instructions
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-4xl">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  Dining Philosophers Problem - Detailed Instructions
                </h2>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold mb-2">Getting Started:</h3>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Click on philosophers to change their state (thinking → hungry → eating)</li>
                      <li>Click on chopsticks to pick them up or put them down</li>
                      <li>Monitor the Action Log and state changes to track system behavior</li>
                      <li>Observe potential deadlock and starvation conditions</li>
                    </ol>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Philosopher States:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Thinking:</strong> Philosopher is not hungry and not using resources
                      </li>
                      <li>
                        <strong>Hungry:</strong> Philosopher wants to eat and is waiting for chopsticks
                      </li>
                      <li>
                        <strong>Eating:</strong> Philosopher has both chopsticks and is eating
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Key Features:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Real-time philosopher state visualization</li>
                      <li>Interactive chopstick management</li>
                      <li>Deadlock and starvation detection</li>
                      <li>Comprehensive action logging for learning analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </header>

      <div className="flex-1">
        <Tabs defaultValue="simulation" className="h-full flex flex-col">
          <div className="bg-gray-100 border-b">
            <div className="max-w-[1920px] mx-auto">
              <TabsList className="w-full h-auto bg-transparent border-0 rounded-none p-0 flex">
                <TabsTrigger
                  value="simulation"
                  className="data-[state=active]:bg-white dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 text-xs sm:text-sm px-1 sm:px-3 py-2 break-words transition-colors bg-transparent text-black data-[state=active]:border data-[state=active]:border-blue-200"
                >
                  Simulation
                </TabsTrigger>
                <TabsTrigger
                  value="manual-guide"
                  className="data-[state=active]:bg-white dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 text-xs sm:text-sm px-1 sm:px-3 py-2 break-words transition-colors bg-transparent text-black data-[state=active]:border data-[state=active]:border-blue-200"
                >
                 Tutorial
                </TabsTrigger>
                <TabsTrigger
                  value="guided"
                  className="data-[state=active]:bg-white dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 text-xs sm:text-sm px-1 sm:px-3 py-2 break-words transition-colors bg-transparent text-black data-[state=active]:border data-[state=active]:border-blue-200"
                >
                  Scenarios
                </TabsTrigger>
                <TabsTrigger
                  value="evaluation"
                  className="data-[state=active]:bg-white dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 text-xs sm:text-sm px-1 sm:px-3 py-2 break-words transition-colors bg-transparent text-black data-[state=active]:border data-[state=active]:border-blue-200"
                >
                  Evaluation
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="flex-1 bg-white">
            <TabsContent value="simulation" className="h-full m-0 p-0">
              <SimulationView
                philosophers={philosophers}
                chopsticks={chopsticks}
                logs={logs}
                isSimulating={isSimulating}
                showAlert={showAlert}
                alertMessage={alertMessage}
                onPhilosopherClick={handlePhilosopherAction}
                onChopstickClick={handleChopstickClick}
                onReset={resetSimulation}
              />
            </TabsContent>
            <TabsContent value="manual-guide" className="mt-6">
              <GuidedManual
                philosophers={philosophers}
                chopsticks={chopsticks}
                onPhilosopherClick={handlePhilosopherAction}
                onChopstickClick={handleChopstickClick}
                isSimulating={isSimulating}
                logs={logs}
                onReset={resetSimulation}
                simulationMode={simulationMode}
              />
            </TabsContent>
            <TabsContent value="guided" className="h-full m-0 p-4">
              <GuidedScenarios
                philosophers={philosophers}
                chopsticks={chopsticks}
                onPhilosopherClick={handlePhilosopherAction}
                onChopstickClick={handleChopstickClick}
                onReset={resetSimulation}
              />
            </TabsContent>
            <TabsContent value="evaluation" className="h-full m-0 p-4">
              <Evaluation
                philosophers={philosophers}
                chopsticks={chopsticks}
                onPhilosopherClick={handlePhilosopherAction}
                onChopstickClick={handleChopstickClick}
                onReset={resetSimulation}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

function SimulationView({
  philosophers,
  chopsticks,
  logs,
  isSimulating,
  showAlert,
  alertMessage,
  onPhilosopherClick,
  onChopstickClick,
  onReset,
}: {
  philosophers: Philosopher[]
  chopsticks: Chopstick[]
  logs: string[]
  isSimulating: boolean
  showAlert: boolean
  alertMessage: string
  onPhilosopherClick: (id: number) => void
  onChopstickClick: (id: number) => void
  onReset: () => void
}) {
  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 max-w-[1920px] mx-auto">
      <div className="lg:col-span-3 space-y-4">
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <h2 className="text-lg font-semibold">Controls</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="inline-flex items-center justify-center w-5 h-5 text-gray-500 hover:text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Use these controls to manage the simulation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={onReset}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12a9 9 0 0 1-9-9 9 9 0 0 1-9 9 9 9 0 0 1 9 9 9 9 0 0 1 9-9" />
                    </svg>
                    <span className="ml-2">Reset</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset the simulation to its initial state</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="3" height="3" x="9" y="9" />
              <rect width="3" height="3" x="15" y="9" />
              <rect width="3" height="3" x="9" y="15" />
              <rect width="3" height="3" x="15" y="15" />
            </svg>
            <h3 className="text-md font-semibold">Legend</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="inline-flex items-center justify-center w-5 h-5 text-gray-500 hover:text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Visual guide for philosopher and chopstick states</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="space-y-2 text-sm">
            <div className="space-y-1">
              <p className="font-medium text-xs text-gray-600 mb-1">Philosopher States:</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded-full"></div>
                <span>Thinking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded-full"></div>
                <span>Hungry</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 border border-green-400 rounded-full"></div>
                <span>Eating</span>
              </div>
            </div>
            <div className="space-y-1 mt-3">
              <p className="font-medium text-xs text-gray-600 mb-1">Chopstick States:</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                <span>Taken</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
          <h3 className="text-sm font-semibold mb-2">Quick Reference Guide</h3>
          <ul className="text-xs space-y-1">
            <li>
              <strong>Event Types:</strong>
            </li>
            <li>• Philosopher clicks change state</li>
            <li>• Chopstick clicks pick up/release</li>
            <li>
              <strong>Key Actions:</strong>
            </li>
            <li>• Watch for deadlock conditions</li>
            <li>• Observe eating pattern fairness</li>
          </ul>
        </div>
      </div>

      <div className="lg:col-span-6 border rounded-lg p-4 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
          <h2 className="text-lg font-semibold">Dining Philosophers Simulation</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="inline-flex items-center justify-center w-5 h-5 text-gray-500 hover:text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Interact with philosophers and chopsticks to explore synchronization</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex flex-col space-y-4">
          <PhilosopherTable
            philosophers={philosophers}
            chopsticks={chopsticks}
            onPhilosopherClick={onPhilosopherClick}
            onChopstickClick={onChopstickClick}
            isSimulating={isSimulating}
          />

          <div className="relative min-h-[80px] flex items-center justify-center p-2">
            {showAlert && (
              <Alert variant="destructive" className="border-red-300 bg-red-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                  <path d="M12 21V5" />
                  <path d="M16 12L12 16 8 12" />
                </svg>
                <AlertTitle>Alert</AlertTitle>
                <AlertDescription>{alertMessage}</AlertDescription>
              </Alert>
            )}
            {!showAlert && (
              <p className="text-sm text-gray-500 italic text-center">
                Click philosophers to change their state. Click chopsticks to pick up/release. Alerts will appear here.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-4">
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" x2="12" y1="20" y2="10" />
              <line x1="18" x2="18" y1="20" y2="4" />
              <line x1="6" x2="6" y1="20" y2="16" />
            </svg>
            <h2 className="text-lg font-semibold">Metrics & Log</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="inline-flex items-center justify-center w-5 h-5 text-gray-500 hover:text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Track system performance and state changes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="mb-4 space-y-2">
            <h3 className="text-sm font-semibold mb-2">Performance Metrics</h3>
            <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
              {philosophers.map((p) => (
                <div key={p.id} className="flex justify-between">
                  <span>{p.name}:</span>
                  <span className="font-medium">{p.eatingCount} times eaten</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Action Log</h3>
            <ActionLog logs={logs} />
          </div>
        </div>
      </div>
    </div>
  )
}
