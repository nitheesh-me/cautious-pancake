import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function Instructions() {
  return (
    <Collapsible defaultOpen={false}>
      <div className="flex items-center">
        <CollapsibleTrigger className="flex items-center gap-0">
          <h2 className="text-lg font-semibold">Instructions</h2>
          <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-gray-500 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-info"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </span>
          <ChevronDown className="h-5 w-5 ml-1" />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2 mt-2">
        <p>
          This simulation demonstrates the Dining Philosophers Problem, a classic synchronization problem in computer
          science.
        </p>
        <h3 className="font-medium">How to use this simulation:</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Click on a philosopher to change their state manually (when not auto-simulating)</li>
          <li>Use the "Reset" button to restart the simulation</li>
          <li>Observe the action log to see what's happening</li>
          <li>Switch between tabs to learn about the theory, deadlock, and starvation</li>
        </ol>
        <h3 className="font-medium mt-2">Learning objectives:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Understand resource allocation in concurrent systems</li>
          <li>Identify deadlock conditions and how they occur</li>
          <li>Recognize starvation and fairness issues</li>
          <li>Learn strategies to prevent synchronization problems</li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

