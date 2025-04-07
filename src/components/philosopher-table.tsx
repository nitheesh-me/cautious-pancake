"use client"

import { useState } from "react"
import type { Philosopher, Chopstick } from "./dining-philosophers"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PhilosopherTableProps {
  philosophers: Philosopher[]
  chopsticks: Chopstick[]
  onPhilosopherClick: (id: number) => void
  onChopstickClick: (id: number) => void
  isSimulating: boolean
}

export function PhilosopherTable({
  philosophers,
  chopsticks,
  onPhilosopherClick,
  onChopstickClick,
  isSimulating,
}: PhilosopherTableProps) {
  const [hoveredElement, setHoveredElement] = useState<{ type: "philosopher" | "chopstick"; id: number } | null>(null)

  const getPhilosopherColor = (state: Philosopher["state"]) => {
    switch (state) {
      case "thinking":
        return "bg-gray-200"
      case "hungry":
        return "bg-yellow-200"
      case "eating":
        return "bg-green-200"
      default:
        return "bg-gray-200"
    }
  }

  const getPhilosopherBorderColor = (state: Philosopher["state"]) => {
    switch (state) {
      case "thinking":
        return "border-gray-400"
      case "hungry":
        return "border-yellow-400"
      case "eating":
        return "border-green-400"
      default:
        return "border-gray-400"
    }
  }

  const getChopstickColor = (state: Chopstick["state"]) => {
    return state === "available" ? "bg-[#3498db]" : "bg-red-400"
  }

  const tableSize = 300
  const centerX = tableSize / 2
  const centerY = tableSize / 2
  const tableRadius = tableSize * 0.3
  const philosopherRadius = tableSize * 0.08
  const chopstickWidth = tableSize * 0.04
  const chopstickHeight = tableSize * 0.15

  // Calculate positions in a circle
  const getPosition = (index: number, total: number, radius: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2 // Start from top
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    }
  }

  return (
    <div className="relative w-full aspect-square max-w-[300px] mx-auto">
      {/* Table */}
      <div
        className="absolute rounded-full bg-[#3498db] opacity-20"
        style={{
          width: tableRadius * 2,
          height: tableRadius * 2,
          left: centerX - tableRadius,
          top: centerY - tableRadius,
        }}
      />

      {/* Chopsticks */}
      {chopsticks.map((chopstick, index) => {
        const philosopherPos = getPosition(index, philosophers.length, tableRadius + philosopherRadius * 0.5)
        const nextPhilosopherPos = getPosition(
          (index + 1) % philosophers.length,
          philosophers.length,
          tableRadius + philosopherRadius * 0.5,
        )

        // Calculate the midpoint between two philosophers
        const midX = (philosopherPos.x + nextPhilosopherPos.x) / 2
        const midY = (philosopherPos.y + nextPhilosopherPos.y) / 2

        // Calculate the angle for the chopstick
        const angle = Math.atan2(nextPhilosopherPos.y - philosopherPos.y, nextPhilosopherPos.x - philosopherPos.x)

        return (
          <TooltipProvider key={`chopstick-${chopstick.id}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`absolute rounded-full ${getChopstickColor(chopstick.state)} transition-colors duration-300 ${isSimulating ? "cursor-not-allowed" : "cursor-pointer hover:opacity-80"}`}
                  style={{
                    width: chopstickWidth,
                    height: chopstickHeight,
                    left: midX,
                    top: midY,
                    transform: `translate(-50%, -50%) rotate(${angle}rad)`,
                  }}
                  onClick={() => !isSimulating && onChopstickClick(chopstick.id)}
                  onMouseEnter={() => setHoveredElement({ type: "chopstick", id: chopstick.id })}
                  onMouseLeave={() => setHoveredElement(null)}
                  disabled={isSimulating}
                  aria-label={`Chopstick ${chopstick.id + 1}, currently ${chopstick.state}`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p>Chopstick {chopstick.id + 1}</p>
                  <p>Status: {chopstick.state}</p>
                  {chopstick.heldBy !== null && <p>Held by: Philosopher {chopstick.heldBy + 1}</p>}
                  {!isSimulating && (
                    <p className="font-semibold mt-1">
                      Click to {chopstick.state === "available" ? "pick up" : "put down"}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}

      {/* Philosophers */}
      {philosophers.map((philosopher, index) => {
        const position = getPosition(index, philosophers.length, tableRadius + philosopherRadius * 0.5)

        return (
          <TooltipProvider key={`philosopher-${philosopher.id}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`absolute rounded-full border-2 ${getPhilosopherColor(philosopher.state)} ${getPhilosopherBorderColor(philosopher.state)} flex items-center justify-center transition-colors duration-300 ${isSimulating ? "cursor-not-allowed" : "cursor-pointer hover:opacity-80"}`}
                  style={{
                    width: philosopherRadius * 2,
                    height: philosopherRadius * 2,
                    left: position.x - philosopherRadius,
                    top: position.y - philosopherRadius,
                  }}
                  onClick={() => !isSimulating && onPhilosopherClick(philosopher.id)}
                  onMouseEnter={() => setHoveredElement({ type: "philosopher", id: philosopher.id })}
                  onMouseLeave={() => setHoveredElement(null)}
                  disabled={isSimulating}
                  aria-label={`Philosopher ${philosopher.id + 1}, currently ${philosopher.state}`}
                >
                  <span className="text-xs font-bold">{philosopher.id + 1}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p>{philosopher.name}</p>
                  <p>Status: {philosopher.state}</p>
                  <p>Times eaten: {philosopher.eatingCount}</p>
                  {philosopher.leftChopstick !== null && <p>Has left chopstick: {philosopher.leftChopstick + 1}</p>}
                  {philosopher.rightChopstick !== null && <p>Has right chopstick: {philosopher.rightChopstick + 1}</p>}
                  {!isSimulating && (
                    <p className="font-semibold mt-1">
                      {philosopher.state === "thinking" && "Click to make hungry"}
                      {philosopher.state === "hungry" && "Click to try eating"}
                      {philosopher.state === "eating" && "Click to finish eating"}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </div>
  )
}

