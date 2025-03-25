"use client"

import { useState, useRef, useEffect } from "react"
import { AlertCircle, Info, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PhilosopherTable } from "./philosopher-table"
import { ActionLog } from "./action-log"
import { Instructions } from "./instructions"
import { ManualInstructions } from "./manual-instructions"

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
        eatingTime: Math.floor(Math.random() * 3) + 2, // 2-4 seconds
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
    <div className="flex flex-col gap-4">
      <div className="border rounded-lg p-4">
        <div className="flex items-center">
          <Instructions />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-500 cursor-help ml-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Expand to see instructions on how to use this simulation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3 border rounded-lg p-4">
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-semibold">Controls</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-500 cursor-help ml-1" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Control panel for resetting the simulation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-col gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="w-full bg-[#3498db] hover:bg-[#2980b9]" onClick={resetSimulation}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset the simulation to its initial state</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="mt-4 flex items-center">
            <h3 className="text-md font-semibold">Legend</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-500 cursor-help ml-1" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Color codes for philosopher states and chopstick availability</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded-sm mr-2"></div>
              <span>Thinking</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded-sm mr-2"></div>
              <span>Hungry</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-200 border border-green-400 rounded-sm mr-2"></div>
              <span>Eating</span>
            </div>
            <div className="flex items-center mt-2">
              <div className="w-4 h-4 bg-[#3498db] rounded-sm mr-2"></div>
              <span>Available Chopstick</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-400 rounded-sm mr-2"></div>
              <span>Taken Chopstick</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">How to Use</h3>
            <p className="text-xs">
              Click on philosophers to change their state or chopsticks to pick them up/put them down.
            </p>
          </div>
        </div>

        <div className="lg:col-span-6 border border-green-500 rounded-lg p-4">
          <Tabs defaultValue="simulation" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-[#3498db]">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="simulation"
                      className="flex-1 text-white data-[state=active]:bg-[#1a5276] data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-white"
                    >
                      Simulation
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Interactive simulation of the Dining Philosophers problem</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="manual"
                      className="flex-1 text-white data-[state=active]:bg-[#1a5276] data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-white"
                    >
                      Manual Guide
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Step-by-step guide for manual simulation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="theory"
                      className="flex-1 text-white data-[state=active]:bg-[#1a5276] data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-white"
                    >
                      Theory
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Theoretical background of the Dining Philosophers problem</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="deadlock"
                      className="flex-1 text-white data-[state=active]:bg-[#1a5276] data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-white"
                    >
                      Deadlock
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Explanation of deadlock conditions and how to observe them</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="starvation"
                      className="flex-1 text-white data-[state=active]:bg-[#1a5276] data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-white"
                    >
                      Starvation
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Explanation of starvation issues and how to observe them</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsList>
            <TabsContent value="simulation" className="p-2">
              <div className="flex flex-col space-y-4">
                <PhilosopherTable
                  philosophers={philosophers}
                  chopsticks={chopsticks}
                  onPhilosopherClick={handlePhilosopherAction}
                  onChopstickClick={handleChopstickClick}
                  isSimulating={isSimulating}
                />

                {/* Alert positioned absolutely to hover over content */}
                <div className="relative min-h-[50px] flex items-center justify-center">
                  {showAlert && (
                    <div className="absolute top-0 left-0 right-0 z-50">
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Alert</AlertTitle>
                        <AlertDescription>{alertMessage}</AlertDescription>
                      </Alert>
                    </div>
                  )}
                  {!showAlert && (
                    <p className="text-sm text-gray-500 italic">
                      Interact with the philosophers and chopsticks above. Alerts will appear here.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="manual" className="p-2">
              <ManualInstructions />
            </TabsContent>
            <TabsContent value="theory" className="p-2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">The Dining Philosophers Problem</h3>
                <p>
                  The dining philosophers problem is a classic synchronization problem introduced by E. W. Dijkstra. It
                  illustrates challenges in resource allocation and process synchronization.
                </p>
                <p>
                  Five philosophers sit at a circular table with five chopsticks. Each philosopher alternates between
                  thinking and eating. To eat, a philosopher needs both the chopstick to their left and right. After
                  eating, they put down both chopsticks.
                </p>
                <p>This problem demonstrates key concepts in concurrent programming:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Resource allocation and sharing</li>
                  <li>Deadlock prevention</li>
                  <li>Starvation avoidance</li>
                  <li>Mutual exclusion</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="deadlock" className="p-2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Deadlock in the Dining Philosophers</h3>
                <p>
                  Deadlock occurs when each philosopher picks up one chopstick (typically the left one) and then waits
                  indefinitely for the right chopstick, which is already held by another philosopher. This creates a
                  circular wait condition where no philosopher can proceed.
                </p>
                <h4 className="font-medium mt-4">How to Observe Deadlock:</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Reset the simulation</li>
                  <li>Click on each philosopher to make them hungry</li>
                  <li>Click on each left chopstick to have philosophers pick them up</li>
                  <li>Observe that no philosopher can pick up their right chopstick</li>
                  <li>The simulation will detect this deadlock condition</li>
                </ol>
                <h4 className="font-medium mt-4">Solutions to Prevent Deadlock:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Allow only 4 philosophers to eat at once</li>
                  <li>
                    Enforce an ordering on resource acquisition (e.g., always pick up lower-numbered chopstick first)
                  </li>
                  <li>Use a resource hierarchy to break the circular wait condition</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="starvation" className="p-2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Starvation in the Dining Philosophers</h3>
                <p>
                  Starvation occurs when one or more philosophers repeatedly fail to acquire the chopsticks they need,
                  while others successfully eat multiple times. This is a fairness problem in resource allocation.
                </p>
                <h4 className="font-medium mt-4">How to Observe Starvation:</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Run the simulation for a longer period</li>
                  <li>Watch the eating counts for each philosopher</li>
                  <li>If some philosophers eat significantly more than others, starvation is occurring</li>
                </ol>
                <h4 className="font-medium mt-4">Solutions to Prevent Starvation:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Implement a fair scheduling algorithm (e.g., round-robin)</li>
                  <li>Add a maximum eating count before a philosopher must wait</li>
                  <li>Prioritize philosophers who have eaten less</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-3 border rounded-lg p-4">
          <div className="flex items-center mb-2">
            <h2 className="text-lg font-semibold">Action Log</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-500 cursor-help ml-1" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>This log shows all actions taken by philosophers</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ActionLog logs={logs} />
        </div>
      </div>
    </div>
  )
}

