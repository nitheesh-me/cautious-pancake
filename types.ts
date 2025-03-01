export type BufferState = "empty" | "full" | "locked"
export type ProcessStep =
  | "waiting_not_full"
  | "waiting_not_empty"
  | "locking"
  | "depositing"
  | "retrieving"
  | "unlocking"
  | "notify_not_empty" // New step
  | "notify_not_full" // New step
  | "idle"

export interface BufferItem {
  id: number
  state: BufferState
}

export interface LogEntry {
  timestamp: number
  action: string
  type: "info" | "error" | "success"
  step: ProcessStep
}

export interface ProcessState {
  currentStep: ProcessStep
  isActive: boolean
  canProceed: boolean
}

