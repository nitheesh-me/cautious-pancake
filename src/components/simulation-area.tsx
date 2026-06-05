"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface SimulationAreaProps {
  process0State: string
  process1State: string
  flag0: boolean
  flag1: boolean
  turn: number
  selectedProcess: number | null
  onSelectProcess: (processIndex: number) => void
  onToggleFlag: (flagIndex: number) => void
  onToggleTurn: () => void
  onEnterCriticalSection: (processIndex: number) => void
  onExitCriticalSection: () => void
}

export default function SimulationArea({
  process0State,
  process1State,
  flag0,
  flag1,
  turn,
  selectedProcess,
  onSelectProcess,
  onToggleFlag,
  onToggleTurn,
  onEnterCriticalSection,
  onExitCriticalSection,
}: SimulationAreaProps) {
  // State color map per spec:
  // inactive → bg-gray-400
  // active (flag set, wants CS) → bg-blue-500
  // waiting (spinning wait) → bg-yellow-400
  // critical (in CS) → bg-green-500
  const getProcessColor = (state: string) => {
    switch (state) {
      case "inactive": return "bg-gray-400"
      case "active":   return "bg-blue-500"
      case "waiting":  return "bg-yellow-400"
      case "critical": return "bg-green-500"
      default:         return "bg-gray-400"
    }
  }

  // Flag: true → bg-green-500, false → bg-gray-300
  const getFlagColor = (flag: boolean) => flag ? "bg-green-500" : "bg-gray-300"

  const isAnyCritical = process0State === "critical" || process1State === "critical"

  const Process0Component = () => (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center mb-3 font-medium text-sm sm:text-base">Process 0</div>
      <div
        className={cn(
          "w-16 h-16 sm:w-24 sm:h-24 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base",
          "cursor-pointer hover:opacity-80 transition-colors duration-200 process-card",
          getProcessColor(process0State),
          selectedProcess === 0 ? "ring-4 ring-primary ring-offset-2" : "",
        )}
        role="button"
        tabIndex={0}
        aria-label={`Process 0 is ${process0State}. Click to select.`}
        onClick={() => onSelectProcess(0)}
        onKeyDown={(e) => e.key === "Enter" && onSelectProcess(0)}
      >
        P0
      </div>
      <div className="mt-3 text-center">
        <div className="font-medium mb-1 text-xs sm:text-sm">Flag[0]</div>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-full mx-auto flex items-center justify-center text-white font-bold transition-colors duration-300 cursor-pointer hover:opacity-80",
                getFlagColor(flag0),
              )}
              role="button"
              tabIndex={0}
              aria-label={`Flag 0 is ${flag0 ? "true" : "false"}. Click to toggle.`}
              onClick={() => onToggleFlag(0)}
              onKeyDown={(e) => e.key === "Enter" && onToggleFlag(0)}
            >
              {flag0 ? "T" : "F"}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>flag[0] = {flag0 ? "true" : "false"}. Click to toggle.</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="mt-3">
        <Button
          size="sm"
          onClick={() => onEnterCriticalSection(0)}
          disabled={selectedProcess !== 0}
          className="text-xs px-2 py-1 h-auto sm:h-9 sm:px-3"
        >
          Enter CS
        </Button>
      </div>
    </div>
  )

  const Process1Component = () => (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center mb-3 font-medium text-sm sm:text-base">Process 1</div>
      <div
        className={cn(
          "w-16 h-16 sm:w-24 sm:h-24 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base",
          "cursor-pointer hover:opacity-80 transition-colors duration-200 process-card",
          getProcessColor(process1State),
          selectedProcess === 1 ? "ring-4 ring-primary ring-offset-2" : "",
        )}
        role="button"
        tabIndex={0}
        aria-label={`Process 1 is ${process1State}. Click to select.`}
        onClick={() => onSelectProcess(1)}
        onKeyDown={(e) => e.key === "Enter" && onSelectProcess(1)}
      >
        P1
      </div>
      <div className="mt-3 text-center">
        <div className="font-medium mb-1 text-xs sm:text-sm">Flag[1]</div>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-full mx-auto flex items-center justify-center text-white font-bold transition-colors duration-300 cursor-pointer hover:opacity-80",
                getFlagColor(flag1),
              )}
              role="button"
              tabIndex={0}
              aria-label={`Flag 1 is ${flag1 ? "true" : "false"}. Click to toggle.`}
              onClick={() => onToggleFlag(1)}
              onKeyDown={(e) => e.key === "Enter" && onToggleFlag(1)}
            >
              {flag1 ? "T" : "F"}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>flag[1] = {flag1 ? "true" : "false"}. Click to toggle.</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="mt-3">
        <Button
          size="sm"
          onClick={() => onEnterCriticalSection(1)}
          disabled={selectedProcess !== 1}
          className="text-xs px-2 py-1 h-auto sm:h-9 sm:px-3"
        >
          Enter CS
        </Button>
      </div>
    </div>
  )

  const CriticalSectionComponent = () => (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center mb-3 font-medium text-sm sm:text-base flex items-center gap-2">
        <span>Turn =</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white font-bold transition-colors duration-300 cursor-pointer hover:opacity-80",
                turn === 0 ? "bg-blue-500" : "bg-purple-500",
              )}
              role="button"
              tabIndex={0}
              aria-label={`Turn is ${turn}. Click to toggle.`}
              onClick={onToggleTurn}
              onKeyDown={(e) => e.key === "Enter" && onToggleTurn()}
            >
              {turn}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>turn = {turn}. Click to toggle priority.</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div
        className={cn(
          "w-full h-24 sm:h-36 border-4 rounded-lg flex items-center justify-center font-bold text-sm sm:text-base transition-colors duration-300 text-center px-2",
          process0State === "critical"
            ? "border-green-500 bg-green-50 text-green-900"
            : process1State === "critical"
              ? "border-green-500 bg-green-50 text-green-900"
              : "border-gray-300 text-muted-foreground",
        )}
      >
        {process0State === "critical"
          ? "P0 in Critical Section"
          : process1State === "critical"
            ? "P1 in Critical Section"
            : "Critical Section"}
      </div>
      <div className="mt-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={isAnyCritical ? undefined : 0}>
              <Button
                onClick={onExitCriticalSection}
                disabled={!isAnyCritical}
                variant="secondary"
                className="flex items-center gap-1 text-xs px-2 py-1 h-auto sm:h-9 sm:px-3"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                Exit CS
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isAnyCritical ? "Exit the critical section" : "No process is currently in the critical section"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )

  return (
    <div className="h-full">
      {/* Desktop layout — 3 columns */}
      <div className="hidden sm:grid sm:grid-cols-3 sm:gap-6 items-start">
        <Process0Component />
        <CriticalSectionComponent />
        <Process1Component />
      </div>

      {/* Mobile layout — vertical stack */}
      <div className="sm:hidden space-y-6">
        <Process0Component />
        <CriticalSectionComponent />
        <Process1Component />
      </div>

      {/* State legend inline for context */}
      <div className="mt-4 pt-3 border-t">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Info className="h-3 w-3 text-blue-600" />
            <span>Click a process to select, then toggle flags and turn.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
