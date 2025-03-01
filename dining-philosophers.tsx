import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Table from 'src/components/Table'
import Legend from 'src/components/Legend'
import type { Philosopher, LogEntry } from './types'

export default function DiningPhilosophers() {
  const [philosophers, setPhilosophers] = useState<Philosopher[]>([])
  const [log, setLog] = useState<LogEntry[]>([])
  const [alert, setAlert] = useState<string | null>(null)

  useEffect(() => {
    const initialPhilosophers: Philosopher[] = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      state: 'thinking',
      leftFork: false,
      rightFork: false,
    }))
    setPhilosophers(initialPhilosophers)
  }, [])

  const addLogEntry = (philosopherId: number, action: string) => {
    setLog(prev => [...prev, { philosopherId, action, timestamp: Date.now() }])
  }

  const pickUpForks = (id: number) => {
    setPhilosophers(prev => {
      const newPhilosophers = [...prev]
      const philosopher = newPhilosophers[id]
      const leftNeighborId = (id - 1 + newPhilosophers.length) % newPhilosophers.length
      const rightNeighborId = (id + 1) % newPhilosophers.length

      if (philosopher.state === 'thinking') {
        philosopher.state = 'hungry'
        addLogEntry(id, 'became hungry')
      } else if (philosopher.state === 'hungry') {
        if (!newPhilosophers[leftNeighborId].rightFork && !newPhilosophers[rightNeighborId].leftFork) {
          philosopher.state = 'eating'
          philosopher.leftFork = true
          philosopher.rightFork = true
          addLogEntry(id, 'started eating')
        } else {
          setAlert(`Philosopher ${id} is still waiting for forks.`)
          setTimeout(() => setAlert(null), 3000)
        }
      } else if (philosopher.state === 'eating') {
        philosopher.state = 'thinking'
        philosopher.leftFork = false
        philosopher.rightFork = false
        addLogEntry(id, 'finished eating and started thinking')
      }

      return newPhilosophers
    })
  }

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-4">
        {alert && (
          <Alert variant="destructive">
            <AlertDescription>{alert}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Dining Philosophers Simulation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mt-8">
              <Table philosophers={philosophers} pickUpForks={pickUpForks} />
              <Legend />
            </div>
            <p className="mt-4 text-center text-gray-600">
              Click on a philosopher to change their state.
            </p>
          </CardContent>
        </Card>

        {/* Log */}
        <Card>
          <CardHeader>
            <CardTitle>Action Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="h-48 overflow-y-auto space-y-2 p-4 border rounded"
              role="log"
              aria-label="Action history"
            >
              {log.map((entry, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium">Philosopher {entry.philosopherId}</span>
                  {' '}{entry.action}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

