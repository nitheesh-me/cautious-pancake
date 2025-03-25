import { ChevronDown, ChevronUp, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

interface InstructionsProps {
  collapsed: boolean
  onToggle: () => void
  infoTooltip?: string
}

export default function Instructions({ collapsed, onToggle, infoTooltip }: InstructionsProps) {
  return (
    <TooltipProvider>
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 flex items-center cursor-pointer" onClick={onToggle}>
          <h2 className="font-semibold">Instructions</h2>
          {infoTooltip && (
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-black cursor-help ml-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{infoTooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
          <div className="flex-1"></div>
          <button
            className="text-gray-500 hover:text-gray-700"
            aria-label={collapsed ? "Expand instructions" : "Collapse instructions"}
          >
            {collapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </button>
        </div>

        {!collapsed && (
          <div className="p-4 pt-0 border-t">
            <div className="space-y-2">
              <p>
                This sandbox allows you to explore Peterson&apos;s Solution for mutual exclusion between two processes.
                Follow these steps to understand how it works:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  Click <strong>Start</strong> to begin the simulation.
                </li>
                <li>Click on a process (P0 or P1) to select it.</li>
                <li>
                  Click on the process&apos;s flag to set it to true (indicating interest in entering the critical
                  section).
                </li>
                <li>Click on the turn variable to give priority to the other process.</li>
                <li>
                  Click the <strong>Enter Critical Section</strong> button to attempt to enter the critical section.
                </li>
                <li>
                  If a process is in the critical section, click the <strong>Exit Critical Section</strong> button to
                  make it exit.
                </li>
              </ol>
              <p className="mt-2 text-sm text-gray-600">
                <strong>Note:</strong> Peterson&apos;s Solution guarantees mutual exclusion (no two processes in
                critical section at once), progress (processes outside critical section don&apos;t block others), and
                bounded waiting (no process waits forever).
              </p>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

