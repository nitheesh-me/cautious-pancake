import { useState, useEffect } from "react"
import { AlertCircle, Play, Pause, RotateCcw, InfoIcon } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProcessState {
  id: number
  state: "idle" | "wanting" | "critical"
  flag: boolean
}

const stateColors = {
  idle: "bg-green-500",
  wanting: "bg-blue-500",
  critical: "bg-red-700"
}

export default function ProcessVisualization() {
  const [processes, setProcesses] = useState<ProcessState[]>([
    { id: 0, state: "idle", flag: false },
    { id: 1, state: "idle", flag: false }
  ])
  const [turn, setTurn] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [log, setLog] = useState<string[]>([])

  const addToLog = (message: string) => {
    setLog(prevLog => [...prevLog, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const handleProcessAction = (processId: number, action: "want" | "enter" | "exit") => {
    setProcesses(prev => {
      const newProcesses = [...prev]
      const otherProcessId = processId === 0 ? 1 : 0

      switch (action) {
        case "want":
          if (newProcesses[processId].state !== "idle") {
            setError("Process must be idle before wanting to enter critical section")
            return prev
          }
          newProcesses[processId].flag = true
          newProcesses[processId].state = "wanting"
          setTurn(otherProcessId)
          addToLog(`Process ${processId} wants to enter critical section`)
          break

        case "enter":
          if (newProcesses[processId].state !== "wanting") {
            setError("Process must declare intent before entering critical section")
            return prev
          }
          if (newProcesses[otherProcessId].flag && turn === otherProcessId) {
            setError(`Process ${processId} cannot enter: Process ${otherProcessId} has priority`)
            return prev
          }
          newProcesses[processId].state = "critical"
          addToLog(`Process ${processId} entered critical section`)
          break

        case "exit":
          if (newProcesses[processId].state !== "critical") {
            setError("Process must be in critical section to exit")
            return prev
          }
          newProcesses[processId].flag = false
          newProcesses[processId].state = "idle"
          addToLog(`Process ${processId} exited critical section`)
          break
      }
      setError(null)
      return newProcesses
    })
  }

  const reset = () => {
    setProcesses([
      { id: 0, state: "idle", flag: false },
      { id: 1, state: "idle", flag: false }
    ])
    setTurn(0)
    setError(null)
    setIsRunning(false)
    setLog([])
    addToLog("Simulation reset")
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setProcesses(prev => {
          const newProcesses = [...prev]
          newProcesses.forEach(process => {
            if (process.state === "idle") {
              handleProcessAction(process.id, "want")
            } else if (process.state === "wanting") {
              handleProcessAction(process.id, "enter")
            } else if (process.state === "critical") {
              handleProcessAction(process.id, "exit")
            }
          })
          return newProcesses
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  return (
    <div className="space-y-8 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Peterson&apos;s Algorithm Simulation</h2>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsRunning(!isRunning)}
                  aria-label={isRunning ? "Pause simulation" : "Start simulation"}
                >
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isRunning ? "Pause" : "Start"} simulation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={reset} aria-label="Reset simulation">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset simulation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {processes.map(process => (
          <Card key={process.id} className="p-6">
            <h3 className="text-xl font-semibold mb-4">Process {process.id}</h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span>State: {process.state}</span>
                <span>Flag: {process.flag ? "true" : "false"}</span>
                <span>Turn: {turn === process.id ? "Yes" : "No"}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full ${stateColors[process.state]}`} 
                  style={{
                    width: process.state === "idle" ? "100%" : process.state === "wanting" ? "50%" : "100%"
                  }}
                ></div>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => handleProcessAction(process.id, "want")}
                        disabled={process.state !== "idle"}
                        className={`${process.state === "idle" ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"} text-white`}
                      >
                        Want to Enter
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Declare intent to enter critical section</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => handleProcessAction(process.id, "enter")}
                        disabled={process.state !== "wanting"}
                        className="bg-red-700 hover:bg-red-800 text-white"
                      >
                        Enter Critical
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Attempt to enter critical section</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => handleProcessAction(process.id, "exit")}
                        disabled={process.state !== "critical"}
                        className="bg-red-700 hover:bg-red-800 text-white"
                      >
                        Exit Critical
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Exit critical section</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold">Legend</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Explanation of process states and variables</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="font-medium">Process States:</dt>
            <dd>
              <ul className="list-disc list-inside">
                <li className="text-green-500">Idle: Process is not interested in critical section</li>
                <li className="text-blue-500">Wanting: Process wants to enter critical section</li>
                <li className="text-red-600">Critical: Process is in critical section</li>
              </ul>
            </dd>
          </div>
          <div>
            <dt className="font-medium">Variables:</dt>
            <dd>
              <ul className="list-disc list-inside">
                <li>Flag: Indicates process wants to enter critical section</li>
                <li>Turn: Determines which process has priority</li>
              </ul>
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold">Simulation Log</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Record of events in the simulation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
          {log.map((entry, index) => (
            <p key={index} className="text-sm">{entry}</p>
          ))}
        </ScrollArea>
      </Card>
    </div>
  )
}

