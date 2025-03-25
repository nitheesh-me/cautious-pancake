"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { AlertCircle, Info, RotateCcw, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { ProcessStep, BufferItem, LogEntry, ProcessState } from "../types"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const BUFFER_SIZE = 8
const COLORS = {
  empty: "#98FB98", // Light green for empty slots
  full: "#98FB98", // Same light green for filled slots
  locked: "#D3D3D3", // Gray for locked buffer
  producer: "#176696", // Dark blue for producer
  consumer: "#2C9AD1", // Light blue for consumer
  item: "#00BFFF", // Cyan/blue for items in buffer
}

// Semaphore states
interface SemaphoreState {
  mutex: number
  empty: number
  full: number
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
  const [isBufferLocked, setIsBufferLocked] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  // Initialize semaphores
  const [semaphores, setSemaphores] = useState<SemaphoreState>({
    mutex: 1, // Controls access to the buffer
    empty: BUFFER_SIZE, // Counts available slots
    full: 0, // Counts occupied slots
  })

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

  const addLog = (action: string, type: "info" | "error" | "success", step: ProcessStep) => {
    // Replace "notifying" with "signaling" in log messages
    const updatedAction = action.replace(/notifying/i, "signaling")

    setLogs((prev) => [
      ...prev,
      {
        timestamp: Date.now(),
        action: updatedAction,
        type,
        step,
      },
    ])
  }

  const isBufferEmpty = () => buffer.every((item) => item.state === "empty")
  const isBufferFull = () => buffer.every((item) => item.state === "full")

  // Semaphore operations
  const waitSemaphore = (semaphore: keyof SemaphoreState): boolean => {
    if (semaphores[semaphore] <= 0) {
      return false // Cannot proceed, semaphore is 0
    }

    setSemaphores((prev) => ({
      ...prev,
      [semaphore]: prev[semaphore] - 1,
    }))
    return true
  }

  const signalSemaphore = (semaphore: keyof SemaphoreState) => {
    setSemaphores((prev) => ({
      ...prev,
      [semaphore]: prev[semaphore] + 1,
    }))
  }

  // Producer state handlers
  const handleProducerWaitNotFull = () => {
    if (producerState.currentStep !== "idle" && producerState.currentStep !== "waiting_not_full") {
      setError("Incorrect state transition! Producer should be in 'idle' or 'waiting_not_full' state.")
      return
    }

    // wait(empty) - Wait if buffer is full
    if (!waitSemaphore("empty")) {
      setError("Buffer is full! Producer must wait.")
      addLog("Buffer full - producer waiting (empty semaphore = 0)", "error", "waiting_not_full")
      return
    }

    addLog("Buffer not full - producer can proceed (empty semaphore decremented)", "success", "waiting_not_full")
    setProducerState({
      currentStep: "locking",
      isActive: true,
      canProceed: true,
    })
  }

  const handleProducerLocking = () => {
    if (producerState.currentStep !== "locking") {
      setError("Incorrect state transition! Producer should be in 'locking' state.")
      return
    }

    // wait(mutex) - Enter critical section
    if (!waitSemaphore("mutex")) {
      setError("Buffer is already locked! (mutex semaphore = 0)")
      addLog("Failed to lock - mutex already acquired", "error", "locking")
      return
    }

    setIsBufferLocked(true)
    addLog("Buffer locked by producer (mutex semaphore decremented)", "info", "locking")
    setProducerState({
      currentStep: "depositing",
      isActive: true,
      canProceed: true,
    })
  }

  const handleProducerDepositing = () => {
    if (producerState.currentStep !== "depositing") {
      setError("Incorrect state transition! Producer should be in 'depositing' state.")
      return
    }

    const newBuffer = [...buffer]
    newBuffer[producerPos].state = "full"
    setBuffer(newBuffer)
    addLog("Item deposited in buffer", "success", "depositing")
    setProducerState({
      currentStep: "unlocking",
      isActive: true,
      canProceed: true,
    })
  }

  const handleProducerUnlocking = () => {
    if (producerState.currentStep !== "unlocking") {
      setError("Incorrect state transition! Producer should be in 'unlocking' state.")
      return
    }

    // signal(mutex) - Exit critical section
    signalSemaphore("mutex")
    setIsBufferLocked(false)
    addLog("Buffer unlocked by producer (mutex semaphore incremented)", "info", "unlocking")
    setProducerState({
      currentStep: "notify_not_empty",
      isActive: true,
      canProceed: true,
    })
  }

