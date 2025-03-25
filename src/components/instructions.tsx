import { ChevronDown, Info } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Instructions() {
  return (
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger className="flex w-full items-center justify-between bg-white p-3 rounded-md border border-gray-200 hover:bg-gray-50">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold">Instructions</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 ml-1.5">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Instructions Info</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Step-by-step guide on how to use the Banker's Algorithm simulator</p>
                <p>Includes explanations of concepts and features</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <ChevronDown className="h-5 w-5 text-[#3498db]" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 mt-3 p-4 border rounded-md bg-white border-green-500">
        <p className="text-sm sm:text-base">
          This simulator demonstrates the Banker's Algorithm, a resource allocation and deadlock avoidance algorithm
          used in operating systems.
        </p>

        <h3 className="font-medium text-base sm:text-lg mt-3">What is Banker's Algorithm?</h3>
        <p className="text-sm sm:text-base">
          The Banker's Algorithm is a deadlock avoidance algorithm that tests for safety by simulating the allocation of
          maximum possible resources to all processes and checking if a safe sequence exists.
        </p>

        <h3 className="font-medium text-base sm:text-lg mt-3">How to use this simulator:</h3>
        <ol className="list-decimal pl-5 space-y-2 text-sm sm:text-base">
          <li>
            <strong>Setup Tab:</strong> Configure available resources and process requirements
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Set the available resources (R0, R1, R2)</li>
              <li>Configure maximum resource needs and current allocations for each process</li>
              <li>Click "Check System State" to verify if the system is in a safe state</li>
            </ul>
          </li>
          <li>
            <strong>Resource Allocation Tab:</strong> Visualize how resources are currently allocated
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>View available resources and their distribution</li>
              <li>See how resources are allocated to each process</li>
              <li>Monitor the "need" values (resources still required by each process)</li>
            </ul>
          </li>
          <li>
            <strong>Resource Request Tab:</strong> Request additional resources for processes
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Enter resource request values for any process</li>
              <li>Click "Request" to attempt resource allocation</li>
              <li>The system will only grant requests that maintain a safe state</li>
            </ul>
          </li>
          <li>
            <strong>Simulation Tab:</strong> Run an automatic simulation of process execution
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Click "Simulate" to start automatic execution following the safe sequence</li>
              <li>Use "Pause" to stop the simulation at any point</li>
              <li>Use "Reset" to restart the simulation</li>
              <li>Adjust the simulation speed using the slider</li>
            </ul>
          </li>
          <li>
            <strong>Action Log:</strong> Monitor system events and resource allocations at the bottom of the screen
          </li>
        </ol>

        <h3 className="font-medium text-base sm:text-lg mt-3">Step-by-step tutorial:</h3>
        <ol className="list-decimal pl-5 space-y-1 text-sm sm:text-base">
          <li>
            Start in the <strong>Setup</strong> tab with the default values
          </li>
          <li>Click "Check System State" to determine if the system is safe</li>
          <li>
            Go to the <strong>Resource Allocation</strong> tab to visualize the current state
          </li>
          <li>
            Try making a resource request in the <strong>Request</strong> tab (e.g., request 1 unit of R0 for P1)
          </li>
          <li>
            Finally, go to the <strong>Simulation</strong> tab and click "Simulate" to watch processes execute in a safe
            sequence
          </li>
        </ol>

        <h3 className="font-medium text-base sm:text-lg mt-3">Learning objectives:</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base">
          <li>Understand resource allocation and deadlock avoidance in operating systems</li>
          <li>Learn how the Banker's Algorithm determines system safety</li>
          <li>Visualize process execution sequences that avoid deadlock</li>
          <li>Experiment with resource requests to see when they're granted or denied</li>
          <li>Recognize unsafe states that could lead to deadlock</li>
        </ul>

        <div className="bg-blue-50 p-3 rounded-md mt-3 text-sm">
          <p className="font-medium text-blue-800">Tip:</p>
          <p className="text-blue-700">
            A system is in a <strong>safe state</strong> if there exists a sequence in which all processes can complete
            their execution. The Banker's Algorithm finds this safe sequence if it exists.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

