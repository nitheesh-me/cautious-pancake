"use client"

import { useState } from "react"
import "@/app/globals.css"
import { Info } from "lucide-react"

export default function CPUSchedulingSimulation() {
  // State for the simulation
  const [state, setState] = useState({
    Ready: [],
    Running: null,
    Waiting: [],
    Terminated: [],
    Completed: [],
    Map: { id: null, run_time: null, burst_time: null },
    Timer: null,
    Policy: null,
    clickedState: null,
    time_counter: 0,
    id_counter: 1,
    quantum: null,
  })

  // Button states
  const [buttonState, setButtonState] = useState({
    tick: false,
    schedule: false,
    newProcess: true,
    terminate: false,
    undo: false,
    redo: false,
    io: false,
    int: false,
  })

  // UI states
  const [stateActionLog, setStateActionLog] = useState([])
  const [redoLog, setRedoLog] = useState([])
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [showProcessDropdown, setShowProcessDropdown] = useState(false)
  const [showQuantumDropdown, setShowQuantumDropdown] = useState(false)
  const [burstTime, setBurstTime] = useState("")
  const [quantum, setQuantum] = useState("")
  const [dialogHistory, setDialogHistory] = useState([])
  const [currentDialog, setCurrentDialog] = useState({
    feedback: "Please select a scheduling policy before starting the experiment.",
    prompt: "Click on the 'Scheduling Policy' dropdown and select one of the policies for the simulation.",
  })
  const [showDialogHistory, setShowDialogHistory] = useState(false)
  const [instructionsOpen, setInstructionsOpen] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

  // Helper functions
  const sendAlert = (message) => {
    setAlertMessage(message)
    setShowAlert(true)
  }

  const assembleMsg = (feedback, prompt) => {
    setCurrentDialog({ feedback, prompt })
    setDialogHistory((prev) => [...prev, { feedback, prompt }])
  }

  const updatePolicy = (policy) => {
    if (state.time_counter === 0) {
      const newState = { ...state, Policy: policy === "None" ? null : policy }
      setState(newState)

      if (policy !== "None") {
        assembleMsg(
          `The scheduling policy has been updated to ${policy}.`,
          `It's time to create a new process. Click on the '+ New process' button. Make sure to enter the burst time (between 1 and 30) for the process, and then click on the 'Tick' button to advance the simulation.`,
        )

        if (policy === "RR") {
          setShowQuantumDropdown(true)
          assembleMsg(
            `The scheduling policy has been updated to ${policy}.`,
            `It's time to create a new process. First, click on the 'Quantum' button. Set the time quantum to a value between 1 and 15. Then, click on the '+ New process' button.`,
          )
        }
      } else {
        assembleMsg(
          "Please select a scheduling policy before starting the experiment.",
          "Click on the 'Scheduling Policy' dropdown and select one of the policies for the simulation.",
        )
      }
    } else {
      sendAlert(
        "The scheduling policy cannot be changed mid-simulation. Please click on the 'Reset' button to be able to choose another scheduling policy.",
      )
    }
  }

  const setQuantumValue = () => {
    if (Number.parseInt(quantum) > 15) {
      sendAlert("The time quantum cannot be greater than 15.")
      return
    }

    setState((prev) => ({ ...prev, quantum: Number.parseInt(quantum) }))
    assembleMsg(
      `Quantum updated to ${quantum}.`,
      `You have set the time quantum to ${quantum}. Now, click on the '+ New process' button.`,
    )

    setShowQuantumDropdown(false)
    setButtonState((prev) => ({ ...prev, newProcess: true }))
  }

  const createProcess = () => {
    if (!state.Policy) {
      sendAlert("Please select a scheduling policy before starting the experiment.")
      return
    }

    if (!burstTime) {
      sendAlert("Please enter a burst time for the process between 1 to 30.")
      return
    }

    const burstTimeInt = Number.parseInt(burstTime)
    if (isNaN(burstTimeInt) || burstTimeInt < 1 || burstTimeInt > 30) {
      sendAlert("Please enter a valid burst time between 1 to 30.")
      return
    }

    const newProcess = {
      id: state.id_counter,
      arrival_time: state.time_counter,
      burst_time: burstTimeInt,
      status: "Ready",
      mapping: { run_time: 0, burst_time: burstTimeInt },
    }

    setState((prev) => ({
      ...prev,
      Ready: [...prev.Ready, newProcess],
      id_counter: prev.id_counter + 1,
      clickedState: null,
    }))

    setBurstTime("")
    setShowProcessDropdown(false)

    assembleMsg(
      "A new process has successfully been created and added to the process queue.",
      "Now, you can either schedule any existing process(es) by clicking on the 'Schedule' button, or you can create another process by clicking on the '+ New process' button.",
    )

    setButtonState((prev) => ({
      ...prev,
      schedule: true,
      tick: false,
    }))
  }

  const handleCommand = (cmd) => {
    if (!state.Policy && cmd !== "newProcess") {
      sendAlert("Please select a scheduling policy before starting the experiment.")
      return
    }

    console.log(`Command: ${cmd}`)

    if (cmd === "newProcess") {
      setShowProcessDropdown((prev) => !prev)
      setState((prev) => ({ ...prev, clickedState: "newProcess" }))
      assembleMsg(
        "You chose the '+ New process' button.",
        "Please make sure that you have entered the burst time (between 1 and 30) for the process, and then click on the 'Tick' button to advance the simulation.",
      )
    } else if (cmd === "schedule") {
      if (state.Ready.length === 0) {
        sendAlert("No processes are ready to be scheduled. Please create a new process first.")
        return
      }

      setState((prev) => ({ ...prev, clickedState: "schedule" }))
      setButtonState((prev) => ({ ...prev, tick: true }))
      assembleMsg(
        "You have chosen the 'Schedule' button.",
        "Click on the 'Tick' button to schedule the next process according to the selected policy.",
      )
    } else if (cmd === "terminate") {
      if (!state.Running) {
        sendAlert("No process is currently running. Please schedule a process first.")
        return
      }

      setState((prev) => ({ ...prev, clickedState: "terminate" }))
      setButtonState((prev) => ({ ...prev, tick: true }))
      assembleMsg(
        "You have chosen the 'Terminate' button.",
        "Click on the 'Tick' button to terminate the currently running process.",
      )
    } else if (cmd === "io_int") {
      if (!state.Running) {
        sendAlert("No process is currently running. Please schedule a process first.")
        return
      }

      setState((prev) => ({ ...prev, clickedState: "io_int" }))
      setButtonState((prev) => ({ ...prev, tick: true }))
      assembleMsg(
        "You have chosen the 'I/O Interrupt' button.",
        "Click on the 'Tick' button to move the running process to the waiting queue.",
      )
    } else if (cmd === "io_cmpl") {
      if (state.Waiting.length === 0) {
        sendAlert("No processes are waiting for I/O. Please interrupt a process first.")
        return
      }

      setState((prev) => ({ ...prev, clickedState: "io_cmpl" }))
      setButtonState((prev) => ({ ...prev, tick: true }))
      assembleMsg(
        "You have chosen the 'I/O Complete' button.",
        "Click on the 'Tick' button to move a process from the waiting queue to the ready queue.",
      )
    } else if (cmd === "int") {
      if (!state.Running) {
        sendAlert("No process is currently running. Please schedule a process first.")
        return
      }

      setState((prev) => ({ ...prev, clickedState: "int" }))
      setButtonState((prev) => ({ ...prev, tick: true }))
      assembleMsg(
        "You have chosen the 'Interrupt' button.",
        "Click on the 'Tick' button to interrupt the currently running process.",
      )
    }
  }

  const tick = () => {
    if (!state.Policy) {
      sendAlert("Please select a scheduling policy before starting the experiment.")
      return
    }

    // Create a copy of the current state for action logging
    const currentState = JSON.parse(JSON.stringify(state))

    if (state.clickedState === "newProcess") {
      createProcess()
      setState((prev) => ({
        ...prev,
        time_counter: prev.time_counter + 1,
        clickedState: null,
      }))

      // Add to action log
      setStateActionLog((prev) => [
        ...prev,
        {
          action: "newProcess",
          state: currentState,
        },
      ])

      setRedoLog([])
    } else if (state.clickedState === "schedule") {
      // Schedule the next process based on policy
      const nextProcess = state.Ready[0] // Simple FCFS for now

      if (!nextProcess) {
        sendAlert("No processes are ready to be scheduled.")
        return
      }

      setState((prev) => ({
        ...prev,
        Running: nextProcess,
        Ready: prev.Ready.filter((p) => p.id !== nextProcess.id),
        time_counter: prev.time_counter + 1,
        clickedState: null,
      }))

      // Update button states
      setButtonState((prev) => ({
        ...prev,
        tick: true,
        schedule: false,
        terminate: true,
        io: true,
        int: true,
      }))

      // Add to action log
      setStateActionLog((prev) => [
        ...prev,
        {
          action: "schedule",
          state: currentState,
        },
      ])

      setRedoLog([])

      assembleMsg(
        `Process ${nextProcess.id} is now running on the CPU.`,
        "You can now tick to execute the process, terminate it, or interrupt it.",
      )
    } else if (state.clickedState === "terminate") {
      const terminatedProcess = state.Running

      if (!terminatedProcess) {
        sendAlert("No process is currently running.")
        return
      }

      setState((prev) => ({
        ...prev,
        Running: null,
        Terminated: [...prev.Terminated, { ...terminatedProcess, status: "Terminated" }],
        time_counter: prev.time_counter + 1,
        clickedState: null,
      }))

      // Update button states
      setButtonState((prev) => ({
        ...prev,
        tick: false,
        schedule: state.Ready.length > 0,
        terminate: false,
        io: false,
        int: false,
      }))

      // Add to action log
      setStateActionLog((prev) => [
        ...prev,
        {
          action: "terminate",
          state: currentState,
        },
      ])

      setRedoLog([])

      assembleMsg(
        `Process ${terminatedProcess.id} has been terminated.`,
        "You can now schedule another process if available.",
      )
    } else if (state.clickedState === "io_int") {
      const interruptedProcess = state.Running

      if (!interruptedProcess) {
        sendAlert("No process is currently running.")
        return
      }

      setState((prev) => ({
        ...prev,
        Running: null,
        Waiting: [...prev.Waiting, { ...interruptedProcess, status: "Waiting" }],
        time_counter: prev.time_counter + 1,
        clickedState: null,
      }))

      // Update button states
      setButtonState((prev) => ({
        ...prev,
        tick: false,
        schedule: state.Ready.length > 0,
        terminate: false,
        io: false,
        int: false,
        io_cmpl: true,
      }))

      // Add to action log
      setStateActionLog((prev) => [
        ...prev,
        {
          action: "io_int",
          state: currentState,
        },
      ])

      setRedoLog([])

      assembleMsg(
        `Process ${interruptedProcess.id} has been moved to the waiting queue.`,
        "You can now schedule another process if available or complete I/O for the waiting process.",
      )
    } else if (state.clickedState === "io_cmpl") {
      if (state.Waiting.length === 0) {
        sendAlert("No processes are waiting for I/O.")
        return
      }

      const completedProcess = state.Waiting[0]

      setState((prev) => ({
        ...prev,
        Waiting: prev.Waiting.filter((p) => p.id !== completedProcess.id),
        Ready: [...prev.Ready, { ...completedProcess, status: "Ready" }],
        time_counter: prev.time_counter + 1,
        clickedState: null,
      }))

      // Update button states
      setButtonState((prev) => ({
        ...prev,
        tick: false,
        schedule: true,
        io_cmpl: state.Waiting.length > 1,
      }))

      // Add to action log
      setStateActionLog((prev) => [
        ...prev,
        {
          action: "io_cmpl",
          state: currentState,
        },
      ])

      setRedoLog([])

      assembleMsg(
        `Process ${completedProcess.id} has been moved from the waiting queue to the ready queue.`,
        "You can now schedule this process or another process if available.",
      )
    } else if (state.clickedState === "int") {
      const interruptedProcess = state.Running

      if (!interruptedProcess) {
        sendAlert("No process is currently running.")
        return
      }

      setState((prev) => ({
        ...prev,
        Running: null,
        Ready: [...prev.Ready, { ...interruptedProcess, status: "Ready" }],
        time_counter: prev.time_counter + 1,
        clickedState: null,
      }))

      // Update button states
      setButtonState((prev) => ({
        ...prev,
        tick: false,
        schedule: true,
        terminate: false,
        io: false,
        int: false,
      }))

      // Add to action log
      setStateActionLog((prev) => [
        ...prev,
        {
          action: "int",
          state: currentState,
        },
      ])

      setRedoLog([])

      assembleMsg(
        `Process ${interruptedProcess.id} has been interrupted and moved back to the ready queue.`,
        "You can now schedule this process or another process.",
      )
    } else if (state.Running) {
      // Normal tick - advance the running process
      const runningProcess = { ...state.Running }
      runningProcess.mapping.run_time++

      if (runningProcess.mapping.run_time >= runningProcess.mapping.burst_time) {
        // Process completed
        setState((prev) => ({
          ...prev,
          Running: null,
          Completed: [...prev.Completed, { ...runningProcess, status: "Completed" }],
          time_counter: prev.time_counter + 1,
        }))

        // Update button states
        setButtonState((prev) => ({
          ...prev,
          tick: false,
          schedule: state.Ready.length > 0,
          terminate: false,
          io: false,
          int: false,
        }))

        assembleMsg(
          `Process ${runningProcess.id} has completed execution.`,
          "You can now schedule another process if available.",
        )
      } else {
        // Process still running
        setState((prev) => ({
          ...prev,
          Running: runningProcess,
          time_counter: prev.time_counter + 1,
        }))

        assembleMsg(
          `Process ${runningProcess.id} is executing. Remaining time: ${runningProcess.mapping.burst_time - runningProcess.mapping.run_time}`,
          "Continue ticking to execute the process, or use other controls.",
        )
      }

      // Add to action log
      setStateActionLog((prev) => [
        ...prev,
        {
          action: "tick",
          state: currentState,
        },
      ])

      setRedoLog([])
    } else {
      sendAlert("No action to perform. Please select an operation first.")
    }
  }

  const undo = () => {
    if (stateActionLog.length <= 1) {
      sendAlert("Nothing to undo.")
      return
    }

    // Save current state to redo log
    setRedoLog((prev) => [...prev, stateActionLog[stateActionLog.length - 1]])

    // Remove last action from log
    const newLog = [...stateActionLog]
    newLog.pop()
    setStateActionLog(newLog)

    // Set state to previous state
    setState(JSON.parse(JSON.stringify(newLog[newLog.length - 1].state)))

    // Update button states based on the new state
    updateButtonStates(JSON.parse(JSON.stringify(newLog[newLog.length - 1].state)))

    assembleMsg("Undo successful.", "The simulation has been reverted to the previous state.")
  }

  const redo = () => {
    if (redoLog.length === 0) {
      sendAlert("Nothing to redo.")
      return
    }

    // Get last redo action
    const redoAction = redoLog[redoLog.length - 1]

    // Remove from redo log first to avoid duplicates
    const newRedoLog = [...redoLog]
    newRedoLog.pop()
    setRedoLog(newRedoLog)

    // Set state to redo state
    setState(JSON.parse(JSON.stringify(redoAction.state)))

    // Add to action log
    setStateActionLog((prev) => [...prev, redoAction])

    // Update button states based on the new state
    updateButtonStates(JSON.parse(JSON.stringify(redoAction.state)))

    assembleMsg("Redo successful.", "The simulation has been advanced to the next state.")
  }

  const updateButtonStates = (newState) => {
    setButtonState({
      tick: newState.Running !== null,
      schedule: newState.Ready.length > 0 && newState.Running === null,
      newProcess: true,
      terminate: newState.Running !== null,
      undo: stateActionLog.length > 1,
      redo: redoLog.length > 0,
      io: newState.Running !== null,
      int: newState.Running !== null,
    })
  }

  const reset = () => {
    setState({
      Ready: [],
      Running: null,
      Waiting: [],
      Terminated: [],
      Completed: [],
      Map: { id: null, run_time: null, burst_time: null },
      Timer: null,
      Policy: null,
      clickedState: null,
      time_counter: 0,
      id_counter: 1,
      quantum: null,
    })

    setButtonState({
      tick: false,
      schedule: false,
      newProcess: true,
      terminate: false,
      undo: false,
      redo: false,
      io: false,
      int: false,
    })

    setStateActionLog([])
    setRedoLog([])
    setBurstTime("")
    setQuantum("")

    assembleMsg("The simulation has been reset.", "Please select a scheduling policy before starting the experiment.")
  }

  return (
    <div className="container">
      <h1 className="title">CPU Scheduling Simulation</h1>

      {/* Instructions Panel */}
      <div className="instructions-panel">
        <div className="instructions-header" onClick={() => setInstructionsOpen(!instructionsOpen)}>
          <h2>
            Instructions
            <span className="info-icon">
              <Info size={16} className="info-icon-svg" />
              <span className="tooltip">Click to expand/collapse instructions</span>
            </span>
          </h2>
          <span className={`collapse-icon ${instructionsOpen ? "open" : ""}`}>{instructionsOpen ? "▼" : "►"}</span>
        </div>

        {instructionsOpen && (
          <div className="instructions-content">
            <p>
              <strong>Objective:</strong> This experiment demonstrates CPU scheduling algorithms and process management.
            </p>
            <ol>
              <li>Select a scheduling policy from the dropdown (FCFS, SJF, SRTF, or Round Robin).</li>
              <li>For Round Robin, set a time quantum (1-15).</li>
              <li>Create processes by clicking "New process" and entering burst times (1-30).</li>
              <li>Use "Schedule" to assign processes to the CPU according to the selected policy.</li>
              <li>Click "Tick" to advance the simulation by one clock cycle.</li>
              <li>
                Use "Terminate" to end the current process, "I/O Interrupt" to move it to the waiting queue, or
                "Interrupt" to return it to the ready queue.
              </li>
              <li>Use "I/O Complete" to move processes from the waiting queue back to the ready queue.</li>
              <li>Follow the dialog box for guidance throughout the experiment.</li>
            </ol>
            <p>
              <strong>Note:</strong> Create a new process to start the simulation. Please refer to the dialog box during
              the experiment.
            </p>
          </div>
        )}
      </div>

      <div className="simulation-container">
        <div className="left-panel">
          <h2>
            System State
            <span className="info-icon">
              <Info size={16} className="info-icon-svg" />
              <span className="tooltip">Current and previous states of the system</span>
            </span>
          </h2>
          <div className="state-tabs">
            <button
              className={`tab-button ${!showDialogHistory ? "active" : ""}`}
              onClick={() => setShowDialogHistory(false)}
            >
              Current State
              <span className="tooltip">View the current state of the system</span>
            </button>
            <button
              className={`tab-button ${showDialogHistory ? "active" : ""}`}
              onClick={() => setShowDialogHistory(true)}
            >
              Previous States
              <span className="tooltip">View the history of system states</span>
            </button>
          </div>

          <div className="state-content">
            {!showDialogHistory ? (
              <table className="state-table">
                <tbody>
                  <tr>
                    <td>Ready:</td>
                    <td>{state.Ready.length > 0 ? `[ ${state.Ready.map((p) => p.id).join(", ")} ]` : "[ ]"}</td>
                  </tr>
                  <tr>
                    <td>Waiting for I/O:</td>
                    <td>{state.Waiting.length > 0 ? `[ ${state.Waiting.map((p) => p.id).join(", ")} ]` : "[ ]"}</td>
                  </tr>
                  <tr>
                    <td>Terminated:</td>
                    <td>
                      {state.Terminated.length > 0 ? `[ ${state.Terminated.map((p) => p.id).join(", ")} ]` : "[ ]"}
                    </td>
                  </tr>
                  <tr>
                    <td>Completed:</td>
                    <td>{state.Completed.length > 0 ? `[ ${state.Completed.map((p) => p.id).join(", ")} ]` : "[ ]"}</td>
                  </tr>
                  <tr>
                    <td>CPU:</td>
                    <td>{state.Running ? state.Running.id : "None"}</td>
                  </tr>
                  <tr>
                    <td>Map:</td>
                    <td>
                      {state.Running
                        ? `${state.Running.id}->${state.Running.mapping.run_time}:${state.Running.mapping.burst_time}`
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td>Timer:</td>
                    <td>{state.Timer !== null ? state.Timer : "-"}</td>
                  </tr>
                  <tr>
                    <td>Scheduling policy:</td>
                    <td>{state.Policy || "None"}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div className="previous-states">
                {stateActionLog.length === 0 ? (
                  <p className="no-states">No previous states available.</p>
                ) : (
                  stateActionLog.map((action, index) => (
                    <div key={index} className="state-item">
                      <div className="state-header" onClick={() => {}}>
                        Tick {index + 1} - {action.action}
                      </div>
                      <div className="state-details">
                        <p>Action: {action.action}</p>
                        <p>Time: {action.state.time_counter}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="middle-panel">
          <div className="cpu-display">
            <h2>
              CPU
              <span className="info-icon">
                <Info size={16} className="info-icon-svg" />
                <span className="tooltip">Shows the process currently running on the CPU</span>
              </span>
            </h2>
            <table className="process-table">
              <thead>
                <tr>
                  <th>Process ID</th>
                  <th>Burst Time</th>
                  <th>Run Time</th>
                </tr>
              </thead>
              <tbody>
                {state.Running ? (
                  <tr>
                    <td>{state.Running.id}</td>
                    <td>{state.Running.mapping.burst_time}</td>
                    <td>{state.Running.mapping.run_time}</td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan="3" className="no-process">
                      No process running
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="processes-display">
            <h2>
              Processes
              <span className="info-icon">
                <Info size={16} className="info-icon-svg" />
                <span className="tooltip">Shows all processes in the system and their current status</span>
              </span>
            </h2>
            <table className="process-table">
              <thead>
                <tr>
                  <th>Process ID</th>
                  <th>Arrival Time</th>
                  <th>Burst Time</th>
                  <th>Remaining Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {state.Running && (
                  <tr>
                    <td>{state.Running.id}</td>
                    <td>{state.Running.arrival_time}</td>
                    <td>{state.Running.mapping.burst_time}</td>
                    <td>{state.Running.mapping.burst_time - state.Running.mapping.run_time}</td>
                    <td>
                      <span className="status running">Running</span>
                    </td>
                  </tr>
                )}

                {state.Ready.map((process, index) => (
                  <tr key={`ready-${index}`}>
                    <td>{process.id}</td>
                    <td>{process.arrival_time}</td>
                    <td>{process.burst_time}</td>
                    <td>{process.burst_time - process.mapping.run_time}</td>
                    <td>
                      <span className="status ready">Ready</span>
                    </td>
                  </tr>
                ))}

                {state.Waiting.map((process, index) => (
                  <tr key={`waiting-${index}`}>
                    <td>{process.id}</td>
                    <td>{process.arrival_time}</td>
                    <td>{process.burst_time}</td>
                    <td>{process.burst_time - process.mapping.run_time}</td>
                    <td>
                      <span className="status waiting">Waiting</span>
                    </td>
                  </tr>
                ))}

                {state.Completed.map((process, index) => (
                  <tr key={`completed-${index}`}>
                    <td>{process.id}</td>
                    <td>{process.arrival_time}</td>
                    <td>{process.burst_time}</td>
                    <td>0</td>
                    <td>
                      <span className="status completed">Completed</span>
                    </td>
                  </tr>
                ))}

                {state.Terminated.map((process, index) => (
                  <tr key={`terminated-${index}`}>
                    <td>{process.id}</td>
                    <td>{process.arrival_time}</td>
                    <td>{process.burst_time}</td>
                    <td>0</td>
                    <td>
                      <span className="status terminated">Terminated</span>
                    </td>
                  </tr>
                ))}

                {state.Running === null &&
                  state.Ready.length === 0 &&
                  state.Waiting.length === 0 &&
                  state.Completed.length === 0 &&
                  state.Terminated.length === 0 && (
                    <tr>
                      <td colSpan="5" className="no-process">
                        No processes created yet
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>

          <div className="tick-display">
            <div className="tick-counter">
              Number of Ticks: <span>{state.time_counter}</span>
              {state.quantum && <span> | Quantum: {state.quantum}</span>}
            </div>
          </div>

          <div className="controls">
            <h2>
              Controls
              <span className="info-icon">
                <Info size={16} className="info-icon-svg" />
                <span className="tooltip">Control the simulation with these buttons</span>
              </span>
            </h2>

            <div className="policy-controls">
              <label>
                Scheduling Policy:
                <span className="info-icon">
                  <Info size={16} className="info-icon-svg" />
                  <span className="tooltip">Select the algorithm used to schedule processes</span>
                </span>
              </label>
              <select
                value={state.Policy || "None"}
                onChange={(e) => updatePolicy(e.target.value)}
                className="policy-select"
              >
                <option value="None">Please Select the Scheduling Policy...</option>
                <option value="FCFS">First Come First Serve</option>
                <option value="SJF">Shortest Job First</option>
                <option value="SRTF">Shortest Remaining Time First</option>
                <option value="RR">Round-Robin</option>
              </select>

              <button
                className={`control-button ${buttonState.tick ? "" : "disabled"}`}
                onClick={tick}
                disabled={!buttonState.tick && state.clickedState === null}
              >
                Tick
                <span className="tooltip">Advance the simulation by one clock cycle</span>
              </button>
            </div>

            <h3>
              Generate External Events
              <span className="info-icon">
                <Info size={16} className="info-icon-svg" />
                <span className="tooltip">Create events that affect process execution</span>
              </span>
            </h3>
            <div className="event-controls">
              <button
                className={`control-button ${buttonState.schedule ? "" : "disabled"}`}
                onClick={() => handleCommand("schedule")}
                disabled={!buttonState.schedule}
              >
                Schedule
                <span className="tooltip">Select the next process to run on the CPU</span>
              </button>

              <button
                className={`control-button ${buttonState.terminate ? "" : "disabled"}`}
                onClick={() => handleCommand("terminate")}
                disabled={!buttonState.terminate}
              >
                Terminate
                <span className="tooltip">End the currently running process</span>
              </button>

              <button
                className={`control-button ${buttonState.io ? "" : "disabled"}`}
                onClick={() => handleCommand("io_int")}
                disabled={!buttonState.io}
              >
                I/O Interrupt
                <span className="tooltip">Move the running process to the waiting queue for I/O</span>
              </button>

              <button
                className={`control-button ${state.Waiting.length > 0 ? "" : "disabled"}`}
                onClick={() => handleCommand("io_cmpl")}
                disabled={state.Waiting.length === 0}
              >
                I/O Complete
                <span className="tooltip">Move a process from waiting to ready queue after I/O completion</span>
              </button>

              <button
                className={`control-button ${buttonState.int ? "" : "disabled"}`}
                onClick={() => handleCommand("int")}
                disabled={!buttonState.int}
              >
                Interrupt
                <span className="tooltip">Interrupt the running process and move it back to ready queue</span>
              </button>

              <div className="process-control">
                <button
                  className={`control-button ${buttonState.newProcess ? "" : "disabled"}`}
                  onClick={() => handleCommand("newProcess")}
                  disabled={!buttonState.newProcess}
                >
                  + New process
                  <span className="tooltip">Create a new process with specified burst time</span>
                </button>

                {showProcessDropdown && (
                  <div className="dropdown-content">
                    <textarea
                      placeholder="Enter Burst Time (1-30)"
                      value={burstTime}
                      onChange={(e) => setBurstTime(e.target.value)}
                      rows={2}
                    />
                    <button className="dropdown-button" onClick={createProcess}>
                      Create
                    </button>
                  </div>
                )}
              </div>

              {state.Policy === "RR" && !state.quantum && (
                <div className="quantum-control">
                  <button className="control-button" onClick={() => setShowQuantumDropdown(!showQuantumDropdown)}>
                    Set Quantum
                  </button>

                  {showQuantumDropdown && (
                    <div className="dropdown-content">
                      <textarea
                        placeholder="Enter Quantum (1-15)"
                        value={quantum}
                        onChange={(e) => setQuantum(e.target.value)}
                        rows={2}
                      />
                      <button className="dropdown-button" onClick={setQuantumValue}>
                        Set
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <h3>
              Undo & Redo
              <span className="info-icon">
                <Info size={16} className="info-icon-svg" />
                <span className="tooltip">Navigate through simulation history</span>
              </span>
            </h3>
            <div className="history-controls">
              <button
                className={`control-button ${stateActionLog.length > 1 ? "" : "disabled"}`}
                onClick={undo}
                disabled={stateActionLog.length <= 1}
              >
                Undo
                <span className="tooltip">Go back to the previous state</span>
              </button>

              <button
                className={`control-button ${redoLog.length > 0 ? "" : "disabled"}`}
                onClick={redo}
                disabled={redoLog.length === 0}
              >
                Redo
                <span className="tooltip">Redo the previously undone action</span>
              </button>

              <button className="control-button reset" onClick={reset}>
                Reset
                <span className="tooltip">Reset the simulation to its initial state</span>
              </button>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="dialog-header">
            <h2>
              Dialog box
              <span className="info-icon">
                <Info size={16} className="info-icon-svg" />
                <span className="tooltip">Shows feedback and guidance for the simulation</span>
              </span>
            </h2>
            <button className="settings-button" onClick={() => setShowDialogHistory(!showDialogHistory)}>
              {showDialogHistory ? "Hide History" : "Show History"}
              <span className="tooltip">Toggle between current dialog and history</span>
            </button>
          </div>

          <div className="dialog-content">
            {showDialogHistory ? (
              <div className="dialog-history">
                {dialogHistory.map((dialog, index) => (
                  <div key={index} className="dialog-item">
                    <div className="feedback-label">Feedback</div>
                    <p className="feedback">{dialog.feedback}</p>

                    {dialog.prompt && (
                      <>
                        <div className="prompt-label">Prompt</div>
                        <p className="prompt">{dialog.prompt}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="current-dialog">
                <div className="feedback-label">Feedback</div>
                <p className="feedback">{currentDialog.feedback}</p>

                {currentDialog.prompt && (
                  <>
                    <div className="prompt-label">Prompt</div>
                    <p className="prompt">{currentDialog.prompt}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      {showAlert && (
        <div className="alert-overlay">
          <div className="alert-dialog">
            <div className="alert-content">
              <div className="alert-icon">
                <Info size={20} />
              </div>
              <p className="alert-message">{alertMessage}</p>
            </div>
            <button className="alert-button" onClick={() => setShowAlert(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
