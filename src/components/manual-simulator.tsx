"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Play, Pause, RefreshCw, Info, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export interface Process {
  id: string
  allocation: number[]
  max: number[]
  need: number[]
  finished?: boolean
}

interface SimulationState {
  processes: Process[]
  available: number[]
  resourceTypes: number
  safeSequence: string[]
  isDeadlock: boolean
}

interface ManualSimulatorProps {
  initialAvailable: number[]
  initialProcesses: Process[]
  resourceTypes?: number
}

export function ManualSimulator({
  initialAvailable,
  initialProcesses,
  resourceTypes = 3,
}: ManualSimulatorProps) {
  const [available, setAvailable] = useState<number[]>(initialAvailable)
  const [processes, setProcesses] = useState<Process[]>(initialProcesses)
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [safeSequence, setSafeSequence] = useState<string[]>([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(1000)
  const [simulationStep, setSimulationStep] = useState(0)
  const [isDeadlock, setIsDeadlock] = useState(false)
  const [requests, setRequests] = useState<{ [key: string]: number[] }>({})
  const [simSubTab, setSimSubTab] = useState("setup")

  const logEndRef = useRef<HTMLDivElement>(null)
  const simulationRef = useRef<NodeJS.Timeout | null>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  const simulateAllocationRelease = useCallback(
    (processId: string) => {
      const processIndex = processes.findIndex((p) => p.id === processId)
      if (processIndex === -1) return

      setProcesses((prev) => {
        const updated = [...prev]
        updated[processIndex].finished = true
        return updated
      })

      setAvailable((prev) => {
        const updated = [...prev]
        for (let i = 0; i < resourceTypes; i++) {
          updated[i] += processes[processIndex].allocation[i]
        }
        return updated
      })

      addLog(`Process ${processId} completed and released its resources`)
    },
    [processes, resourceTypes],
  )

  // Initialize request state when processes change
  useEffect(() => {
    const initialRequests: { [key: string]: number[] } = {}
    processes.forEach((process) => {
      initialRequests[process.id] = Array(resourceTypes).fill(0)
    })
    setRequests(initialRequests)
  }, [processes, resourceTypes])

  // Auto-scroll logs
  useEffect(() => {
    if (logEndRef.current) {
      const logContainer = logEndRef.current.parentElement
      if (logContainer) {
        logContainer.scrollTop = logContainer.scrollHeight
      }
    }
  }, [logs])

  // Handle simulation steps
  useEffect(() => {
    if (isSimulating && simulationStep < processes.length && safeSequence.length > 0) {
      simulationRef.current = setTimeout(() => {
        const nextProcess = safeSequence[simulationStep]
        simulateAllocationRelease(nextProcess)
        setSimulationStep((prev) => prev + 1)
      }, simulationSpeed)
    } else if (isSimulating && simulationStep >= safeSequence.length && safeSequence.length > 0) {
      addLog("Simulation complete! System is in a safe state.")
      setIsSimulating(false)
      setSimulationStep(0)
    }

    return () => {
      if (simulationRef.current) {
        clearTimeout(simulationRef.current)
      }
    }
  }, [isSimulating, simulationStep, safeSequence, simulateAllocationRelease, simulationSpeed])

  const updateProcessNeed = (processIndex: number) => {
    setProcesses((prev) => {
      const updated = [...prev]
      const process = updated[processIndex]
      process.need = process.max.map((max, i) => Math.max(0, max - process.allocation[i]))
      return updated
    })
  }

  const handleAllocationChange = (processIndex: number, resourceIndex: number, value: number) => {
    const newValue = Math.max(0, value)
    setProcesses((prev) => {
      const updated = [...prev]
      updated[processIndex].allocation[resourceIndex] = newValue
      return updated
    })
    updateProcessNeed(processIndex)
  }

  const handleMaxChange = (processIndex: number, resourceIndex: number, value: number) => {
    const newValue = Math.max(0, value)
    setProcesses((prev) => {
      const updated = [...prev]
      updated[processIndex].max[resourceIndex] = newValue
      return updated
    })
    updateProcessNeed(processIndex)
  }

  const handleAvailableChange = (resourceIndex: number, value: number) => {
    const newValue = Math.max(0, value)
    setAvailable((prev) => {
      const updated = [...prev]
      updated[resourceIndex] = newValue
      return updated
    })
  }

  const handleRequestChange = (processId: string, resourceIndex: number, value: number) => {
    const newValue = Math.max(0, value)
    setRequests((prev) => {
      const updated = { ...prev }
      if (!updated[processId]) {
        updated[processId] = Array(resourceTypes).fill(0)
      }
      updated[processId][resourceIndex] = newValue
      return updated
    })
  }

  const resetSimulation = () => {
    if (simulationRef.current) {
      clearTimeout(simulationRef.current)
    }

    setProcesses(initialProcesses.map((p) => ({ ...p, finished: false })))
    setAvailable([...initialAvailable])
    setIsSimulating(false)
    setSimulationStep(0)
    setSafeSequence([])
    setIsDeadlock(false)
    setError(null)
    addLog("Simulation reset to initial state")
  }

  const checkSafeState = (): { isSafe: boolean; sequence: string[] } => {
    const work = [...available]
    const finish = processes.map((p) => p.finished)
    const sequence: string[] = []

    let found = true
    while (found) {
      found = false
      for (let i = 0; i < processes.length; i++) {
        if (!finish[i]) {
          const canAllocate = processes[i].need.every((n, j) => n <= work[j])

          if (canAllocate) {
            for (let j = 0; j < resourceTypes; j++) {
              work[j] += processes[i].allocation[j]
            }

            finish[i] = true
            sequence.push(processes[i].id)
            found = true

            addLog(`Process ${processes[i].id} can complete and release its resources`)
          }
        }
      }
    }

    const isSafe = finish.every((f) => f)
    return { isSafe, sequence }
  }

  const runSafetyAlgorithm = () => {
    setError(null)

    const isValidNeed = processes.every((p) => {
      const isValidProcess = p.need.every((n) => n >= 0)
      if (!isValidProcess) {
        setError(`Error: Process ${p.id} has invalid need values (allocation exceeds max)`)
      }
      return isValidProcess
    })

    if (!isValidNeed) return false

    const { isSafe, sequence } = checkSafeState()
    setSafeSequence(sequence)

    if (isSafe) {
      addLog(`System is in a safe state. Safe sequence: ${sequence.join(" → ")}`)
      setIsDeadlock(false)
    } else {
      addLog("WARNING: System is in an unsafe state (potential deadlock)")
      setError("System is in an unsafe state (potential deadlock)")
      setIsDeadlock(true)
    }

    return isSafe
  }

  const startSimulation = () => {
    if (safeSequence.length === 0) {
      const isSafe = runSafetyAlgorithm()
      if (!isSafe) return
    }

    setIsSimulating(true)
    setSimulationStep(0)
    addLog("Starting simulation...")
  }

  const pauseSimulation = () => {
    setIsSimulating(false)
    addLog("Simulation paused")
  }

  const handleRequest = (processIndex: number) => {
    const process = processes[processIndex]
    const request = requests[process.id] || Array(resourceTypes).fill(0)
    const result = requestResources(processIndex, request)
    if (result) {
      setRequests((prev) => {
        const updated = { ...prev }
        updated[process.id] = Array(resourceTypes).fill(0)
        return updated
      })
    }
  }

  const requestResources = (processIndex: number, request: number[]) => {
    const process = processes[processIndex]

    const isValidRequest = request.every((req, i) => req <= process.need[i])
    if (!isValidRequest) {
      setError(`Error: Request exceeds the declared maximum need of process ${process.id}`)
      addLog(`Process ${process.id} requested more resources than it needs`)
      return false
    }

    const isResourceAvailable = request.every((req, i) => req <= available[i])
    if (!isResourceAvailable) {
      setError(`Error: Insufficient resources available for process ${process.id}`)
      addLog(`Process ${process.id} must wait (insufficient resources)`)
      return false
    }

    const tempAvailable = available.map((a, i) => a - request[i])
    const tempAllocation = process.allocation.map((a, i) => a + request[i])
    const tempNeed = process.need.map((n, i) => n - request[i])

    const currentState: SimulationState = {
      processes: JSON.parse(JSON.stringify(processes)),
      available: [...available],
      resourceTypes,
      safeSequence: [...safeSequence],
      isDeadlock,
    }

    setAvailable(tempAvailable)
    const updatedProcesses = [...processes]
    updatedProcesses[processIndex] = {
      ...updatedProcesses[processIndex],
      allocation: tempAllocation,
      need: tempNeed,
    }

    // Check safety with the proposed state
    const work = [...tempAvailable]
    const finish = updatedProcesses.map((p) => p.finished)
    let found = true
    while (found) {
      found = false
      for (let i = 0; i < updatedProcesses.length; i++) {
        if (!finish[i]) {
          const canAllocate = updatedProcesses[i].need.every((n, j) => n <= work[j])
          if (canAllocate) {
            for (let j = 0; j < resourceTypes; j++) {
              work[j] += updatedProcesses[i].allocation[j]
            }
            finish[i] = true
            found = true
          }
        }
      }
    }
    const isSafe = finish.every((f) => f)

    if (isSafe) {
      setProcesses(updatedProcesses)
      addLog(`Resources allocated to process ${process.id}`)
      return true
    } else {
      setAvailable(currentState.available)
      setProcesses(currentState.processes)
      setSafeSequence(currentState.safeSequence)
      setIsDeadlock(currentState.isDeadlock)
      setError(`Request denied: would lead to an unsafe state`)
      addLog(`Process ${process.id} request denied (would lead to unsafe state)`)
      return false
    }
  }

  const Legend = () => (
    <div className="mt-4 border rounded-md p-3">
      <h3 className="font-medium text-sm sm:text-base mb-2">Legend</h3>
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#3498db] rounded-full"></div>
          <span className="text-xs sm:text-sm">Available Resources</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#e74c3c] rounded-full"></div>
          <span className="text-xs sm:text-sm">Allocated Resources</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full"></div>
          <span className="text-xs sm:text-sm">Completed Process</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full"></div>
          <span className="text-xs sm:text-sm">Current Process</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full">
      <Tabs value={simSubTab} onValueChange={setSimSubTab} className="w-full">
        <TabsList className="w-full bg-white p-0 h-auto flex flex-wrap justify-center gap-0">
          <TabsTrigger
            value="setup"
            className="flex-1 max-w-xs data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-gray-300 data-[state=inactive]:bg-gray-100 text-xs sm:text-sm py-2.5 rounded-none border-b-0"
          >
            Setup
          </TabsTrigger>
          <TabsTrigger
            value="allocation"
            className="flex-1 max-w-xs data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-gray-300 data-[state=inactive]:bg-gray-100 text-xs sm:text-sm py-2.5 rounded-none border-b-0"
          >
            Resource Allocation
          </TabsTrigger>
          <TabsTrigger
            value="request"
            className="flex-1 max-w-xs data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-gray-300 data-[state=inactive]:bg-gray-100 text-xs sm:text-sm py-2.5 rounded-none border-b-0"
          >
            Resource Request
          </TabsTrigger>
          <TabsTrigger
            value="sim-view"
            className="flex-1 max-w-xs data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-gray-300 data-[state=inactive]:bg-gray-100 text-xs sm:text-sm py-2.5 rounded-none border-b-0"
          >
            Simulate
          </TabsTrigger>
        </TabsList>

        {/* Setup Tab */}
        <TabsContent value="setup" className="border border-[#2ecc71] rounded-md p-3 sm:p-4 mt-2">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">System Setup</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-medium mb-2">Available Resources</h3>
              <div className="flex flex-wrap gap-2">
                {available.map((value, index) => (
                  <div key={`available-${index}`} className="flex items-center">
                    <label htmlFor={`available-${index}`} className="mr-2 text-sm sm:text-base">
                      R{index}:
                    </label>
                    <Input
                      id={`available-${index}`}
                      type="number"
                      min="0"
                      value={value}
                      onChange={(e) => handleAvailableChange(index, Number.parseInt(e.target.value))}
                      className="w-16 sm:w-20"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-2 sm:gap-4 flex-wrap">
              <Button onClick={runSafetyAlgorithm} className="bg-[#3498db] hover:bg-[#2980b9] text-xs sm:text-sm">
                Check System State
              </Button>
              <Button
                onClick={resetSimulation}
                variant="outline"
                className="border-[#3498db] text-[#3498db] text-xs sm:text-sm bg-transparent"
              >
                <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Reset
              </Button>
            </div>
          </div>

          <div className="mt-4 sm:mt-6">
            <div className="flex items-center mb-2">
              <h3 className="text-base sm:text-lg font-medium">Process Configuration</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 ml-1.5">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Info</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Max: Maximum resources a process can request</p>
                    <p>Allocation: Currently allocated resources</p>
                    <p>Need: Resources still needed (Max - Allocation)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left text-xs sm:text-sm">Process</th>
                    <th className="border p-2 text-left text-xs sm:text-sm">Resource Type</th>
                    <th className="border p-2 text-left text-xs sm:text-sm">Max</th>
                    <th className="border p-2 text-left text-xs sm:text-sm">Allocation</th>
                    <th className="border p-2 text-left text-xs sm:text-sm">Need</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.map((process, pIndex) =>
                    Array.from({ length: resourceTypes }).map((_, rIndex) => (
                      <tr key={`${process.id}-${rIndex}`} className={pIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        {rIndex === 0 && (
                          <td className="border p-2 font-medium text-xs sm:text-sm" rowSpan={resourceTypes}>
                            {process.id}
                          </td>
                        )}
                        <td className="border p-2 text-xs sm:text-sm">R{rIndex}</td>
                        <td className="border p-2 text-xs sm:text-sm">
                          <Input
                            type="number"
                            min="0"
                            value={process.max[rIndex] || 0}
                            onChange={(e) => handleMaxChange(pIndex, rIndex, Number.parseInt(e.target.value))}
                            className="w-16 sm:w-20"
                          />
                        </td>
                        <td className="border p-2 text-xs sm:text-sm">
                          <Input
                            type="number"
                            min="0"
                            value={process.allocation[rIndex] || 0}
                            onChange={(e) => handleAllocationChange(pIndex, rIndex, Number.parseInt(e.target.value))}
                            className="w-16 sm:w-20"
                          />
                        </td>
                        <td className="border p-2 text-xs sm:text-sm">{process.need[rIndex] || 0}</td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Allocation Tab */}
        <TabsContent value="allocation" className="border border-[#2ecc71] rounded-md p-3 sm:p-4 mt-2">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Current Resource Allocation</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-medium mb-2">Available Resources</h3>
              <div className="flex flex-wrap gap-2 sm:gap-4 mb-4">
                {available.map((value, index) => (
                  <div key={`available-visual-${index}`} className="text-center">
                    <div className="bg-[#3498db] text-white p-2 rounded-md w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-xl sm:text-2xl">
                      {value}
                    </div>
                    <div className="mt-1 text-xs sm:text-sm">R{index}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#3498db] rounded-full"></div>
                <span className="text-xs sm:text-sm">Available Resources</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#e74c3c] rounded-full"></div>
                <span className="text-xs sm:text-sm">Allocated Resources</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#f1c40f] rounded-full"></div>
                <span className="text-xs sm:text-sm">Needed Resources</span>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6">
            <h3 className="text-base sm:text-lg font-medium mb-2">Process Allocation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {processes.map((process, pIndex) => (
                <div
                  key={`process-card-${pIndex}`}
                  className={`border rounded-md p-3 sm:p-4 ${process.finished ? "bg-gray-100" : "bg-white"}`}
                >
                  <h4 className="font-medium text-base sm:text-lg mb-2 flex justify-between">
                    {process.id}
                    {process.finished && <span className="text-green-500 text-xs sm:text-sm">Completed</span>}
                  </h4>

                  <div className="space-y-2">
                    {Array.from({ length: resourceTypes }).map((_, rIndex) => (
                      <div key={`${process.id}-res-${rIndex}`} className="flex items-center">
                        <span className="w-8 sm:w-10 text-xs sm:text-sm">R{rIndex}:</span>
                        <div className="flex-1 h-5 sm:h-6 bg-gray-200 rounded-full overflow-hidden">
                          {process.allocation[rIndex] > 0 ? (
                            <div
                              className="h-full bg-[#e74c3c] flex items-center pl-1 sm:pl-2 text-xs text-white"
                              style={{ width: `${(process.allocation[rIndex] / process.max[rIndex]) * 100}%` }}
                            >
                              <span className="text-white">{process.allocation[rIndex]}</span>
                            </div>
                          ) : (
                            <div className="h-full flex items-center pl-1 sm:pl-2">
                              <span className="text-[#e74c3c] text-xs font-medium">0</span>
                            </div>
                          )}
                        </div>
                        <span className="ml-2 text-xs sm:text-sm flex items-center">
                          <span>{process.max[rIndex]}</span>
                          <span className="ml-2 text-[#f1c40f] font-medium">({process.need[rIndex]})</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Request Tab */}
        <TabsContent value="request" className="border border-[#2ecc71] rounded-md p-3 sm:p-4 mt-2">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Resource Request</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="text-base sm:text-lg font-medium mb-3">Make a Request</h3>

              <div className="space-y-3 sm:space-y-4">
                {processes.map((process, pIndex) => (
                  <div key={`request-${pIndex}`} className="border rounded-md p-3 sm:p-4">
                    <h4 className="font-medium mb-2 text-sm sm:text-base">{process.id}</h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                      {Array.from({ length: resourceTypes }).map((_, rIndex) => (
                        <div key={`${process.id}-req-${rIndex}`}>
                          <label className="text-xs sm:text-sm block mb-1">R{rIndex}:</label>
                          <Input
                            type="number"
                            min="0"
                            max={process.need[rIndex]}
                            value={requests[process.id]?.[rIndex] || 0}
                            onChange={(e) => handleRequestChange(process.id, rIndex, Number.parseInt(e.target.value))}
                            className="w-full text-xs sm:text-sm"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-xs sm:text-sm">
                        <span>Need: {process.need.join(", ")}</span>
                      </div>
                      <Button
                        onClick={() => handleRequest(pIndex)}
                        size="sm"
                        className="bg-[#3498db] hover:bg-[#2980b9] text-xs sm:text-sm h-7 sm:h-8"
                        disabled={process.finished}
                      >
                        Request
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium mb-3">Current State</h3>

              <div className="border rounded-md p-3 sm:p-4 mb-4">
                <h4 className="font-medium mb-2 text-sm sm:text-base">Available Resources</h4>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {available.map((value, index) => (
                    <div key={`avail-display-${index}`} className="text-center">
                      <div className="bg-[#3498db] text-white p-2 rounded-md w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-base sm:text-xl">
                        {value}
                      </div>
                      <div className="mt-1 text-xs sm:text-sm">R{index}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-md p-3 sm:p-4">
                <h4 className="font-medium mb-2 text-sm sm:text-base">System Status</h4>
                {safeSequence.length > 0 ? (
                  <div>
                    <div className={`text-xs sm:text-sm font-medium ${isDeadlock ? "text-red-500" : "text-green-500"}`}>
                      {isDeadlock ? "UNSAFE STATE (Potential Deadlock)" : "SAFE STATE"}
                    </div>

                    {!isDeadlock && (
                      <div className="mt-2">
                        <div className="text-xs sm:text-sm mb-1">Safe Sequence:</div>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          {safeSequence.map((id, index) => (
                            <div key={`seq-${index}`} className="flex items-center">
                              <span className="bg-[#3498db] text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm">
                                {id}
                              </span>
                              {index < safeSequence.length - 1 && <span className="mx-0.5 sm:mx-1">→</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-gray-500">Run the safety algorithm to check system state</div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Simulate Tab */}
        <TabsContent value="sim-view" className="border border-[#2ecc71] rounded-md p-3 sm:p-4 mt-2">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Simulation</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <div className="flex items-center mb-3">
                <h3 className="text-base sm:text-lg font-medium">Simulation Controls</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 ml-1.5">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Simulation Info</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Run the simulation to see processes execute in a safe sequence</p>
                      <p>Processes will release resources when they complete</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  onClick={startSimulation}
                  disabled={isSimulating || safeSequence.length === 0}
                  className="bg-[#3498db] hover:bg-[#2980b9] text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Play className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Simulate
                </Button>
                <Button
                  onClick={pauseSimulation}
                  disabled={!isSimulating}
                  variant="outline"
                  className="border-[#3498db] text-[#3498db] text-xs sm:text-sm h-8 sm:h-9 bg-transparent"
                >
                  <Pause className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Pause
                </Button>
                <Button
                  onClick={resetSimulation}
                  variant="outline"
                  className="border-[#3498db] text-[#3498db] text-xs sm:text-sm h-8 sm:h-9 bg-transparent"
                >
                  <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Reset
                </Button>
              </div>

              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium mb-1">Simulation Speed</label>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="100"
                  value={simulationSpeed}
                  onChange={(e) => setSimulationSpeed(Number.parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Fast</span>
                  <span>Slow</span>
                </div>
              </div>

              <div className="border rounded-md p-3 sm:p-4">
                <h4 className="font-medium mb-2 text-sm sm:text-base">Simulation Progress</h4>
                {safeSequence.length > 0 ? (
                  <div>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-3">
                      {safeSequence.map((id, index) => (
                        <div key={`sim-seq-${index}`} className="flex items-center">
                          <span
                            className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm ${
                              simulationStep > index
                                ? "bg-green-500 text-white"
                                : simulationStep === index && isSimulating
                                  ? "bg-yellow-500 text-white"
                                  : "bg-gray-200"
                            }`}
                          >
                            {id}
                          </span>
                          {index < safeSequence.length - 1 && <span className="mx-0.5 sm:mx-1">→</span>}
                        </div>
                      ))}
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                      <div
                        className="bg-[#3498db] h-2 sm:h-2.5 rounded-full"
                        style={{ width: `${(simulationStep / safeSequence.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-gray-500">
                    Run the safety algorithm first to generate a safe sequence
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium mb-3">Resource Visualization</h3>

              <div className="border rounded-md p-3 sm:p-4 h-[250px] sm:h-[300px] overflow-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {Array.from({ length: resourceTypes }).map((_, rIndex) => {
                    const totalAllocated = processes.reduce((sum, p) => sum + p.allocation[rIndex], 0)
                    const totalResource = available[rIndex] + totalAllocated

                    return (
                      <div key={`resource-viz-${rIndex}`} className="text-center">
                        <h4 className="font-medium mb-2 text-xs sm:text-sm">Resource {rIndex}</h4>
                        <div className="h-32 sm:h-40 w-full bg-gray-100 rounded-md relative">
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-[#3498db]"
                            style={{
                              height: `${(available[rIndex] / totalResource) * 100}%`,
                            }}
                          ></div>

                          {processes.map((p, pIndex) => {
                            const prevAllocated = processes
                              .slice(0, pIndex)
                              .reduce((sum, proc) => sum + proc.allocation[rIndex], 0)

                            const bottomPosition = ((available[rIndex] + prevAllocated) / totalResource) * 100
                            const height = (p.allocation[rIndex] / totalResource) * 100

                            return (
                              <div
                                key={`res-${rIndex}-proc-${pIndex}`}
                                className={`absolute left-0 right-0 ${p.finished ? "bg-green-300" : "bg-[#e74c3c]"}`}
                                style={{
                                  bottom: `${bottomPosition}%`,
                                  height: `${height}%`,
                                }}
                              >
                                {height > 10 && (
                                  <span className="text-white text-xs absolute inset-0 flex items-center justify-center">
                                    {p.id}
                                  </span>
                                )}
                              </div>
                            )
                          })}

                          <div className="absolute top-1 right-1 text-xs font-medium">
                            {available[rIndex]}/{totalResource}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <Legend />
        </TabsContent>
      </Tabs>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Log */}
      <div className="mt-4 border rounded-md">
        <div className="bg-gray-100 p-2 font-medium border-b flex justify-between items-center">
          <span className="text-xs sm:text-sm">Action Log</span>
          <Button variant="ghost" size="sm" onClick={() => setLogs([])} className="h-7 sm:h-8 text-xs">
            Clear
          </Button>
        </div>
        <div className="p-2 h-32 sm:h-40 overflow-y-auto bg-white font-mono text-xs sm:text-sm">
          {logs.length === 0 ? (
            <div className="text-gray-400 italic text-xs sm:text-sm">No actions recorded yet</div>
          ) : (
            logs.map((log, index) => (
              <div key={`log-${index}`} className="mb-1 text-xs sm:text-sm">
                {log}
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  )
}