  const handleProducerNotifyNotEmpty = () => {
    if (producerState.currentStep !== "notify_not_empty") {
      setError("Incorrect state transition! Producer should be in 'notify_not_empty' state.")
      return
    }

    // signal(full) - Notify that an item is available
    signalSemaphore("full")
    addLog("Signaling consumers: Buffer is not empty (full semaphore incremented)", "info", "notify_not_empty")
    setProducerPos((prev) => (prev + 1) % BUFFER_SIZE)
    setProducerState({
      currentStep: "idle",
      isActive: false,
      canProceed: true,
    })
  }

  // Consumer state handlers
  const handleConsumerWaitNotEmpty = () => {
    if (consumerState.currentStep !== "idle" && consumerState.currentStep !== "waiting_not_empty") {
      setError("Incorrect state transition! Consumer should be in 'idle' or 'waiting_not_empty' state.")
      return
    }

    // wait(full) - Wait if buffer is empty
    if (!waitSemaphore("full")) {
      setError("Buffer is empty! Consumer must wait.")
      addLog("Buffer empty - consumer waiting (full semaphore = 0)", "error", "waiting_not_empty")
      return
    }

    addLog("Buffer not empty - consumer can proceed (full semaphore decremented)", "success", "waiting_not_empty")
    setConsumerState({
      currentStep: "locking",
      isActive: true,
      canProceed: true,
    })
  }

  const handleConsumerLocking = () => {
    if (consumerState.currentStep !== "locking") {
      setError("Incorrect state transition! Consumer should be in 'locking' state.")
      return
    }

    // wait(mutex) - Enter critical section
    if (!waitSemaphore("mutex")) {
      setError("Buffer is already locked! (mutex semaphore = 0)")
      addLog("Failed to lock - mutex already acquired", "error", "locking")
      return
    }

    setIsBufferLocked(true)
    addLog("Buffer locked by consumer (mutex semaphore decremented)", "info", "locking")
    setConsumerState({
      currentStep: "retrieving",
      isActive: true,
      canProceed: true,
    })
  }

  const handleConsumerRetrieving = () => {
    if (consumerState.currentStep !== "retrieving") {
      setError("Incorrect state transition! Consumer should be in 'retrieving' state.")
      return
    }

    const newBuffer = [...buffer]
    newBuffer[consumerPos].state = "empty"
    setBuffer(newBuffer)
    addLog("Item retrieved from buffer", "success", "retrieving")
    setConsumerState({
      currentStep: "unlocking",
      isActive: true,
      canProceed: true,
    })
  }

  const handleConsumerUnlocking = () => {
    if (consumerState.currentStep !== "unlocking") {
      setError("Incorrect state transition! Consumer should be in 'unlocking' state.")
      return
    }

    // signal(mutex) - Exit critical section
    signalSemaphore("mutex")
    setIsBufferLocked(false)
    addLog("Buffer unlocked by consumer (mutex semaphore incremented)", "info", "unlocking")
    setConsumerState({
      currentStep: "notify_not_full",
      isActive: true,
      canProceed: true,
    })
  }

  const handleConsumerNotifyNotFull = () => {
    if (consumerState.currentStep !== "notify_not_full") {
      setError("Incorrect state transition! Consumer should be in 'notify_not_full' state.")
      return
    }

    // signal(empty) - Notify that a slot is available
    signalSemaphore("empty")
    addLog("Signaling producers: Buffer is not full (empty semaphore incremented)", "info", "notify_not_full")
    setConsumerPos((prev) => (prev + 1) % BUFFER_SIZE)
    setConsumerState({
      currentStep: "idle",
      isActive: false,
      canProceed: true,
    })
  }

  const handleReset = () => {
    setBuffer(Array.from({ length: BUFFER_SIZE }, (_, i) => ({ id: i, state: "empty" })))
    setProducerState({ currentStep: "idle", isActive: false, canProceed: true })
    setConsumerState({ currentStep: "idle", isActive: false, canProceed: true })
    setProducerPos(0)
    setConsumerPos(0)
    setLogs([])
    setError(null)
    setIsBufferLocked(false)
    setSemaphores({
      mutex: 1,
      empty: BUFFER_SIZE,
      full: 0,
    })
  }

