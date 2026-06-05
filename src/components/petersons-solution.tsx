"use client"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, Play, Pause, RotateCcw, Settings, Activity, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import SimulationArea from "@/components/simulation-area"

interface LogEntry {
  message: string
  type: "info" | "error" | "success" | "process0" | "process1" | "user"
  time: string
}

interface AlertState {
  message: string
  type: "error" | "success" | "info"
}

export function PetersonsSolution() {
  const [simulationState, setSimulationState] = useState<"stopped" | "running" | "paused">("stopped")
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [alert, setAlert] = useState<AlertState | null>(null)
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Peterson's algorithm state
  const [process0State, setProcess0State] = useState("inactive")
  const [process1State, setProcess1State] = useState("inactive")
  const [flag0, setFlag0] = useState(false)
  const [flag1, setFlag1] = useState(false)
  const [turn, setTurn] = useState(0)
  const [selectedProcess, setSelectedProcess] = useState<number | null>(null)

  // Metrics
  const criticalSectionEntriesRef = useRef(0)
  const [criticalEntries, setCriticalEntries] = useState(0)
  const [mutualExclusionViolations, setMutualExclusionViolations] = useState(0)
  const [wrongMoves, setWrongMoves] = useState(0)

  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    const now = new Date()
    const time = now.toLocaleTimeString()
    setLogs((prev) => [...prev, { message, type, time }])
  }

  const showAlert = useCallback((
    message: string,
    type: "error" | "success" | "info" = "error",
    force = false
  ) => {
    if (type === "error" || force) {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current)
      setAlert({ message, type })
      const duration = type === "error" ? 4000 : 3000
      alertTimerRef.current = setTimeout(() => setAlert(null), duration)
    }
  }, [])

  const resetSimulation = () => {
    setSimulationState("stopped")
    setProcess0State("inactive")
    setProcess1State("inactive")
    setFlag0(false)
    setFlag1(false)
    setTurn(0)
    setSelectedProcess(null)
    setAlert(null)
    addLog("Simulation reset", "info")
  }

  const startSimulation = () => {
    if (simulationState === "stopped") {
      setSimulationState("running")
      addLog("Simulation started", "info")
    } else if (simulationState === "paused") {
      setSimulationState("running")
      addLog("Simulation resumed", "info")
    }
  }

  const pauseSimulation = () => {
    setSimulationState("paused")
    addLog("Simulation paused", "info")
  }

  const exitCriticalSection = () => {
    if (process0State === "critical") {
      setProcess0State("inactive")
      setFlag0(false)
      addLog("Process 0: Exiting critical section", "process0")
      addLog("Process 0: Setting flag[0] = false", "process0")
      showAlert("Process 0 exited the critical section.", "success", true)
    } else if (process1State === "critical") {
      setProcess1State("inactive")
      setFlag1(false)
      addLog("Process 1: Exiting critical section", "process1")
      addLog("Process 1: Setting flag[1] = false", "process1")
      showAlert("Process 1 exited the critical section.", "success", true)
    } else {
      showAlert("No process is currently in the critical section.", "error")
      setWrongMoves((w) => w + 1)
    }
  }

  const selectProcess = (processIndex: number) => {
    if (simulationState !== "paused" && simulationState !== "running") {
      showAlert("Please start the simulation first.", "error")
      return
    }
    setSelectedProcess(processIndex)
    addLog(`Selected Process ${processIndex}`, "user")
  }

  const toggleFlag = (flagIndex: number) => {
    if (simulationState !== "paused" && simulationState !== "running") {
      showAlert("Please start the simulation first.", "error")
      return
    }
    if (selectedProcess === null) {
      showAlert("Please select a process first before toggling flags.", "error")
      setWrongMoves((w) => w + 1)
      return
    }
    if (selectedProcess !== flagIndex) {
      showAlert(`You can only toggle flag[${flagIndex}] when Process ${flagIndex} is selected.`, "error")
      setWrongMoves((w) => w + 1)
      return
    }
    if (flagIndex === 0) {
      if (process0State === "critical") {
        showAlert("Cannot modify flag while process is in critical section!", "error")
        return
      }
      setFlag0(!flag0)
      if (!flag0) {
        setProcess0State("active")
        addLog("Process 0: flag[0] = true", "process0")
      } else {
        setProcess0State("inactive")
        addLog("Process 0: flag[0] = false", "process0")
      }
    } else {
      if (process1State === "critical") {
        showAlert("Cannot modify flag while process is in critical section!", "error")
        return
      }
      setFlag1(!flag1)
      if (!flag1) {
        setProcess1State("active")
        addLog("Process 1: flag[1] = true", "process1")
      } else {
        setProcess1State("inactive")
        addLog("Process 1: flag[1] = false", "process1")
      }
    }
  }

  const toggleTurn = () => {
    if (simulationState !== "paused" && simulationState !== "running") {
      showAlert("Please start the simulation first.", "error")
      return
    }
    if (selectedProcess === null) {
      showAlert("Please select a process first before changing turn.", "error")
      setWrongMoves((w) => w + 1)
      return
    }
    const newTurn = turn === 0 ? 1 : 0
    setTurn(newTurn)
    if (selectedProcess === 0) {
      addLog(`Process 0: turn = ${newTurn}`, "process0")
      if (newTurn === 1 && flag1) {
        setProcess0State("waiting")
        addLog("Process 0: Waiting (flag[1]=true, turn=1)", "process0")
      }
    } else {
      addLog(`Process 1: turn = ${newTurn}`, "process1")
      if (newTurn === 0 && flag0) {
        setProcess1State("waiting")
        addLog("Process 1: Waiting (flag[0]=true, turn=0)", "process1")
      }
    }
  }

  const enterCriticalSection = (processIndex: number) => {
    if (simulationState !== "paused" && simulationState !== "running") {
      showAlert("Please start the simulation first.", "error")
      return
    }
    if (selectedProcess === null) {
      showAlert("Please select a process first.", "error")
      return
    }
    if (selectedProcess !== processIndex) {
      showAlert(`Select Process ${processIndex} before entering its critical section.`, "error")
      setWrongMoves((w) => w + 1)
      return
    }
    if (processIndex === 0) {
      if (process0State === "critical") {
        showAlert("Process 0 is already in the critical section!", "error")
        return
      }
      if (!flag0) {
        showAlert("Process 0 must set its flag before entering the critical section!", "error")
        setWrongMoves((w) => w + 1)
        return
      }
      if (flag1 && turn === 1) {
        showAlert("Process 0 must wait: flag[1]=true and turn=1", "info", true)
        setProcess0State("waiting")
        addLog("Process 0: Waiting (flag[1]=true, turn=1)", "process0")
        return
      }
      setProcess0State("critical")
      addLog("Process 0: Entered critical section", "process0")
      criticalSectionEntriesRef.current += 1
      setCriticalEntries(criticalSectionEntriesRef.current)
    } else {
      if (process1State === "critical") {
        showAlert("Process 1 is already in the critical section!", "error")
        return
      }
      if (!flag1) {
        showAlert("Process 1 must set its flag before entering the critical section!", "error")
        setWrongMoves((w) => w + 1)
        return
      }
      if (flag0 && turn === 0) {
        showAlert("Process 1 must wait: flag[0]=true and turn=0", "info", true)
        setProcess1State("waiting")
        addLog("Process 1: Waiting (flag[0]=true, turn=0)", "process1")
        return
      }
      setProcess1State("critical")
      addLog("Process 1: Entered critical section", "process1")
      criticalSectionEntriesRef.current += 1
      setCriticalEntries(criticalSectionEntriesRef.current)
    }

    if (process0State === "critical" && process1State === "critical") {
      showAlert("MUTUAL EXCLUSION VIOLATION! Both processes in critical section!", "error")
      setMutualExclusionViolations((v) => v + 1)
    }
  }

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "error": return "bg-red-50 text-red-800 border border-red-200"
      case "success": return "bg-green-50 text-green-800 border border-green-200"
      case "process0": return "bg-blue-50 text-blue-800 border border-blue-200"
      case "process1": return "bg-purple-50 text-purple-800 border border-purple-200"
      case "user": return "bg-amber-50 text-amber-800 border border-amber-200"
      default: return "bg-white text-gray-800 border border-gray-200"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

      {/* Column 1: Controls Card */}
      <Card className="lg:col-span-1 order-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Settings className="h-4 w-4 flex-shrink-0" />
            <span>Controls</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 cursor-help flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Start, pause, or reset the simulation. Select a process to interact with flags and turn variable.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Primary action buttons */}
          <div className="grid grid-cols-2 gap-2">
            {simulationState === "running" ? (
              <Button
                onClick={pauseSimulation}
                className="flex items-center justify-center gap-1 text-xs sm:text-sm"
              >
                <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={startSimulation}
                className="flex items-center justify-center gap-1 text-xs sm:text-sm"
              >
                <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                Start
              </Button>
            )}
            <Button
              variant="outline"
              onClick={resetSimulation}
              className="flex items-center justify-center gap-1 text-xs sm:text-sm"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              Reset
            </Button>
          </div>

          {/* Selected Process display */}
          <div className="p-3 bg-muted rounded-md">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Selected Process:</p>
            <p className="text-lg font-bold text-center mt-1">
              {selectedProcess !== null ? `P${selectedProcess}` : "None"}
            </p>
          </div>

          {/* Legend */}
          <div className="border-t pt-3 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xs sm:text-sm font-medium">Legend</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-blue-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Color codes for process states in this simulation.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 legend-item">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-gray-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Inactive</span>
              </div>
              <div className="flex items-center gap-2 legend-item">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-blue-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Active (flag set)</span>
              </div>
              <div className="flex items-center gap-2 legend-item">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-yellow-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Waiting (spinning)</span>
              </div>
              <div className="flex items-center gap-2 legend-item">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-green-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm">In Critical Section</span>
              </div>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground font-medium mb-1">Quick Reference</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>Click a process to select it</li>
              <li>Use action buttons to change states</li>
              <li>Grants with correct turn management</li>
              <li>Monitor metrics for performance</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Column 2+3: Visualizer Card — green border signature */}
      <Card className="lg:col-span-2 border-2 border-green-200 relative overflow-hidden order-2">
        {/* Alert — absolutely positioned inside visualizer */}
        {alert && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-10">
            <Alert
              className={`border-2 shadow-lg ${
                alert.type === "error"
                  ? "border-red-200 bg-red-50"
                  : alert.type === "success"
                    ? "border-green-200 bg-green-50"
                    : "border-blue-200 bg-blue-50"
              }`}
            >
              <AlertCircle
                className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${
                  alert.type === "error"
                    ? "text-red-600"
                    : alert.type === "success"
                      ? "text-green-600"
                      : "text-blue-600"
                }`}
              />
              <AlertDescription
                className={`text-xs sm:text-sm break-words ${
                  alert.type === "error"
                    ? "text-red-800"
                    : alert.type === "success"
                      ? "text-green-800"
                      : "text-blue-800"
                }`}
              >
                {alert.message}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <span className="break-words min-w-0">Process Scheduling Simulation</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 cursor-help flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Interactive Peterson&apos;s Solution visualizer. Click processes, flags, and turn to interact.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <SimulationArea
            process0State={process0State}
            process1State={process1State}
            flag0={flag0}
            flag1={flag1}
            turn={turn}
            selectedProcess={selectedProcess}
            onSelectProcess={selectProcess}
            onToggleFlag={toggleFlag}
            onToggleTurn={toggleTurn}
            onEnterCriticalSection={enterCriticalSection}
            onExitCriticalSection={exitCriticalSection}
          />
        </CardContent>
      </Card>

      {/* Column 4: Metrics & Log Card */}
      <Card className="lg:col-span-1 order-3">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Activity className="h-4 w-4 flex-shrink-0" />
            <span className="break-words min-w-0">Metrics & Log</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 cursor-help flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Key counters and chronological action log for analysis.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metric rows */}
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">CS Entries</span>
              <span className="font-mono font-semibold text-green-600">{criticalEntries}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">ME Violations</span>
              <span className="font-mono font-semibold text-red-600">{mutualExclusionViolations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Wrong Moves</span>
              <span className="font-mono font-semibold text-blue-600">{wrongMoves}</span>
            </div>
          </div>

          {/* Action Log */}
          <div className="space-y-2 border-t pt-3">
            <div className="text-xs sm:text-sm font-medium flex items-center gap-2">
              Action Log
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 cursor-help flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Chronological log of user actions and system events</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="max-h-32 sm:max-h-64 overflow-y-auto space-y-1 border rounded-lg p-2 bg-gray-50">
              {logs.length === 0 ? (
                <div className="text-center text-muted-foreground py-4 text-xs sm:text-sm">
                  No activity yet. Start the simulation to see logs.
                </div>
              ) : (
                logs
                  .slice(-20)
                  .reverse()
                  .map((log, index) => (
                    <div
                      key={index}
                      className={cn("text-xs p-2 rounded overflow-hidden", getLogColor(log.type))}
                    >
                      <span className="font-mono">[{log.time}]</span>{" "}
                      <span className="break-words">{log.message}</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
