import type React from "react"
import { useState, useRef, useEffect } from "react"
import { AlertCircle, Info, Play, Pause, RotateCcw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { ProcessStep, BufferItem, LogEntry, ProcessState } from "./types"

const BUFFER_SIZE = 5
const COLORS = {
  empty: "#FFFFFF",
  full: "#98CB3B",
  locked: "#96A0A3",
  producer: "#176696",
  consumer: "#2C9AD1",
}

const BoundedBufferSimulator: React.FC = () => {
  const [buffer, setBuffer] = useState<BufferItem[]>(
    Array.from({ length: BUFFER_SIZE }, (_, i) => ({ id: i, state: "empty" })),
  )
  const [producerState, setProducerState] = useState<ProcessState>({
    currentStep: "idle",
    isActive: false,
    canProceed: true,
  })
  const [consumerState, setConsumerState] = useState<ProcessState>({
    currentStep: "idle",
    isActive: false,
    canProceed: true,
  })
  const [producerPos, setProducerPos] = useState(0)
  const [consumerPos, setConsumerPos] = useState(0)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const producerSteps: ProcessStep[] = ["waiting_not_full", "locking", "depositing", "unlocking", "notify_not_empty"]
  const consumerSteps: ProcessStep[] = ["waiting_not_empty", "locking", "retrieving", "unlocking", "notify_not_full"]

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000) // 5 seconds timeout

      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayIntervalRef.current = setInterval(() => {
        if (Math.random() < 0.5) {
          handleProducerStep()
        } else {
          handleConsumerStep()
        }
      }, 1000) // Run every second
    } else if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current)
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current)
      }
    }
  }, [isAutoPlaying])

  const addLog = (action: string, type: "info" | "error" | "success", step: ProcessStep) => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: Date.now(),
        action,
        type,
        step,
      },
    ])
  }

  const isBufferEmpty = () => buffer.every((item) => item.state === "empty")
  const isBufferFull = () => buffer.every((item) => item.state === "full")

  const handleProducerStep = () => {
    if (!producerState.canProceed) return

    let nextStep: ProcessStep = "idle"
    let canProceed = true

    if (producerState.currentStep === "idle") {
      nextStep = producerSteps[0]
    } else {
      const currentIndex = producerSteps.indexOf(producerState.currentStep)
      if (currentIndex >= 0 && currentIndex < producerSteps.length - 1) {
        nextStep = producerSteps[currentIndex + 1]
      }
    }

    switch (nextStep) {
      case "waiting_not_full":
        if (isBufferFull()) {
          setError("Buffer is full! Producer must wait.")
          addLog("Buffer full - producer waiting", "error", "waiting_not_full")
          nextStep = "idle"
          canProceed = true
        } else {
          addLog("Buffer not full - producer can proceed", "success", "waiting_not_full")
        }
        break
      case "locking":
        if (buffer[producerPos].state === "locked") {
          setError("Buffer is already locked!")
          canProceed = false
          addLog("Failed to lock - already locked", "error", "locking")
        } else {
          const newBuffer = [...buffer]
          newBuffer[producerPos].state = "locked"
          setBuffer(newBuffer)
          addLog("Buffer locked by producer", "info", "locking")
        }
        break
      case "depositing":
        const newBuffer = [...buffer]
        newBuffer[producerPos].state = "full"
        setBuffer(newBuffer)
        addLog("Item deposited in buffer", "success", "depositing")
        break
      case "unlocking":
        const unlockedBuffer = [...buffer]
        if (unlockedBuffer[producerPos].state === "locked") {
          unlockedBuffer[producerPos].state = "full"
        }
        setBuffer(unlockedBuffer)
        addLog("Buffer unlocked by producer", "info", "unlocking")
        break
      case "notify_not_empty":
        addLog("Notifying consumers: Buffer is not empty", "info", "notify_not_empty")
        setProducerPos((prev) => (prev + 1) % BUFFER_SIZE)
        nextStep = "idle"
        break
    }

    setProducerState((prevState) => ({
      currentStep: nextStep,
      isActive: nextStep !== "idle",
      canProceed: nextStep === "idle" ? true : canProceed,
    }))

    // Allow consumer to proceed if buffer is no longer empty
    if (!isBufferEmpty()) {
      setConsumerState((prev) => ({ ...prev, canProceed: true }))
    }
  }

  const handleConsumerStep = () => {
    if (!consumerState.canProceed) return

    let nextStep: ProcessStep = "idle"
    let canProceed = true

    if (consumerState.currentStep === "idle") {
      nextStep = consumerSteps[0]
    } else {
      const currentIndex = consumerSteps.indexOf(consumerState.currentStep)
      if (currentIndex >= 0 && currentIndex < consumerSteps.length - 1) {
        nextStep = consumerSteps[currentIndex + 1]
      }
    }

    switch (nextStep) {
      case "waiting_not_empty":
        if (isBufferEmpty()) {
          setError("Buffer is empty! Consumer must wait.")
          addLog("Buffer empty - consumer waiting", "error", "waiting_not_empty")
          nextStep = "idle"
          canProceed = true
        } else {
          addLog("Buffer not empty - consumer can proceed", "success", "waiting_not_empty")
        }
        break
      case "locking":
        if (buffer[consumerPos].state === "locked") {
          setError("Buffer is already locked!")
          canProceed = false
          addLog("Failed to lock - already locked", "error", "locking")
        } else {
          const newBuffer = [...buffer]
          newBuffer[consumerPos].state = "locked"
          setBuffer(newBuffer)
          addLog("Buffer locked by consumer", "info", "locking")
        }
        break
      case "retrieving":
        const newBuffer = [...buffer]
        newBuffer[consumerPos].state = "empty"
        setBuffer(newBuffer)
        addLog("Item retrieved from buffer", "success", "retrieving")
        break
      case "unlocking":
        const unlockedBuffer = [...buffer]
        if (unlockedBuffer[consumerPos].state === "locked") {
          unlockedBuffer[consumerPos].state = "empty"
        }
        setBuffer(unlockedBuffer)
        addLog("Buffer unlocked by consumer", "info", "unlocking")
        break
      case "notify_not_full":
        addLog("Notifying producers: Buffer is not full", "info", "notify_not_full")
        setConsumerPos((prev) => (prev + 1) % BUFFER_SIZE)
        nextStep = "idle"
        break
    }

    setConsumerState((prevState) => ({
      currentStep: nextStep,
      isActive: nextStep !== "idle",
      canProceed: nextStep === "idle" ? true : canProceed,
    }))

    // Allow producer to proceed if buffer is no longer full
    if (!isBufferFull()) {
      setProducerState((prev) => ({ ...prev, canProceed: true }))
    }
  }

  const handleAutoPlay = () => {
    setIsAutoPlaying((prev) => !prev)
  }

  const handleReset = () => {
    setBuffer(Array.from({ length: BUFFER_SIZE }, (_, i) => ({ id: i, state: "empty" })))
    setProducerState({ currentStep: "idle", isActive: false, canProceed: true })
    setConsumerState({ currentStep: "idle", isActive: false, canProceed: true })
    setProducerPos(0)
    setConsumerPos(0)
    setLogs([])
    setError(null)
    setIsAutoPlaying(false)
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Bounded Buffer Simulator</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold mb-2" id="producer-controls">
            Producer Controls
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleProducerStep}
                  disabled={!producerState.canProceed || consumerState.isActive || isAutoPlaying}
                  className="w-full"
                  aria-labelledby="producer-controls"
                  aria-describedby="producer-step-description"
                >
                  {producerState.currentStep === "idle"
                    ? "Start Producing"
                    : `Step ${producerSteps.indexOf(producerState.currentStep) + 1}: ${producerState.currentStep.replace("_", " ")}`}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to progress through the producer's steps:</p>
                <ol className="list-decimal list-inside">
                  <li>Wait until buffer is not full</li>
                  <li>Lock buffer</li>
                  <li>Deposit item</li>
                  <li>Unlock buffer</li>
                  <li>Notify that buffer is not empty</li>
                </ol>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p id="producer-step-description" className="sr-only">
            Current step: {producerState.currentStep}.
            {producerState.canProceed
              ? "Click to proceed to the next step."
              : "Waiting for the buffer to be available."}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2" id="consumer-controls">
            Consumer Controls
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleConsumerStep}
                  disabled={!consumerState.canProceed || producerState.isActive || isAutoPlaying}
                  className="w-full"
                  aria-labelledby="consumer-controls"
                  aria-describedby="consumer-step-description"
                >
                  {consumerState.currentStep === "idle"
                    ? "Start Consuming"
                    : `Step ${consumerSteps.indexOf(consumerState.currentStep) + 1}: ${consumerState.currentStep.replace("_", " ")}`}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to progress through the consumer's steps:</p>
                <ol className="list-decimal list-inside">
                  <li>Wait until buffer is not empty</li>
                  <li>Lock buffer</li>
                  <li>Retrieve item</li>
                  <li>Unlock buffer</li>
                  <li>Notify that buffer is not full</li>
                </ol>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p id="consumer-step-description" className="sr-only">
            Current step: {consumerState.currentStep}.
            {consumerState.canProceed
              ? "Click to proceed to the next step."
              : "Waiting for the buffer to be available."}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2" id="simulation-controls">
            Simulation Controls
          </h2>
          <div className="flex space-x-2">
            <Button
              onClick={handleAutoPlay}
              className="flex-1"
              aria-label={isAutoPlaying ? "Pause simulation" : "Start auto-play simulation"}
            >
              {isAutoPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isAutoPlaying ? "Pause" : "Auto-play"}
            </Button>
            <Button onClick={handleReset} className="flex-1" aria-label="Reset simulation">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="flex mb-6">
        {buffer.map((item, index) => (
          <TooltipProvider key={item.id}>
            <Tooltip>
              <TooltipTrigger>
                <div
                  className="w-20 h-20 border border-gray-300 flex items-center justify-center mr-2 relative"
                  style={{
                    backgroundColor: COLORS[item.state],
                    outline:
                      index === producerPos
                        ? `3px solid ${COLORS.producer}`
                        : index === consumerPos
                          ? `3px solid ${COLORS.consumer}`
                          : "none",
                  }}
                  role="cell"
                  aria-label={`Buffer position ${index}, state: ${item.state}`}
                >
                  <span className="text-sm">{index}</span>
                  {item.state === "full" && <div className="w-4 h-4 bg-black rounded-full" />}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Position: {index}</p>
                <p>State: {item.state}</p>
                {index === producerPos && <p>Producer is here</p>}
                {index === consumerPos && <p>Consumer is here</p>}
                <p>
                  Current step:{" "}
                  {index === producerPos
                    ? producerState.currentStep
                    : index === consumerPos
                      ? consumerState.currentStep
                      : "none"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4 relative">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="absolute top-2 right-2"
            aria-label="Close error message"
          >
            X
          </Button>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Legend</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS.empty, border: "1px solid black" }}></div>
              <span>Empty</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS.full }}></div>
              <span>Full</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS.locked }}></div>
              <span>Locked</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS.producer }}></div>
              <span>Producer Position</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS.consumer }}></div>
              <span>Consumer Position</span>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Process Steps</h2>
          <div className="space-y-1 text-sm">
            <p>Producer: wait → lock → deposit → unlock → notify not empty</p>
            <p>Consumer: wait → lock → retrieve → unlock → notify not full</p>
            <div className="mt-2 flex items-start">
              <Info className="h-4 w-4 mr-1 mt-1" />
              <p>Each step must complete before moving to the next. Watch for errors and buffer states!</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2" id="operation-log">
          Operation Log
          <TooltipProvider>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Operation Log Information</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <h3 className="font-semibold mb-2">Operation Log</h3>
                <p>
                  This log shows a chronological record of all actions and events in the simulator. Each entry includes:
                </p>
                <ul className="list-disc list-inside">
                  <li>Timestamp</li>
                  <li>Action description</li>
                  <li>Status (success, error, or info)</li>
                </ul>
                <p className="mt-2">
                  Use this log to track the sequence of events and understand the producer-consumer interactions.
                </p>
              </PopoverContent>
            </Popover>
          </TooltipProvider>
        </h2>
        <div
          ref={logRef}
          className="h-48 overflow-y-auto border border-gray-300 p-2 rounded"
          aria-labelledby="operation-log"
          tabIndex={0}
          role="log"
        >
          {logs.map((log, index) => (
            <div
              key={index}
              className={`mb-1 ${
                log.type === "error" ? "text-red-600" : log.type === "success" ? "text-green-600" : "text-gray-600"
              }`}
            >
              <span className="font-mono text-xs">{new Date(log.timestamp).toLocaleTimeString()} -</span> {log.action}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BoundedBufferSimulator

