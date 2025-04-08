import { Button } from "@/components/ui/button"
import { LogOut, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

interface SimulationAreaProps {
  process0State: string
  process1State: string
  flag0: boolean
  flag1: boolean
  turn: number
  selectedProcess: number | null
  alert: { message: string; show: boolean }
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
  alert,
  onSelectProcess,
  onToggleFlag,
  onToggleTurn,
  onEnterCriticalSection,
  onExitCriticalSection,
}: SimulationAreaProps) {
  const getProcessColor = (state: string) => {
    switch (state) {
      case "inactive":
        return "bg-gray-300"
      case "active":
        return "bg-green-500"
      case "waiting":
        return "bg-yellow-400"
      case "critical":
        return "bg-red-500" // Changed from blue to red
      default:
        return "bg-gray-300"
    }
  }

  const getFlagColor = (flag: boolean) => {
    return flag ? "bg-green-500" : "bg-gray-300"
  }

  const isAnyCritical = process0State === "critical" || process1State === "critical"

  // Process 0 component
  const Process0Component = () => (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center mb-3 font-medium text-sm sm:text-base">Process 0</div>
      <div
        className={cn(
          "w-16 h-16 sm:w-28 sm:h-28 rounded-md flex items-center justify-center text-white font-bold text-xl transition-colors duration-300 cursor-pointer hover:opacity-80",
          getProcessColor(process0State),
          selectedProcess === 0 ? "ring-4 ring-primary" : "",
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
      </div>
      <div className="mt-3">
        <Button
          size="sm"
          onClick={() => onEnterCriticalSection(0)}
          disabled={selectedProcess !== 0}
          className="text-xs px-2 py-1 h-auto sm:h-9 sm:px-4 sm:py-2 bg-blue-500"
        >
          Enter Critical Section
        </Button>
      </div>
    </div>
  )

  // Process 1 component
  const Process1Component = () => (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center mb-3 font-medium text-sm sm:text-base">Process 1</div>
      <div
        className={cn(
          "w-16 h-16 sm:w-28 sm:h-28 rounded-md flex items-center justify-center text-white font-bold text-xl transition-colors duration-300 cursor-pointer hover:opacity-80",
          getProcessColor(process1State),
          selectedProcess === 1 ? "ring-4 ring-primary" : "",
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
      </div>
      <div className="mt-3">
        <Button
          size="sm"
          onClick={() => onEnterCriticalSection(1)}
          disabled={selectedProcess !== 1}
          className="text-xs px-2 py-1 h-auto sm:h-9 sm:px-4 sm:py-2 bg-blue-500"
        >
          Enter Critical Section
        </Button>
      </div>
    </div>
  )

  // Critical Section component
  const CriticalSectionComponent = () => (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center mb-3 font-medium">
        <span className="text-sm sm:text-base">Turn = </span>
        <span
          className={cn(
            "inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white font-bold transition-colors duration-300 cursor-pointer hover:opacity-80",
            turn === 0 ? "bg-green-500" : "bg-yellow-400",
          )}
          role="button"
          tabIndex={0}
          aria-label={`Turn is ${turn}. Click to toggle.`}
          onClick={onToggleTurn}
          onKeyDown={(e) => e.key === "Enter" && onToggleTurn()}
        >
          {turn}
        </span>
      </div>
      <div
        className={cn(
          "w-full h-24 sm:h-40 border-4 rounded-lg flex items-center justify-center font-bold text-base sm:text-xl transition-colors duration-300",
          process0State === "critical"
            ? "border-red-500 bg-red-100" // Changed from blue to red
            : process1State === "critical"
              ? "border-red-500 bg-red-100" // Changed from blue to red
              : "border-gray-300",
        )}
      >
        {process0State === "critical"
          ? "Process 0 in Critical Section"
          : process1State === "critical"
            ? "Process 1 in Critical Section"
            : "Critical Section"}
      </div>
      <div className="mt-3">
        <Button
          onClick={onExitCriticalSection}
          disabled={!isAnyCritical}
          variant="secondary"
          className="flex items-center gap-1 text-xs px-2 py-1 h-auto sm:h-9 sm:px-4 sm:py-2"
        >
          <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
          Exit Critical Section
        </Button>
      </div>
    </div>
  )

  return (
    <TooltipProvider>
      <div className="h-full">
        <div className="flex items-center mb-4">
          <h2 className="font-semibold">Simulation</h2>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-black cursor-help ml-1" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Interactive simulation of Peterson&apos;s Solution. Click on processes, flags, and turn to interact.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Desktop layout - 3 columns */}
        <div className="hidden sm:grid sm:grid-cols-3 sm:gap-6">
          <Process0Component />
          <CriticalSectionComponent />
          <Process1Component />
        </div>

        {/* Mobile layout - vertical stack */}
        <div className="sm:hidden space-y-6">
          <Process0Component />
          <CriticalSectionComponent />
          <Process1Component />
        </div>

        {alert.show && (
          <div className="mt-4">
            <Alert className="border-red-500 bg-red-50 text-red-700">
              <AlertCircle className="h-4 w-4 text-red-700" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
