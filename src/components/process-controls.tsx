"use client"

import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

interface ProcessControlsProps {
  simulationState: string
  selectedProcess: number | null
  onStart: () => void
  onPause: () => void
  onReset: () => void
}

export default function ProcessControls({
  simulationState,
  selectedProcess,
  onStart,
  onPause,
  onReset,
}: ProcessControlsProps) {
  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center mb-2">
          <h2 className="font-semibold">Controls</h2>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-black cursor-help ml-1" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Use these controls to start, pause, and reset the simulation.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {simulationState === "running" ? (
            <Button onClick={onPause} className="flex items-center gap-1">
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          ) : (
            <Button onClick={onStart} className="flex items-center gap-1">
              <Play className="h-4 w-4" />
              Start
            </Button>
          )}

          <Button onClick={onReset} variant="outline" className="flex items-center gap-1">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="mt-4 p-2 bg-gray-100 rounded-md">
          <p className="text-sm font-medium">Selected Process:</p>
          <p className="text-lg font-bold text-center mt-1">
            {selectedProcess !== null ? `P${selectedProcess}` : "None"}
          </p>
        </div>

        <div className="mt-4">
          <div className="flex items-center mb-2">
            <h3 className="font-medium">Legend</h3>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-black cursor-help ml-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Color codes for different process states in the simulation.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-gray-300"></div>
              <span>Inactive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-green-500"></div>
              <span>Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-yellow-400"></div>
              <span>Waiting</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-red-500"></div>
              <span>In Critical Section</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

