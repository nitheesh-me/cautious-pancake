"use client"

import { useState } from "react"
import Instructions from "@/components/instructions"
import ProcessControls from "@/components/process-controls"
import SimulationArea from "@/components/simulation-area"
import ActionLog from "@/components/action-log"
import { TooltipProvider } from "@/components/ui/tooltip"

export function PetersonsSolution() {
  const [simulationState, setSimulationState] = useState("stopped") // stopped, running, paused
  const [logs, setLogs] = useState<Array<{ message: string; type: string; timestamp: string }>>([])
  const [alert, setAlert] = useState<{ message: string; show: boolean }>({ message: "", show: false })
  const [instructionsCollapsed, setInstructionsCollapsed] = useState(true)

  // Peterson's algorithm state
  const [process0State, setProcess0State] = useState("inactive") // inactive, active, waiting, critical
  const [process1State, setProcess1State] = useState("inactive")
  const [flag0, setFlag0] = useState(false)
  const [flag1, setFlag1] = useState(false)
  const [turn, setTurn] = useState(0)

  // Student interaction tracking
  const [selectedProcess, setSelectedProcess] = useState<number | null>(null)

  const addLog = (message: string, type = "info") => {
    const now = new Date()
    const timestamp = now.toLocaleTimeString()
    setLogs((prev) => [...prev, { message, type, timestamp }])
  }

  const showAlert = (message: string) => {
    setAlert({ message, show: true })
    // Auto-hide alert after 5 seconds
    setTimeout(() => {
      setAlert({ message: "", show: false })
    }, 5000)
  }

  const resetSimulation = () => {
    setSimulationState("stopped")
    setProcess0State("inactive")
    setProcess1State("inactive")
    setFlag0(false)
    setFlag1(false)
    setTurn(0)
    setSelectedProcess(null)
    addLog("Simulation reset", "info")
  }

  const startSimulation = () => {
    if (simulationState === "stopped") {
      setSimulationState("running")
      addLog("Simulation started", "info")
    } else if (simulationState === "paused") {
      setSimulationState("running")
      addLog("Simulation continued", "info")
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
    } else if (process1State === "critical") {
      setProcess1State("inactive")
      setFlag1(false)
      addLog("Process 1: Exiting critical section", "process1")
      addLog("Process 1: Setting flag[1] = false", "process1")
    } else {
      showAlert("No process is currently in the critical section.")
    }
  }

  // Handle process selection
  const selectProcess = (processIndex: number) => {
    if (simulationState !== "paused" && simulationState !== "running") {
      showAlert("Please start or step the simulation first.")
      return
    }

    setSelectedProcess(processIndex)
    addLog(`User selected Process ${processIndex}`, "user")
  }

  // Handle flag toggling
  const toggleFlag = (flagIndex: number) => {
    if (simulationState !== "paused" && simulationState !== "running") {
      showAlert("Please start or step the simulation first.")
      return
    }

    if (selectedProcess === null) {
      showAlert("Please select a process first before toggling flags.")
      return
    }

    if (selectedProcess !== flagIndex) {
      showAlert(`You can only toggle flag[${flagIndex}] when Process ${flagIndex} is selected.`)
      return
    }

    if (flagIndex === 0) {
      if (process0State === "critical") {
        showAlert("Cannot modify flag while process is in critical section!")
        return
      }

      setFlag0(!flag0)
      if (!flag0) {
        setProcess0State("active")
        addLog(`Process 0: Setting flag[0] to true`, "process0")
      } else {
        setProcess0State("inactive")
        addLog(`Process 0: Setting flag[0] to false`, "process0")
      }
    } else {
      if (process1State === "critical") {
        showAlert("Cannot modify flag while process is in critical section!")
        return
      }

      setFlag1(!flag1)
      if (!flag1) {
        setProcess1State("active")
        addLog(`Process 1: Setting flag[1] to true`, "process1")
      } else {
        setProcess1State("inactive")
        addLog(`Process 1: Setting flag[1] to false`, "process1")
      }
    }
  }

  // Handle turn toggling
  const toggleTurn = () => {
    if (simulationState !== "paused" && simulationState !== "running") {
      showAlert("Please start or step the simulation first.")
      return
    }

    if (selectedProcess === null) {
      showAlert("Please select a process first before changing turn.")
      return
    }

    const newTurn = turn === 0 ? 1 : 0
    setTurn(newTurn)

    if (selectedProcess === 0) {
      addLog(`Process 0: Setting turn to ${newTurn}`, "process0")
      if (newTurn === 1 && flag1) {
        setProcess0State("waiting")
        addLog("Process 0: Now waiting while flag[1] = true and turn = 1", "process0")
      }
    } else {
      addLog(`Process 1: Setting turn to ${newTurn}`, "process1")
      if (newTurn === 0 && flag0) {
        setProcess1State("waiting")
        addLog("Process 1: Now waiting while flag[0] = true and turn = 0", "process1")
      }
    }
  }

  // Handle entering critical section
  const enterCriticalSection = (processIndex: number) => {
    if (simulationState !== "paused" && simulationState !== "running") {
      showAlert("Please start or step the simulation first.")
      return
    }

    if (selectedProcess === null) {
      showAlert("Please select a process first.")
      return
    }

    if (selectedProcess !== processIndex) {
      showAlert(`You can only attempt to enter critical section with Process ${processIndex} when it is selected.`)
      return
    }

    if (processIndex === 0) {
      if (process0State === "critical") {
        showAlert("Process 0 is already in critical section!")
        return
      }

      if (!flag0) {
        showAlert("Process 0 must set its flag before entering critical section!")
        return
      }

      if (flag1 && turn === 1) {
        showAlert("Process 0 cannot enter critical section: flag[1] is true and turn is 1")
        setProcess0State("waiting")
        addLog("Process 0: Waiting while flag[1] = true and turn = 1", "process0")
        return
      }

      setProcess0State("critical")
      addLog("Process 0: Entering critical section", "process0")
    } else {
      if (process1State === "critical") {
        showAlert("Process 1 is already in critical section!")
        return
      }

      if (!flag1) {
        showAlert("Process 1 must set its flag before entering critical section!")
        return
      }

      if (flag0 && turn === 0) {
        showAlert("Process 1 cannot enter critical section: flag[0] is true and turn = 0")
        setProcess1State("waiting")
        addLog("Process 1: Waiting while flag[0] = true and turn = 0", "process1")
        return
      }

      setProcess1State("critical")
      addLog("Process 1: Entering critical section", "process1")
    }

    // Check for mutual exclusion violation
    if (process0State === "critical" && process1State === "critical") {
      showAlert("MUTUAL EXCLUSION VIOLATION! Both processes are in critical section!")
    }
  }

  return (
    <TooltipProvider>
      <div>
        <div className="mb-6">
          <Instructions
            collapsed={instructionsCollapsed}
            onToggle={() => setInstructionsCollapsed(!instructionsCollapsed)}
            infoTooltip="This section provides step-by-step guidance on how to use the Peterson's Solution simulator."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border p-6 shadow-sm h-full">
            <ProcessControls
              simulationState={simulationState}
              onStart={startSimulation}
              onPause={pauseSimulation}
              onReset={resetSimulation}
              selectedProcess={selectedProcess}
            />
          </div>

          <div className="lg:col-span-7 bg-white rounded-lg border-2 border-green-500 p-6 shadow-sm h-full">
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
              alert={alert}
            />
          </div>

          <div className="lg:col-span-3 bg-white rounded-lg border p-6 shadow-sm h-full sm:block hidden">
            <ActionLog logs={logs} />
          </div>
        </div>

        {/* Action Log for small screens only */}
        <div className="mt-6 bg-white rounded-lg border p-6 shadow-sm sm:hidden block">
          <ActionLog logs={logs} />
        </div>
      </div>
    </TooltipProvider>
  )
}