  // Calculate positions for circular buffer
  const calculateCircularPosition = (index: number, total: number, radius: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2 // Start from top
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)
    return { x, y }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b">
        <div className="px-4 py-2">
          <h1 className="text-xl font-semibold">Bounded Buffer Simulator</h1>
        </div>
      </div>

      {/* Main content with collapsible instructions */}
      <div className="flex flex-col flex-1">
        {/* Instructions - Collapsible */}
        <Collapsible defaultOpen={false} className="w-full border-b">
          <div className="bg-gray-50 px-4 py-2">
            <CollapsibleTrigger className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <h2 className="text-lg font-medium">Instructions</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2 p-0 h-auto">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Instructions Information</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        These instructions explain how to use the bounded buffer simulator and understand the semaphore
                        implementation.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <ChevronDown className="h-5 w-5" />
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="bg-gray-50 px-4 pb-4">
              <div className="space-y-2">
                <p>
                  This simulator demonstrates the classic Producer-Consumer problem using a bounded buffer with
                  semaphores.
                </p>
                <h3 className="font-medium">How to use this simulation:</h3>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Follow the producer process by clicking the appropriate state buttons in sequence</li>
                  <li>Follow the consumer process by clicking the appropriate state buttons in sequence</li>
                  <li>Observe how semaphores control access to the shared buffer</li>
                  <li>Use the "Reset" button to restart the simulation</li>
                  <li>Observe the operation log to track events</li>
                </ol>
                <h3 className="font-medium mt-2">Semaphore implementation:</h3>
                <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                  <p>Initialize:</p>
                  <p className="pl-4">Semaphore mutex = 1 // Controls access to the buffer</p>
                  <p className="pl-4">Semaphore empty = N // Counts available slots (buffer size N)</p>
                  <p className="pl-4">Semaphore full = 0 // Counts occupied slots</p>
                  <p>Producer Process:</p>
                  <p className="pl-4">while (true) {"{"}</p>
                  <p className="pl-8">produce_item()</p>
                  <p className="pl-8">wait(empty) // Wait if buffer is full</p>
                  <p className="pl-8">wait(mutex) // Enter critical section</p>
                  <p className="pl-8">add_item_to_buffer()</p>
                  <p className="pl-8">signal(mutex) // Exit critical section</p>
                  <p className="pl-8">signal(full) // Notify that an item is available</p>
                  <p className="pl-4">{"}"}</p>
                  <p>Consumer Process:</p>
                  <p className="pl-4">while (true) {"{"}</p>
                  <p className="pl-8">wait(full) // Wait if buffer is empty</p>
                  <p className="pl-8">wait(mutex) // Enter critical section</p>
                  <p className="pl-8">remove_item_from_buffer()</p>
                  <p className="pl-8">signal(mutex) // Exit critical section</p>
                  <p className="pl-8">signal(empty) // Notify that a slot is available</p>
                  <p className="pl-8">consume_item()</p>
                  <p className="pl-4">{"}"}</p>
                </div>
                <h3 className="font-medium mt-2">Learning objectives:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Understand synchronization in concurrent systems</li>
                  <li>Learn how semaphores coordinate access to shared resources</li>
                  <li>Observe blocking conditions (full/empty buffer)</li>
                  <li>See how mutual exclusion prevents race conditions</li>
                  <li>Understand signaling between processes</li>
                </ul>
                <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm font-medium">Key observations:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Producer must wait when buffer is full (empty semaphore = 0)</li>
                    <li>Consumer must wait when buffer is empty (full semaphore = 0)</li>
                    <li>Only one process can access the buffer at a time (mutex semaphore = 0)</li>
                    <li>Processes signal each other after completing operations</li>
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Simulator content - will move down when instructions are expanded */}
        <div className="flex flex-1 overflow-auto flex-col md:flex-row">
          {/* Left column */}
          <div className="w-full md:w-1/4 border-r p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">
                  Producer States
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="ml-2">
                          <Info className="h-4 w-4" />
                          <span className="sr-only">Producer States Information</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          These buttons represent the different states in the producer process. Follow them in sequence
                          to simulate a producer adding items to the buffer.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h3>
                <div className="flex flex-col space-y-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => {
                            if (producerState.currentStep !== "idle") {
                              setError("Producer is already in a process. Complete the current cycle or reset.")
                              return
                            }
                            addLog("Producer wants to produce an item", "info", "idle")
                            setProducerState({
                              currentStep: "waiting_not_full",
                              isActive: true,
                              canProceed: true,
                            })
                          }}
                          className="w-full bg-green-500 hover:bg-green-600 mb-2"
                        >
                          Produce (Start Producer Cycle)
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Click to start the producer cycle. This simulates the producer wanting to produce an item.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleProducerWaitNotFull}
                          className={`w-full ${producerState.currentStep === "waiting_not_full" ? "bg-blue-700" : "bg-blue-500"} hover:bg-blue-600`}
                          aria-labelledby="producer-controls"
                        >
                          wait(empty) - Wait if buffer is full
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          The producer checks if there's space in the buffer. If the buffer is full (empty semaphore =
                          0), it must wait.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleProducerLocking}
                          className={`w-full ${producerState.currentStep === "locking" ? "bg-blue-700" : "bg-blue-500"} hover:bg-blue-600`}
                          aria-labelledby="producer-controls"
                        >
                          wait(mutex) - Enter critical section
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          The producer attempts to lock the buffer to ensure exclusive access. If already locked (mutex
                          = 0), it must wait.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleProducerDepositing}
                          className={`w-full ${producerState.currentStep === "depositing" ? "bg-blue-700" : "bg-blue-500"} hover:bg-blue-600`}
                          aria-labelledby="producer-controls"
                        >
                          add_item_to_buffer()
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The producer adds an item to the buffer at the current position.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleProducerUnlocking}
                          className={`w-full ${producerState.currentStep === "unlocking" ? "bg-blue-700" : "bg-blue-500"} hover:bg-blue-600`}
                          aria-labelledby="producer-controls"
                        >
                          signal(mutex) - Exit critical section
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The producer releases the lock on the buffer, allowing other processes to access it.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleProducerNotifyNotEmpty}
                          className={`w-full ${producerState.currentStep === "notify_not_empty" ? "bg-blue-700" : "bg-blue-500"} hover:bg-blue-600`}
                          aria-labelledby="producer-controls"
                        >
                          signal(full) - Notify item available
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          The producer signals that an item is available in the buffer, potentially waking up waiting
                          consumers.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">
                  Consumer States
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="ml-2">
                          <Info className="h-4 w-4" />
                          <span className="sr-only">Consumer States Information</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          These buttons represent the different states in the consumer process. Follow them in sequence
                          to simulate a consumer removing items from the buffer.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h3>
                <div className="flex flex-col space-y-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => {
                            if (consumerState.currentStep !== "idle") {
                              setError("Consumer is already in a process. Complete the current cycle or reset.")
                              return
                            }
                            addLog("Consumer wants to consume an item", "info", "idle")
                            setConsumerState({
                              currentStep: "waiting_not_empty",
                              isActive: true,
                              canProceed: true,
                            })
                          }}
                          className="w-full bg-green-500 hover:bg-green-600 mb-2"
                        >
                          Consume (Start Consumer Cycle)
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Click to start the consumer cycle. This simulates the consumer wanting to consume an item.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleConsumerWaitNotEmpty}
                          className={`w-full ${consumerState.currentStep === "waiting_not_empty" ? "bg-blue-700" : "bg-blue-500"} hover:bg-blue-600`}
                          aria-labelledby="consumer-controls"
                        >
                          wait(full) - Wait if buffer is empty
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          The consumer checks if there are items in the buffer. If the buffer is empty (full semaphore =
                          0), it must wait.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleConsumerLocking}
                          className={`w-full ${consumerState.currentStep === "locking" ? "bg-blue-700" : "bg-blue-500"} hover:bg-blue-600`}
                          aria-labelledby="consumer-controls"
                        >
                          wait(mutex) - Enter critical section
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          The consumer attempts to lock the buffer to ensure exclusive access. If already locked (mutex
                          = 0), it must wait.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleConsumerRetrieving}
                          className={`w-full ${consumerState.currentStep === "retrieving" ? "bg-blue-700" : "bg-blue-500"} hover:bg-blue-600`}
                          aria-labelledby="consumer-controls"
                        >
                          remove_item_from_buffer()
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The consumer removes an item from the buffer at the current position.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleConsumerUnlocking}
                          className={`w-full ${consumerState.currentStep === "unlocking" ? "bg-blue-700" : "bg-blue-500"} hover:bg-blue-600`}
                          aria-labelledby="consumer-controls"
                        >
                          signal(mutex) - Exit critical section
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The consumer releases the lock on the buffer, allowing other processes to access it.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleConsumerNotifyNotFull}
                          className={`w-full ${consumerState.currentStep === "notify_not_full" ? "bg-blue-700" : "bg-blue-500"} hover:bg-blue-600`}
                          aria-labelledby="consumer-controls"
                        >
                          signal(empty) - Notify slot available
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          The consumer signals that a slot is available in the buffer, potentially waking up waiting
                          producers.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>

          {/* Middle column */}
          <div className="w-full md:w-2/4 p-4">
            <div className="relative">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Simulation</h2>
                <div className="flex justify-center items-center mb-4 border-2 border-green-500 p-4 rounded-lg">
                  <div className="relative" style={{ width: "300px", height: "300px" }}>
                    {/* Circular buffer */}
                    <svg width="300" height="300" viewBox="-150 -150 300 300">
                      {/* Buffer segments */}
                      {buffer.map((item, index) => {
                        const segmentAngle = 360 / BUFFER_SIZE
                        const startAngle = (index * segmentAngle - 90) * (Math.PI / 180)
                        const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180)

                        const innerRadius = 60
                        const outerRadius = 100

                        const x1 = innerRadius * Math.cos(startAngle)
                        const y1 = innerRadius * Math.sin(startAngle)
                        const x2 = outerRadius * Math.cos(startAngle)
                        const y2 = outerRadius * Math.sin(startAngle)

                        const x3 = innerRadius * Math.cos(endAngle)
                        const y3 = innerRadius * Math.sin(endAngle)
                        const x4 = outerRadius * Math.cos(endAngle)
                        const y4 = outerRadius * Math.sin(endAngle)

                        const largeArcFlag = segmentAngle > 180 ? 1 : 0

                        // Path for the segment
                        const path = [
                          `M ${x1} ${y1}`,
                          `L ${x2} ${y2}`,
                          `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x4} ${y4}`,
                          `L ${x3} ${y3}`,
                          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
                          "Z",
                        ].join(" ")

                        // Position for the index label
                        const labelRadius = outerRadius + 15
                        const labelX = labelRadius * Math.cos((startAngle + endAngle) / 2)
                        const labelY = labelRadius * Math.sin((startAngle + endAngle) / 2)

                        // Position for item if slot is full
                        const itemRadius = 15
                        const itemCenterRadius = (innerRadius + outerRadius) / 2
                        const itemCenterX = itemCenterRadius * Math.cos((startAngle + endAngle) / 2)
                        const itemCenterY = itemCenterRadius * Math.sin((startAngle + endAngle) / 2)

                        return (
                          <g key={index}>
                            {/* Buffer segment */}
                            <path
                              d={path}
                              fill={isBufferLocked ? COLORS.locked : COLORS[item.state]}
                              stroke="black"
                              strokeWidth="1"
                            />

                            {/* Index label */}
                            <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fontSize="12">
                              {index}
                            </text>

                            {/* Item if slot is full */}
                            {item.state === "full" && (
                              <circle cx={itemCenterX} cy={itemCenterY} r={itemRadius} fill={COLORS.item} />
                            )}
                          </g>
                        )
                      })}

                      {/* Producer position indicator */}
                      {(() => {
                        const segmentAngle = 360 / BUFFER_SIZE
                        const midAngle = (producerPos * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180)
                        const indicatorRadius = 115
                        const x = indicatorRadius * Math.cos(midAngle)
                        const y = indicatorRadius * Math.sin(midAngle)

                        return (
                          <g>
                            <circle cx={x} cy={y} r="8" fill={COLORS.producer} />
                            <text
                              x={x + (x > 0 ? 15 : -15)}
                              y={y}
                              textAnchor={x > 0 ? "start" : "end"}
                              dominantBaseline="middle"
                              fontSize="12"
                              fontWeight="bold"
                            >
                              in
                            </text>
                          </g>
                        )
                      })()}

                      {/* Consumer position indicator */}
                      {(() => {
                        const segmentAngle = 360 / BUFFER_SIZE
                        const midAngle = (consumerPos * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180)
                        const indicatorRadius = 130 // Slightly larger radius to ensure visibility when overlapping
                        const x = indicatorRadius * Math.cos(midAngle)
                        const y = indicatorRadius * Math.sin(midAngle)

                        return (
                          <g>
                            <circle
                              cx={x}
                              cy={y}
                              r="8"
                              fill={COLORS.consumer}
                              stroke={producerPos === consumerPos ? "black" : "none"}
                              strokeWidth="1"
                            />
                            <text
                              x={x + (x > 0 ? 15 : -15)}
                              y={y}
                              textAnchor={x > 0 ? "start" : "end"}
                              dominantBaseline="middle"
                              fontSize="12"
                              fontWeight="bold"
                            >
                              out
                            </text>
                          </g>
                        )
                      })()}
                    </svg>
                  </div>
                </div>

                {/* Error alert positioned below the buffer visualization but inside simulation container */}
                {error && (
                  <Alert variant="destructive" className="mb-4">
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
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2" id="operation-log">
                  Operation Log
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="ml-2">
                          <Info className="h-4 w-4" />
                          <span className="sr-only">Operation Log Information</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>This log shows a chronological record of all actions and events in the simulator.</p>
                      </TooltipContent>
                    </Tooltip>
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
                        log.type === "error"
                          ? "text-red-600"
                          : log.type === "success"
                            ? "text-green-600"
                            : "text-gray-600"
                      }`}
                    >
                      <span className="font-mono text-xs">{new Date(log.timestamp).toLocaleTimeString()} -</span>{" "}
                      {log.action}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="w-full md:w-1/4 border-l p-4">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <h3 className="font-medium mb-2">
                  Process States
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="ml-2">
                          <Info className="h-4 w-4" />
                          <span className="sr-only">Process States Information</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>This shows the sequence of states that each process goes through during execution.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h3>
                <div className="space-y-1 text-sm">
                  <p>Producer: idle → wait(empty) → wait(mutex) → add_item → signal(mutex) → signal(full)</p>
                  <p>Consumer: idle → wait(full) → wait(mutex) → remove_item → signal(mutex) → signal(empty)</p>
                </div>

                <div className="pt-4">
                  <h4 className="font-medium mb-2">
                    Current State
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="ml-2">
                            <Info className="h-4 w-4" />
                            <span className="sr-only">Current State Information</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>This shows the current state of the producer, consumer, and buffer in the simulation.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h4>
                  <div className="text-sm space-y-2">
                    <p>
                      <strong>Producer:</strong> {producerState.currentStep}
                    </p>
                    <p>
                      <strong>Consumer:</strong> {consumerState.currentStep}
                    </p>
                    <p>
                      <strong>Buffer:</strong>{" "}
                      {isBufferEmpty() ? "Empty" : isBufferFull() ? "Full" : "Partially filled"}
                    </p>
                    <p>
                      <strong>Buffer Lock:</strong> {isBufferLocked ? "Locked" : "Unlocked"}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="font-medium mb-2">
                    Semaphore Values
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="ml-2">
                            <Info className="h-4 w-4" />
                            <span className="sr-only">Semaphore Values Information</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            This shows the current values of the semaphores used to coordinate access to the buffer.
                            Mutex controls exclusive access (1=available, 0=locked). Empty counts available slots. Full
                            counts occupied slots.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h4>
                  <div className="text-sm space-y-2">
                    <p>
                      <strong>mutex:</strong> {semaphores.mutex} (Controls buffer access)
                    </p>
                    <p>
                      <strong>empty:</strong> {semaphores.empty} (Available slots)
                    </p>
                    <p>
                      <strong>full:</strong> {semaphores.full} (Occupied slots)
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="font-medium mb-2">
                    Simulation Controls
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="ml-2">
                            <Info className="h-4 w-4" />
                            <span className="sr-only">Simulation Controls Information</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Use these controls to manage the simulation.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h4>
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={handleReset}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      aria-label="Reset simulation"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="font-medium mb-2">
                    Legend
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="ml-2">
                            <Info className="h-4 w-4" />
                            <span className="sr-only">Legend Information</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>This explains the colors and symbols used in the buffer visualization.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 mr-2"
                        style={{ backgroundColor: COLORS.empty, border: "1px solid black" }}
                      ></div>
                      <span>Buffer Slot</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS.item, borderRadius: "50%" }}></div>
                      <span>Item</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS.locked }}></div>
                      <span>Locked Buffer</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS.producer }}></div>
                      <span>Producer Position (in)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2" style={{ backgroundColor: COLORS.consumer }}></div>
                      <span>Consumer Position (out)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BoundedBufferSimulator

