"use client"

import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

interface Log {
  message: string
  type: string
  timestamp: string
}

interface ActionLogProps {
  logs: Log[]
}

export default function ActionLog({ logs }: ActionLogProps) {
  const logContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  const getLogColor = (type: string) => {
    switch (type) {
      case "info":
        return "text-gray-700"
      case "error":
        return "text-red-600"
      case "warning":
        return "text-yellow-600"
      case "process0":
        return "text-blue-600"
      case "process1":
        return "text-green-600"
      case "user":
        return "text-purple-600 font-medium"
      default:
        return "text-gray-700"
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-2">
        <h2 className="font-semibold">Action Log</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-black cursor-help ml-1" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Records all actions and state changes in the simulation with timestamps.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto border rounded-md p-2 bg-gray-50 h-[400px] max-h-[400px]"
        aria-live="polite"
      >
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center mt-4">No logs yet. Start the simulation to see activity.</p>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className={cn("text-sm", getLogColor(log.type))}>
                <span className="text-gray-500 text-xs">[{log.timestamp}]</span> {log.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

