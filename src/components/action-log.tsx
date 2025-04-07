import { useEffect, useRef } from "react"

interface ActionLogProps {
  logs: string[]
}

export function ActionLog({ logs }: ActionLogProps) {
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div
      ref={logContainerRef}
      className="h-[400px] overflow-y-auto border rounded p-2 bg-gray-50 text-sm"
      aria-live="polite"
      aria-label="Action log"
    >
      {logs.map((log, index) => (
        <div key={index} className="py-1 border-b border-gray-200 last:border-0">
          {log}
        </div>
      ))}
    </div>
  )
}

