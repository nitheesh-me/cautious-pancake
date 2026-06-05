"use client"

import { useEffect, useRef, useCallback } from "react"

// CHANGE THIS per lab:
// PLM:              "os-virtual-lab-state"
// Peterson's:       "os-virtual-lab-petersons-state"
// Bounded Buffer:   "os-virtual-lab-boundedbuffer-state"
// Dining Philosophers: "os-virtual-lab-dining-philosophers-state"
// Non-Preemptive:   "os-virtual-lab-nonpreemptive-state"
const STORAGE_KEY = "os-virtual-lab-petersons-state"
const STORAGE_VERSION = 1
const DEBOUNCE_MS = 500

export interface PersistedState {
  storageVersion: number
  currentTab: string
  shortcutsEnabled: boolean
  evaluationResults: any[]
  tutorialProgress: {
    currentStep: number
    completedSteps: number[]
  }
  guidedScenariosProgress: {
    completedScenarios: string[]
  }
  savedAt: string
}

export function loadPersistedState(): PersistedState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed.storageVersion !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed as PersistedState
  } catch {
    return null
  }
}

export function savePersistedState(state: PersistedState) {
  if (typeof window === "undefined") return
  try {
    state.savedAt = new Date().toISOString()
    state.storageVersion = STORAGE_VERSION
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export function clearPersistedState() {
  if (typeof window === "undefined") return
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}

export function useDebouncedSave(getState: () => PersistedState) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const save = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => { savePersistedState(getState()) }, DEBOUNCE_MS)
  }, [getState])
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])
  return save
}
