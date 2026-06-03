"use client"

import { useState, useEffect, useRef } from "react"
import {
  Info,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Cpu,
  Users,
  BarChart3,
  BookOpen,
  Target,
  CheckCircle,
  AlertCircle,
  X,
  ArrowRight,
  ArrowLeft,
  Activity,
  TrendingUp,
} from "lucide-react"

// Types
interface Process {
  id: number
  arrivalTime: number
  burstTime: number
  remainingTime: number
  priority?: number
  status: "ready" | "running" | "waiting" | "terminated" | "completed"
  startTime?: number
  completionTime?: number
  waitingTime?: number
  turnaroundTime?: number
  mapping?: { run_time: number; burst_time: number }
}

interface SystemState {
  currentTime: number
  readyQueue: Process[]
  runningProcess: Process | null
  waitingQueue: Process[]
  completedProcesses: Process[]
  terminatedProcesses: Process[]
  schedulingPolicy: "FCFS" | "SJF" | "SRTF" | "RR" | "Priority" | null
  timeQuantum?: number
  quantumRemaining?: number
  clickedState?: string | null
  idCounter: number
}

interface SystemStateSnapshot {
  id: number
  timestamp: number
  state: SystemState
  action: string
  description: string
}

interface ActionLog {
  id: number
  timestamp: number
  action: string
  description: string
  systemState: SystemState
}

interface GuidedStep {
  id: number
  title: string
  description: string
  expectedAction: string
  completed: boolean
  hint?: string
  instruction?: string
}

interface Scenario {
  id: string
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedTime: string
  objectives: string[]
  processes: Omit<Process, "id" | "status" | "remainingTime">[]
  schedulingPolicy: SystemState["schedulingPolicy"]
  timeQuantum?: number
  steps: GuidedStep[]
}

// Single guided tutorial for non-preemptive scheduling simulator
const NON_PREEMPTIVE_TUTORIAL_STEPS: GuidedStep[] = [
  {
    id: 1,
    title: "Understanding Non-Preemptive Scheduling",
    description: "Learn the basics of non-preemptive CPU scheduling algorithms.",
    expectedAction: "observe",
    completed: false,
    instruction:
      "In non-preemptive scheduling, once a process starts executing on the CPU, it runs to completion without interruption. The three main non-preemptive algorithms are FCFS, SJF, and Priority scheduling. Observe the simulation panel to familiarize yourself with the interface.",
    hint: "Non-preemptive scheduling is simpler but can lead to convoy effect where short processes wait behind long ones.",
  },
  {
    id: 2,
    title: "Exploring the Controls Panel",
    description: "Get familiar with the simulation controls on the left.",
    expectedAction: "observe",
    completed: false,
    instruction:
      "The Controls panel contains: Scheduling Policy selector, process creation inputs, Start/Pause and Tick buttons for simulation control, and action buttons like Schedule Next and Reset.",
    hint: "The Tick button advances time by one unit manually, while Start runs the simulation automatically.",
  },
  {
    id: 3,
    title: "Selecting a Scheduling Policy",
    description: "Choose FCFS (First Come First Serve) to begin.",
    expectedAction: "select_policy",
    completed: false,
    instruction:
      "In the Controls panel, find the 'Scheduling Policy' dropdown and select 'First Come First Serve'. FCFS is the simplest non-preemptive algorithm that schedules processes in arrival order.",
    hint: "After selecting the policy, you can create processes and start scheduling.",
  },
  {
    id: 4,
    title: "Creating Your First Process",
    description: "Add a process to the ready queue.",
    expectedAction: "create_process",
    completed: false,
    instruction:
      "Enter a burst time (e.g., 5) in the 'Burst Time' field and click 'Create Process'. The process will appear in the Ready Queue with the specified CPU time requirement.",
    hint: "Burst time represents how many time units the process needs to complete execution.",
  },
  {
    id: 5,
    title: "Creating Multiple Processes",
    description: "Add more processes to observe scheduling behavior.",
    expectedAction: "create_process",
    completed: false,
    instruction:
      "Create two more processes with different burst times (e.g., 3 and 7). Watch how they queue up in the Ready Queue waiting for CPU allocation.",
    hint: "In FCFS, processes will execute in the order they were created regardless of burst time.",
  },
  {
    id: 6,
    title: "Scheduling a Process",
    description: "Move the first process from Ready Queue to CPU.",
    expectedAction: "schedule",
    completed: false,
    instruction:
      "Click the 'Schedule Next' button to move the first process in the Ready Queue to the CPU. The process will start executing.",
    hint: "Only one process can run on the CPU at a time. The selected process depends on the scheduling algorithm.",
  },
  {
    id: 7,
    title: "Advancing Time",
    description: "Execute the process by advancing the simulation clock.",
    expectedAction: "tick_multiple",
    completed: false,
    instruction:
      "Click the 'Tick' button multiple times to advance time. Each tick increases the process's run time by 1. Continue until the process completes (run time equals burst time).",
    hint: "In non-preemptive scheduling, the running process cannot be interrupted until it finishes.",
  },
  {
    id: 8,
    title: "Understanding Metrics",
    description: "Review the performance metrics in the Metrics & Log panel.",
    expectedAction: "observe",
    completed: false,
    instruction:
      "Look at the Metrics & Log panel on the right. It shows CPU Utilization, Average Wait Time, Throughput, and a detailed Action Log of all events.",
    hint: "These metrics help evaluate the efficiency of different scheduling algorithms.",
  },
  {
    id: 9,
    title: "Tutorial Complete",
    description: "You have learned the basics of non-preemptive scheduling!",
    expectedAction: "complete",
    completed: false,
    instruction:
      "Congratulations! You now understand how to use the non-preemptive scheduling simulator. Try the Scenarios tab for guided challenges or Evaluation tab to test your knowledge.",
    hint: "Experiment with SJF and Priority scheduling to see how different algorithms affect waiting times.",
  },
]

// Tutorial Steps for Different Scheduling Policies
const FCFS_TUTORIAL_STEPS: GuidedStep[] = [
  {
    id: 1,
    title: "Welcome to FCFS Tutorial",
    description: "Learn First Come First Serve scheduling - the simplest scheduling algorithm.",
    expectedAction: "start",
    completed: false,
    instruction: "FCFS schedules processes in the order they arrive. Let's start by selecting the FCFS policy.",
  },
  {
    id: 2,
    title: "Select FCFS Policy",
    description: "Choose First Come First Serve from the scheduling policy dropdown.",
    expectedAction: "select_policy",
    completed: false,
    instruction:
      "In the Controls panel, find the 'Scheduling Policy' dropdown and select 'First Come First Serve (FCFS)'.",
    hint: "FCFS is non-preemptive - once a process starts, it runs until completion",
  },
  {
    id: 3,
    title: "Create First Process",
    description: "Create a process with burst time 6 to see FCFS in action.",
    expectedAction: "create_process",
    completed: false,
    instruction: "Enter '6' as the burst time and click 'Create Process'.",
    hint: "This process will be P1 and will arrive at time 0",
  },
  {
    id: 4,
    title: "Create Second Process",
    description: "Add another process to demonstrate the FCFS queue behavior.",
    expectedAction: "create_process",
    completed: false,
    instruction: "Create another process with burst time '4'.",
    hint: "This will be P2 and will arrive after P1",
  },
  {
    id: 5,
    title: "Schedule First Process",
    description: "Schedule P1 to run on the CPU using FCFS.",
    expectedAction: "schedule",
    completed: false,
    instruction: "Click 'Schedule Next' to move P1 from ready queue to CPU.",
    hint: "In FCFS, the first process in the queue is always selected",
  },
  {
    id: 6,
    title: "Execute Process",
    description: "Run the process by advancing the clock multiple times.",
    expectedAction: "tick_multiple",
    completed: false,
    instruction: "Click 'Tick' several times to execute P1. Watch how the run time increases.",
    hint: "Keep clicking until P1 completes (6 ticks total)",
  },
  {
    id: 7,
    title: "Observe FCFS Behavior",
    description: "Notice how P2 waits until P1 completely finishes.",
    expectedAction: "observe",
    completed: false,
    instruction: "P1 has completed. Now P2 can be scheduled. Click 'Schedule Next' for P2.",
    hint: "This demonstrates the non-preemptive nature of FCFS",
  },
  {
    id: 8,
    title: "Complete FCFS Tutorial",
    description: "You've learned the basics of FCFS scheduling!",
    expectedAction: "complete",
    completed: false,
    instruction: "FCFS is simple but can cause convoy effect with long processes. Try other algorithms to compare!",
  },
]

const SJF_TUTORIAL_STEPS: GuidedStep[] = [
  {
    id: 1,
    title: "Welcome to SJF Tutorial",
    description: "Learn Shortest Job First - optimal for minimizing average waiting time.",
    expectedAction: "start",
    completed: false,
    instruction: "SJF selects the process with the shortest burst time. Let's explore this algorithm.",
  },
  {
    id: 2,
    title: "Select SJF Policy",
    description: "Choose Shortest Job First from the scheduling policy dropdown.",
    expectedAction: "select_policy",
    completed: false,
    instruction: "Select 'Shortest Job First' from the scheduling policy dropdown.",
    hint: "SJF is non-preemptive and optimal for average waiting time",
  },
  {
    id: 3,
    title: "Create Processes with Different Burst Times",
    description: "Create processes with varying burst times to see SJF selection.",
    expectedAction: "create_multiple",
    completed: false,
    instruction: "Create three processes: burst times 8, 3, and 5. Notice how SJF will prioritize them.",
    hint: "SJF will schedule them in order: 3, 5, 8 regardless of arrival order",
  },
  {
    id: 4,
    title: "Schedule Shortest Job",
    description: "Watch SJF select the process with burst time 3.",
    expectedAction: "schedule",
    completed: false,
    instruction: "Click 'Schedule Next' and observe that P2 (burst time 3) is selected first.",
    hint: "SJF always picks the shortest job available in the ready queue",
  },
  {
    id: 5,
    title: "Complete and Schedule Next",
    description: "Complete the shortest job and see the next selection.",
    expectedAction: "complete_and_schedule",
    completed: false,
    instruction: "Execute P2 completely, then schedule the next shortest job (burst time 5).",
    hint: "After P2, P3 (burst time 5) will be selected before P1 (burst time 8)",
  },
  {
    id: 6,
    title: "SJF Tutorial Complete",
    description: "You've mastered SJF scheduling!",
    expectedAction: "complete",
    completed: false,
    instruction: "SJF minimizes average waiting time but can cause starvation of long processes.",
  },
]

const SRTF_TUTORIAL_STEPS: GuidedStep[] = [
  {
    id: 1,
    title: "Welcome to SRTF Tutorial",
    description: "Learn Shortest Remaining Time First - the preemptive version of SJF.",
    expectedAction: "start",
    completed: false,
    instruction: "SRTF can preempt running processes when shorter jobs arrive. Let's see this in action.",
  },
  {
    id: 2,
    title: "Select SRTF Policy",
    description: "Choose Shortest Remaining Time First from the dropdown.",
    expectedAction: "select_policy",
    completed: false,
    instruction: "Select 'Shortest Remaining Time First' from the scheduling policy dropdown.",
    hint: "SRTF is preemptive - it can interrupt running processes",
  },
  {
    id: 3,
    title: "Create Long Process",
    description: "Start with a long process to demonstrate preemption.",
    expectedAction: "create_process",
    completed: false,
    instruction: "Create a process with burst time 10 and schedule it.",
    hint: "This long process will be preempted when shorter processes arrive",
  },
  {
    id: 4,
    title: "Execute Partially",
    description: "Let the long process run for a few time units.",
    expectedAction: "tick_multiple",
    completed: false,
    instruction: "Click 'Tick' 3 times to partially execute the long process.",
    hint: "The process now has 7 time units remaining",
  },
  {
    id: 5,
    title: "Add Shorter Process",
    description: "Create a shorter process to trigger preemption.",
    expectedAction: "create_process",
    completed: false,
    instruction: "Create a new process with burst time 4.",
    hint: "This shorter process will preempt the running process",
  },
  {
    id: 6,
    title: "Observe Preemption",
    description: "Watch SRTF automatically preempt the longer process.",
    expectedAction: "tick",
    completed: false,
    instruction: "Click 'Tick' and observe how the shorter process preempts the longer one.",
    hint: "The long process moves back to ready queue, shorter process starts running",
  },
  {
    id: 7,
    title: "SRTF Tutorial Complete",
    description: "You've learned preemptive scheduling with SRTF!",
    expectedAction: "complete",
    completed: false,
    instruction: "SRTF provides optimal average waiting time but has higher context switching overhead.",
  },
]

const RR_TUTORIAL_STEPS: GuidedStep[] = [
  {
    id: 1,
    title: "Welcome to Round Robin Tutorial",
    description: "Learn Round Robin - fair time-sharing scheduling with time quantum.",
    expectedAction: "start",
    completed: false,
    instruction: "Round Robin gives each process a fixed time slice. Let's explore this fair scheduling algorithm.",
  },
  {
    id: 2,
    title: "Select Round Robin Policy",
    description: "Choose Round Robin from the scheduling policy dropdown.",
    expectedAction: "select_policy",
    completed: false,
    instruction: "Select 'Round Robin' from the scheduling policy dropdown.",
    hint: "Round Robin requires a time quantum to be set",
  },
  {
    id: 3,
    title: "Set Time Quantum",
    description: "Configure the time quantum for Round Robin scheduling.",
    expectedAction: "set_quantum",
    completed: false,
    instruction: "Set the time quantum to 3 in the Time Quantum field.",
    hint: "Time quantum determines how long each process can run before being preempted",
  },
  {
    id: 4,
    title: "Create Multiple Processes",
    description: "Create several processes to see Round Robin rotation.",
    expectedAction: "create_multiple",
    completed: false,
    instruction: "Create three processes with burst times 7, 5, and 8.",
    hint: "All processes will get equal time slices of 3 units each",
  },
  {
    id: 5,
    title: "Schedule First Process",
    description: "Start the Round Robin scheduling cycle.",
    expectedAction: "schedule",
    completed: false,
    instruction: "Click 'Schedule Next' to start P1 with its time quantum of 3.",
    hint: "P1 will run for 3 time units then be preempted",
  },
  {
    id: 6,
    title: "Execute Time Quantum",
    description: "Run the process for its full time quantum.",
    expectedAction: "tick_quantum",
    completed: false,
    instruction: "Click 'Tick' 3 times to use up P1's time quantum.",
    hint: "Watch the quantum remaining counter decrease",
  },
  {
    id: 7,
    title: "Observe Round Robin Rotation",
    description: "See how processes rotate in Round Robin fashion.",
    expectedAction: "observe_rotation",
    completed: false,
    instruction: "Continue scheduling and executing to see all processes rotate fairly.",
    hint: "Each process gets equal CPU time in rotation",
  },
  {
    id: 8,
    title: "Round Robin Tutorial Complete",
    description: "You've mastered fair scheduling with Round Robin!",
    expectedAction: "complete",
    completed: false,
    instruction: "Round Robin ensures fairness but may have higher turnaround time for short processes.",
  },
]

const PRIORITY_TUTORIAL_STEPS: GuidedStep[] = [
  {
    id: 1,
    title: "Welcome to Priority Scheduling Tutorial",
    description: "Learn Priority Scheduling - processes are scheduled based on priority values.",
    expectedAction: "start",
    completed: false,
    instruction: "Priority scheduling selects processes based on priority (lower number = higher priority).",
  },
  {
    id: 2,
    title: "Select Priority Policy",
    description: "Choose Priority Scheduling from the dropdown.",
    expectedAction: "select_policy",
    completed: false,
    instruction: "Select 'Priority Scheduling' from the scheduling policy dropdown.",
    hint: "Priority scheduling requires priority values for each process",
  },
  {
    id: 3,
    title: "Create High Priority Process",
    description: "Create a process with high priority (low number).",
    expectedAction: "create_process",
    completed: false,
    instruction: "Create a process with burst time 6 and priority 1 (highest priority).",
    hint: "Lower priority numbers mean higher priority",
  },
  {
    id: 4,
    title: "Create Medium Priority Process",
    description: "Add a process with medium priority.",
    expectedAction: "create_process",
    completed: false,
    instruction: "Create a process with burst time 4 and priority 3 (medium priority).",
    hint: "This process will be scheduled after the high priority process",
  },
  {
    id: 5,
    title: "Create Low Priority Process",
    description: "Add a process with low priority.",
    expectedAction: "create_process",
    completed: false,
    instruction: "Create a process with burst time 3 and priority 5 (low priority).",
    hint: "This process will be scheduled last despite having shortest burst time",
  },
  {
    id: 6,
    title: "Schedule by Priority",
    description: "Watch priority scheduling select the highest priority process.",
    expectedAction: "schedule",
    completed: false,
    instruction: "Click 'Schedule Next' and observe that P1 (priority 1) is selected first.",
    hint: "Priority scheduling ignores burst time and focuses on priority values",
  },
  {
    id: 7,
    title: "Complete Priority Scheduling",
    description: "Execute processes in priority order.",
    expectedAction: "complete_priority",
    completed: false,
    instruction: "Complete all processes and observe the priority-based execution order.",
    hint: "Order will be: P1 (priority 1), P2 (priority 3), P3 (priority 5)",
  },
  {
    id: 8,
    title: "Priority Tutorial Complete",
    description: "You've learned priority-based scheduling!",
    expectedAction: "complete",
    completed: false,
    instruction: "Priority scheduling can cause starvation of low-priority processes.",
  },
]

// Shared scenarios used by both Guided and Unguided (Evaluation) tabs.
// 2 beginner, 2 intermediate, and 2 advanced non-preemptive scheduling scenarios.
const GUIDED_SCENARIOS: Scenario[] = [
  // ---------- BEGINNER ----------
  {
    id: "fcfs-basic",
    title: "First Come First Serve (FCFS) Basics",
    description: "Learn the fundamentals of FCFS scheduling with simple process management",
    difficulty: "beginner",
    estimatedTime: "~10m",
    objectives: [
      "Understand FCFS scheduling principles",
      "Learn to create and manage processes",
      "Practice basic process state transitions",
      "Calculate average waiting time",
    ],
    processes: [
      { arrivalTime: 0, burstTime: 5 },
      { arrivalTime: 2, burstTime: 3 },
      { arrivalTime: 4, burstTime: 8 },
    ],
    schedulingPolicy: "FCFS",
    steps: [
      {
        id: 1,
        title: "Select FCFS Policy",
        description: "Choose First Come First Serve from the scheduling policy dropdown",
        expectedAction: "select_policy",
        completed: false,
        hint: "Look for the dropdown in the Controls section",
      },
      {
        id: 2,
        title: "Create First Process",
        description: "Create a process with burst time 5",
        expectedAction: "create_process",
        completed: false,
        hint: 'Use the "Create Process" button and enter burst time 5',
      },
      {
        id: 3,
        title: "Schedule and Run",
        description: "Schedule the first process and advance the clock until it completes",
        expectedAction: "schedule",
        completed: false,
        hint: "Use Schedule Next, then click Advance Clock repeatedly",
      },
    ],
  },
  {
    id: "sjf-basic",
    title: "Shortest Job First (SJF) Basics",
    description: "Discover how SJF reduces average waiting time by running the shortest job first",
    difficulty: "beginner",
    estimatedTime: "~10m",
    objectives: [
      "Understand non-preemptive SJF selection",
      "Compare ordering against FCFS",
      "Observe the effect on waiting time",
      "Identify the convoy effect",
    ],
    processes: [
      { arrivalTime: 0, burstTime: 6 },
      { arrivalTime: 0, burstTime: 2 },
      { arrivalTime: 0, burstTime: 4 },
    ],
    schedulingPolicy: "SJF",
    steps: [
      {
        id: 1,
        title: "Select SJF Policy",
        description: "Choose Shortest Job First from the scheduling policy dropdown",
        expectedAction: "select_policy",
        completed: false,
        hint: "Look for the dropdown in the Controls section",
      },
      {
        id: 2,
        title: "Create the Processes",
        description: "Create three processes with burst times 6, 2 and 4",
        expectedAction: "create_process",
        completed: false,
        hint: "SJF will pick the burst-2 process first",
      },
    ],
  },
  // ---------- INTERMEDIATE ----------
  {
    id: "priority-basic",
    title: "Priority-Based Scheduling",
    description: "Master non-preemptive priority scheduling with processes of different priorities",
    difficulty: "intermediate",
    estimatedTime: "~15m",
    objectives: [
      "Understand priority scheduling concepts",
      "Manage multiple processes with different priorities",
      "Observe selection by highest priority",
      "Optimize system performance",
    ],
    processes: [
      { arrivalTime: 0, burstTime: 4, priority: 2 },
      { arrivalTime: 1, burstTime: 6, priority: 1 },
      { arrivalTime: 3, burstTime: 3, priority: 3 },
    ],
    schedulingPolicy: "Priority",
    steps: [
      {
        id: 1,
        title: "Select Priority Policy",
        description: "Choose Priority scheduling from the dropdown",
        expectedAction: "select_policy",
        completed: false,
      },
      {
        id: 2,
        title: "Create Prioritized Processes",
        description: "Create the three processes with their assigned priorities",
        expectedAction: "create_process",
        completed: false,
        hint: "Lower priority number means higher priority",
      },
    ],
  },
  {
    id: "sjf-staggered",
    title: "SJF with Staggered Arrivals",
    description: "Apply SJF when processes arrive at different times and the ready queue changes",
    difficulty: "intermediate",
    estimatedTime: "~15m",
    objectives: [
      "Handle staggered arrival times",
      "Re-evaluate the shortest job at each scheduling point",
      "Track waiting and turnaround time",
      "Reason about non-preemptive decisions",
    ],
    processes: [
      { arrivalTime: 0, burstTime: 7 },
      { arrivalTime: 2, burstTime: 4 },
      { arrivalTime: 4, burstTime: 1 },
      { arrivalTime: 5, burstTime: 4 },
    ],
    schedulingPolicy: "SJF",
    steps: [
      {
        id: 1,
        title: "Select SJF Policy",
        description: "Choose Shortest Job First from the dropdown",
        expectedAction: "select_policy",
        completed: false,
      },
      {
        id: 2,
        title: "Create the Arrival Set",
        description: "Create all four processes with their arrival and burst times",
        expectedAction: "create_process",
        completed: false,
        hint: "The first job runs to completion before SJF re-evaluates",
      },
    ],
  },
  // ---------- ADVANCED ----------
  {
    id: "priority-starvation",
    title: "Priority Scheduling & Starvation",
    description: "Explore how low-priority processes can starve under priority scheduling",
    difficulty: "advanced",
    estimatedTime: "~20m",
    objectives: [
      "Recreate a starvation scenario",
      "Measure the waiting time of low-priority jobs",
      "Reason about aging as a mitigation",
      "Compare fairness across policies",
    ],
    processes: [
      { arrivalTime: 0, burstTime: 8, priority: 3 },
      { arrivalTime: 1, burstTime: 4, priority: 1 },
      { arrivalTime: 2, burstTime: 4, priority: 1 },
      { arrivalTime: 3, burstTime: 2, priority: 2 },
    ],
    schedulingPolicy: "Priority",
    steps: [
      {
        id: 1,
        title: "Select Priority Policy",
        description: "Choose Priority scheduling from the dropdown",
        expectedAction: "select_policy",
        completed: false,
      },
      {
        id: 2,
        title: "Create the Workload",
        description: "Create all four processes and observe which one starves",
        expectedAction: "create_process",
        completed: false,
        hint: "Watch the burst-8, priority-3 process keep waiting",
      },
    ],
  },
  {
    id: "fcfs-convoy",
    title: "FCFS Convoy Effect",
    description: "Demonstrate the convoy effect when a long job blocks several short jobs in FCFS",
    difficulty: "advanced",
    estimatedTime: "~20m",
    objectives: [
      "Reproduce the convoy effect under FCFS",
      "Quantify the impact on average waiting time",
      "Contrast the outcome with SJF",
      "Recommend a better policy",
    ],
    processes: [
      { arrivalTime: 0, burstTime: 12 },
      { arrivalTime: 1, burstTime: 2 },
      { arrivalTime: 2, burstTime: 2 },
      { arrivalTime: 3, burstTime: 2 },
    ],
    schedulingPolicy: "FCFS",
    steps: [
      {
        id: 1,
        title: "Select FCFS Policy",
        description: "Choose First Come First Serve from the dropdown",
        expectedAction: "select_policy",
        completed: false,
      },
      {
        id: 2,
        title: "Create the Workload",
        description: "Create the long job first, then the three short jobs",
        expectedAction: "create_process",
        completed: false,
        hint: "The short jobs are stuck behind the burst-12 job",
      },
    ],
  },
]

export function OperatingSystemsVirtualLab() {
  // Main navigation state
  const [activeTab, setActiveTab] = useState<"simulation" | "manual" | "guided" | "evaluation">("simulation")
  const [activeSubTab, setActiveSubTab] = useState<"scenarios" | "results" | "analytics">("scenarios")
  const [activeSimulationTab, setActiveSimulationTab] = useState<"main" | "states">("main")
  const [activeStatesTab, setActiveStatesTab] = useState<"current" | "history" | "graphs">("current")

  // Single Tutorial state for non-preemptive scheduling
  const [tutorialStep, setTutorialStep] = useState(0)
  const [tutorialStepsCompleted, setTutorialStepsCompleted] = useState<boolean[]>(
    new Array(NON_PREEMPTIVE_TUTORIAL_STEPS.length).fill(false)
  )

  // Manual Guide Tutorial state
  const [manualGuideStep, setManualGuideStep] = useState(0)
  const [manualGuideActive, setManualGuideActive] = useState(false)
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null)
  const [currentTutorialSteps, setCurrentTutorialSteps] = useState<GuidedStep[]>([])
  const [manualStepsCompleted, setManualStepsCompleted] = useState<boolean[]>([])

  // System state with original logic structure
  const [systemState, setSystemState] = useState<SystemState>({
    currentTime: 0,
    readyQueue: [],
    runningProcess: null,
    waitingQueue: [],
    completedProcesses: [],
    terminatedProcesses: [],
    schedulingPolicy: null,
    clickedState: null,
    idCounter: 1,
  })

  // System states history
  const [systemStatesHistory, setSystemStatesHistory] = useState<SystemStateSnapshot[]>([])

  // UI state
  const [isRunning, setIsRunning] = useState(false)
  const [actionLog, setActionLog] = useState<ActionLog[]>([])
  const [newProcessBurst, setNewProcessBurst] = useState("")
  const [newProcessPriority, setNewProcessPriority] = useState("")
  const [timeQuantum, setTimeQuantum] = useState("")
  const [selectedProcess, setSelectedProcess] = useState<number | null>(null)

  // Alert state
  const [alert, setAlert] = useState<{
    show: boolean
    type: "error" | "success" | "warning"
    title: string
    message: string
  }>({
    show: false,
    type: "error",
    title: "",
    message: "",
  })

  // Guided mode state
  const [guidedMode, setGuidedMode] = useState(false)
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [scenarioCompleted, setScenarioCompleted] = useState(false)

  // Evaluation state
  const [evaluationMode, setEvaluationMode] = useState(false)
  const [evaluationScore, setEvaluationScore] = useState<{
    total: number
    breakdown: { category: string; score: number; maxScore: number }[]
  } | null>(null)

  // Refs for auto-scroll
  const logRef = useRef<HTMLDivElement>(null)

  // Auto-scroll effect
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [actionLog])

  // Save system state snapshot
  const saveSystemStateSnapshot = (action: string, description: string) => {
    const snapshot: SystemStateSnapshot = {
      id: Date.now(),
      timestamp: systemState.currentTime,
      state: JSON.parse(JSON.stringify(systemState)),
      action,
      description,
    }
    setSystemStatesHistory((prev) => [...prev, snapshot])
  }

  // Show alert function
  const showAlert = (type: "error" | "success" | "warning", title: string, message: string) => {
    setAlert({ show: true, type, title, message })
    setTimeout(() => {
      setAlert((prev) => ({ ...prev, show: false }))
    }, 5000)
  }

  // Log action function
  const logAction = (action: string, description: string) => {
    const newLog: ActionLog = {
      id: Date.now(),
      timestamp: systemState.currentTime,
      action,
      description,
      systemState: { ...systemState },
    }
    setActionLog((prev) => [...prev, newLog])
    saveSystemStateSnapshot(action, description)
  }

  // Create process function with original logic
  const createProcess = () => {
    if (!newProcessBurst || isNaN(Number(newProcessBurst)) || Number(newProcessBurst) <= 0) {
      showAlert("error", "Invalid Input", "Please enter a valid burst time (positive number)")
      return
    }

    if (Number(newProcessBurst) > 30) {
      showAlert("error", "Invalid Input", "Please enter a burst time between 1 and 30")
      return
    }

    if (systemState.schedulingPolicy === "Priority" && (!newProcessPriority || isNaN(Number(newProcessPriority)))) {
      showAlert("error", "Invalid Input", "Priority scheduling requires a priority value")
      return
    }

    const newProcess: Process = {
      id: systemState.idCounter,
      arrivalTime: systemState.currentTime,
      burstTime: Number(newProcessBurst),
      remainingTime: Number(newProcessBurst),
      priority: systemState.schedulingPolicy === "Priority" ? Number(newProcessPriority) : undefined,
      status: "ready",
      mapping: { run_time: 0, burst_time: Number(newProcessBurst) },
    }

    setSystemState((prev) => ({
      ...prev,
      readyQueue: [...prev.readyQueue, newProcess],
      idCounter: prev.idCounter + 1,
    }))

    setNewProcessBurst("")
    setNewProcessPriority("")

    logAction(
      "CREATE_PROCESS",
      `Created process P${newProcess.id} with burst time ${newProcess.burstTime}${newProcess.priority ? ` and priority ${newProcess.priority}` : ""}`,
    )

    // Check manual guide step completion
    if (manualGuideActive && currentTutorialSteps.length > 0) {
      const currentStepData = currentTutorialSteps[manualGuideStep]
      if (currentStepData.expectedAction === "create_process" || currentStepData.expectedAction === "create_multiple") {
        completeManualStep()
      }
    }

    // Check guided mode step completion
    if (guidedMode && currentScenario && currentStep < currentScenario.steps.length) {
      const step = currentScenario.steps[currentStep]
      if (step.expectedAction === "create_process") {
        completeCurrentStep()
      }
    }
  }

  // Schedule next process with original FCFS logic
  const scheduleNext = () => {
    if (systemState.runningProcess) {
      showAlert("error", "CPU Busy", "A process is already running on the CPU")
      return
    }

    if (systemState.readyQueue.length === 0) {
      showAlert("error", "No Processes", "No processes available in the ready queue")
      return
    }

    let nextProcess: Process
    const newReadyQueue = [...systemState.readyQueue]

    switch (systemState.schedulingPolicy) {
      case "FCFS":
        // Original FCFS logic - first in queue
        nextProcess = newReadyQueue.shift()!
        break
      case "SJF":
        // Shortest Job First
        const shortestIndex = newReadyQueue.reduce(
          (minIdx, process, idx) => (process.burstTime < newReadyQueue[minIdx].burstTime ? idx : minIdx),
          0,
        )
        nextProcess = newReadyQueue.splice(shortestIndex, 1)[0]
        break
      case "SRTF":
        // Shortest Remaining Time First
        const shortestRemainingIndex = newReadyQueue.reduce(
          (minIdx, process, idx) => (process.remainingTime < newReadyQueue[minIdx].remainingTime ? idx : minIdx),
          0,
        )
        nextProcess = newReadyQueue.splice(shortestRemainingIndex, 1)[0]
        break
      case "Priority":
        // Priority scheduling (lower number = higher priority)
        const highestPriorityIndex = newReadyQueue.reduce(
          (maxIdx, process, idx) => ((process.priority || 0) < (newReadyQueue[maxIdx].priority || 0) ? idx : maxIdx),
          0,
        )
        nextProcess = newReadyQueue.splice(highestPriorityIndex, 1)[0]
        break
      case "RR":
        // Round Robin - first in queue
        nextProcess = newReadyQueue.shift()!
        break
      default:
        showAlert("error", "No Policy", "Please select a scheduling policy first")
        return
    }

    nextProcess.status = "running"
    if (!nextProcess.startTime) {
      nextProcess.startTime = systemState.currentTime
    }

    setSystemState((prev) => ({
      ...prev,
      readyQueue: newReadyQueue,
      runningProcess: nextProcess,
      quantumRemaining: prev.schedulingPolicy === "RR" ? prev.timeQuantum : undefined,
    }))

    logAction("SCHEDULE", `Scheduled process P${nextProcess.id} to run on CPU using ${systemState.schedulingPolicy}`)

    // Check manual guide step completion
    if (manualGuideActive && currentTutorialSteps.length > 0) {
      const currentStepData = currentTutorialSteps[manualGuideStep]
      if (currentStepData.expectedAction === "schedule") {
        completeManualStep()
      }
    }
  }

  // Advance clock with original logic
  const advanceClock = () => {
    if (!systemState.runningProcess) {
      showAlert("error", "No Running Process", "No process is currently running")
      return
    }

    const runningProcess = { ...systemState.runningProcess }
    if (runningProcess.mapping) {
      runningProcess.mapping.run_time += 1
    }
    runningProcess.remainingTime -= 1

    const newState = {
      ...systemState,
      currentTime: systemState.currentTime + 1,
      runningProcess,
      quantumRemaining: systemState.quantumRemaining ? systemState.quantumRemaining - 1 : undefined,
    }

    // Check if process completed
    if (runningProcess.remainingTime <= 0) {
      runningProcess.status = "completed"
      runningProcess.completionTime = newState.currentTime
      runningProcess.turnaroundTime = runningProcess.completionTime - runningProcess.arrivalTime
      runningProcess.waitingTime = runningProcess.turnaroundTime - runningProcess.burstTime

      newState.completedProcesses = [...newState.completedProcesses, runningProcess]
      newState.runningProcess = null
      newState.quantumRemaining = undefined

      logAction("COMPLETE", `Process P${runningProcess.id} completed execution`)
    }
    // Check for Round Robin time quantum expiry
    else if (newState.quantumRemaining === 0) {
      runningProcess.status = "ready"
      newState.readyQueue = [...newState.readyQueue, runningProcess]
      newState.runningProcess = null
      newState.quantumRemaining = undefined

      logAction("PREEMPT", `Process P${runningProcess.id} preempted due to time quantum expiry`)
    }

    setSystemState(newState)

    // Check manual guide step completion
    if (manualGuideActive && currentTutorialSteps.length > 0) {
      const currentStepData = currentTutorialSteps[manualGuideStep]
      if (
        currentStepData.expectedAction === "tick" ||
        currentStepData.expectedAction === "tick_multiple" ||
        currentStepData.expectedAction === "tick_quantum"
      ) {
        completeManualStep()
      }
    }
  }

  // Manual Guide Functions
  const startManualGuide = (tutorialType: string) => {
    let steps: GuidedStep[] = []
    switch (tutorialType) {
      case "FCFS":
        steps = FCFS_TUTORIAL_STEPS
        break
      case "SJF":
        steps = SJF_TUTORIAL_STEPS
        break
      case "SRTF":
        steps = SRTF_TUTORIAL_STEPS
        break
      case "RR":
        steps = RR_TUTORIAL_STEPS
        break
      case "Priority":
        steps = PRIORITY_TUTORIAL_STEPS
        break
      default:
        steps = FCFS_TUTORIAL_STEPS
    }

    setSelectedTutorial(tutorialType)
    setCurrentTutorialSteps(steps)
    setManualGuideActive(true)
    setManualGuideStep(0)
    setManualStepsCompleted(new Array(steps.length).fill(false))
    // Reset simulation for tutorial
    resetSimulation()
  }

  const completeManualStep = () => {
    const newCompleted = [...manualStepsCompleted]
    newCompleted[manualGuideStep] = true
    setManualStepsCompleted(newCompleted)

    if (manualGuideStep < currentTutorialSteps.length - 1) {
      setTimeout(() => {
        setManualGuideStep(manualGuideStep + 1)
      }, 1000)
    } else {
      showAlert("success", "Tutorial Complete!", `You've completed the ${selectedTutorial} tutorial!`)
    }
  }

  const nextManualStep = () => {
    if (manualGuideStep < currentTutorialSteps.length - 1) {
      setManualGuideStep(manualGuideStep + 1)
    }
  }

  const prevManualStep = () => {
    if (manualGuideStep > 0) {
      setManualGuideStep(manualGuideStep - 1)
    }
  }

  // Complete current guided step
  const completeCurrentStep = () => {
    if (!currentScenario || currentStep >= currentScenario.steps.length) return

    const updatedSteps = [...currentScenario.steps]
    updatedSteps[currentStep].completed = true

    const updatedScenario = { ...currentScenario, steps: updatedSteps }
    setCurrentScenario(updatedScenario)

    if (currentStep < currentScenario.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setScenarioCompleted(true)
      showAlert("success", "Scenario Complete!", "Great job! You've completed this guided scenario.")
    }
  }

  // Start guided scenario
  const startGuidedScenario = (scenario: Scenario) => {
    setCurrentScenario(scenario)
    setCurrentStep(0)
    setGuidedMode(true)
    setScenarioCompleted(false)
    setActiveTab("simulation")

    // Reset system state
    resetSimulation()
  }

  // Reset simulation
  const resetSimulation = () => {
    setSystemState({
      currentTime: 0,
      readyQueue: [],
      runningProcess: null,
      waitingQueue: [],
      completedProcesses: [],
      terminatedProcesses: [],
      schedulingPolicy: null,
      clickedState: null,
      idCounter: 1,
    })
    setActionLog([])
    setSystemStatesHistory([])
    setIsRunning(false)
    setSelectedProcess(null)
    setNewProcessBurst("")
    setNewProcessPriority("")
    setTimeQuantum("")

    logAction("RESET", "System reset to initial state")
  }

  // Generate CPU utilization data for graphs
  const generateCPUUtilizationData = () => {
    return systemStatesHistory.map((snapshot, index) => ({
      time: snapshot.timestamp,
      cpuUtilization: snapshot.state.runningProcess ? 100 : 0,
      processCount: snapshot.state.readyQueue.length + (snapshot.state.runningProcess ? 1 : 0),
      completedCount: snapshot.state.completedProcesses.length,
    }))
  }

  // Generate process timeline data
  const generateProcessTimelineData = () => {
    const processData: { [key: number]: { start: number; end: number; status: string }[] } = {}

    systemStatesHistory.forEach((snapshot) => {
      if (snapshot.state.runningProcess) {
        const pid = snapshot.state.runningProcess.id
        if (!processData[pid]) {
          processData[pid] = []
        }

        const lastEntry = processData[pid][processData[pid].length - 1]
        if (!lastEntry || lastEntry.status !== "running" || lastEntry.end !== snapshot.timestamp - 1) {
          processData[pid].push({
            start: snapshot.timestamp,
            end: snapshot.timestamp,
            status: "running",
          })
        } else {
          lastEntry.end = snapshot.timestamp
        }
      }
    })

    return processData
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Non-Preemptive Scheduling</h1>
        </div>
      </header>

      {/* Main Navigation - Styled exactly like the template */}
      <nav className="bg-muted text-muted-foreground rounded-lg p-[3px] mb-4 sm:mb-6">
        <div className="grid w-full grid-cols-4 gap-0">
          {[
            {
              id: "simulation",
              label: "Simulation",
              shortLabel: "Sim",
              tooltip: "Interactive CPU scheduling simulation environment",
            },
            {
              id: "manual",
              label: "Tutorial",
              shortLabel: "Manual",
              tooltip: "Step-by-step tutorials for each scheduling algorithm",
            },
            {
              id: "guided",
              label: "Scenarios",
              shortLabel: "Guided",
              tooltip: "Structured learning scenarios with objectives",
            },
            {
              id: "evaluation",
              label: "Evaluation",
              shortLabel: "Eval",
              tooltip: "Assessment scenarios and performance analytics",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex h-auto flex-1 items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 text-xs sm:text-sm px-1 sm:px-3 py-2 break-words transition-colors ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm border border-blue-200"
                  : "text-foreground dark:text-muted-foreground border border-transparent"
              }`}
              title={tab.tooltip}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Alert */}
      {alert.show && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div
            className={`rounded-lg p-4 shadow-lg border ${
              alert.type === "error"
                ? "bg-red-50 border-red-200"
                : alert.type === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {alert.type === "error" && <AlertCircle className="text-red-600 mt-0.5" size={20} />}
              {alert.type === "success" && <CheckCircle className="text-green-600 mt-0.5" size={20} />}
              {alert.type === "warning" && <AlertCircle className="text-yellow-600 mt-0.5" size={20} />}
              <div className="flex-1">
                <h4
                  className={`font-semibold ${
                    alert.type === "error"
                      ? "text-red-900"
                      : alert.type === "success"
                        ? "text-green-900"
                        : "text-yellow-900"
                  }`}
                >
                  {alert.title}
                </h4>
                <p
                  className={`text-sm mt-1 ${
                    alert.type === "error"
                      ? "text-red-700"
                      : alert.type === "success"
                        ? "text-green-700"
                        : "text-yellow-700"
                  }`}
                >
                  {alert.message}
                </p>
              </div>
              <button
                onClick={() => setAlert((prev) => ({ ...prev, show: false }))}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="bg-white">
        {activeTab === "simulation" && (
          <div className="max-w-7xl mx-auto p-6">
            {/* Sub-navigation for Simulation */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
              <div className="flex justify-center border-b border-gray-200">
                {[
                  {
                    id: "main",
                    label: "Main Simulation",
                    tooltip: "Interactive process scheduling simulation with controls and visualization",
                  },
                  {
                    id: "states",
                    label: "System States",
                    tooltip: "View current and historical system states with graphs",
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSimulationTab(tab.id as any)}
                    className={`px-8 py-4 font-medium transition-colors ${
                      activeSimulationTab === tab.id
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    title={tab.tooltip}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeSimulationTab === "main" && (
              <div className="grid grid-cols-12 gap-6">
                {/* Controls Panel */}
                <div className="col-span-12 lg:col-span-3">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="text-blue-600" size={20} />
                      <h2 className="text-lg font-semibold text-gray-900">Controls</h2>
                      <Info
                        className="text-gray-400 cursor-help"
                        size={16}
                        title="Use these controls to manage the simulation - create processes, set policies, and control execution"
                      />
                    </div>

                    {/* Guided Mode Indicator */}
                    {guidedMode && currentScenario && (
                      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="text-green-600" size={16} />
                          <span className="font-medium text-green-900">Guided Mode</span>
                        </div>
                        <p className="text-sm text-green-700 mb-3">{currentScenario.title}</p>

                        {!scenarioCompleted && currentStep < currentScenario.steps.length && (
                          <div className="bg-white p-3 rounded border">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Step {currentStep + 1}/{currentScenario.steps.length}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">
                              {currentScenario.steps[currentStep].title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {currentScenario.steps[currentStep].description}
                            </p>
                            {currentScenario.steps[currentStep].hint && (
                              <p className="text-xs text-blue-600 italic">
                                💡 {currentScenario.steps[currentStep].hint}
                              </p>
                            )}
                          </div>
                        )}

                        {scenarioCompleted && (
                          <div className="bg-white p-3 rounded border border-green-300">
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle size={16} />
                              <span className="font-medium">Scenario Completed!</span>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => setGuidedMode(false)}
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Continue Free Mode
                              </button>
                              <button
                                onClick={() => setActiveTab("evaluation")}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Go to Evaluation
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Scheduling Policy */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scheduling Policy
                        <Info
                          className="inline ml-1 text-gray-400 cursor-help"
                          size={12}
                          title="Select the algorithm used to determine which process runs next on the CPU"
                        />
                      </label>
                      <select
                        value={systemState.schedulingPolicy || ""}
                        onChange={(e) => {
                          const policy = e.target.value as SystemState["schedulingPolicy"]
                          setSystemState((prev) => ({ ...prev, schedulingPolicy: policy }))
                          logAction("SET_POLICY", `Changed scheduling policy to ${policy}`)

                          // Check manual guide step completion
                          if (manualGuideActive && currentTutorialSteps.length > 0) {
                            const currentStepData = currentTutorialSteps[manualGuideStep]
                            if (currentStepData.expectedAction === "select_policy") {
                              completeManualStep()
                            }
                          }

                          // Check guided mode step completion
                          if (guidedMode && currentScenario && currentStep < currentScenario.steps.length) {
                            const step = currentScenario.steps[currentStep]
                            if (step.expectedAction === "select_policy") {
                              completeCurrentStep()
                            }
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Policy...</option>
                        <option value="FCFS">First Come First Serve</option>
                        <option value="SJF">Shortest Job First</option>
                        <option value="SRTF">Shortest Remaining Time First</option>
                        <option value="RR">Round Robin</option>
                        <option value="Priority">Priority Scheduling</option>
                      </select>
                    </div>

                    {/* Time Quantum for Round Robin */}
                    {systemState.schedulingPolicy === "RR" && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time Quantum
                          <Info
                            className="inline ml-1 text-gray-400 cursor-help"
                            size={12}
                            title="Maximum time slice each process can run before being preempted in Round Robin scheduling"
                          />
                        </label>
                        <input
                          type="number"
                          value={timeQuantum}
                          onChange={(e) => setTimeQuantum(e.target.value)}
                          onBlur={() => {
                            if (timeQuantum && !isNaN(Number(timeQuantum))) {
                              setSystemState((prev) => ({ ...prev, timeQuantum: Number(timeQuantum) }))

                              // Check manual guide step completion
                              if (manualGuideActive && currentTutorialSteps.length > 0) {
                                const currentStepData = currentTutorialSteps[manualGuideStep]
                                if (currentStepData.expectedAction === "set_quantum") {
                                  completeManualStep()
                                }
                              }
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter time quantum"
                          min="1"
                        />
                      </div>
                    )}

                    {/* Create Process */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Create Process
                        <Info
                          className="inline ml-1 text-gray-400 cursor-help"
                          size={12}
                          title="Add new processes to the system with specified burst time and priority (if applicable)"
                        />
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Burst Time</label>
                          <input
                            type="number"
                            value={newProcessBurst}
                            onChange={(e) => setNewProcessBurst(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter burst time (1-30)"
                            min="1"
                            max="30"
                            title="CPU time required by the process (1-30 time units)"
                          />
                        </div>

                        {systemState.schedulingPolicy === "Priority" && (
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Priority</label>
                            <input
                              type="number"
                              value={newProcessPriority}
                              onChange={(e) => setNewProcessPriority(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter priority"
                              min="1"
                              title="Process priority (lower number = higher priority)"
                            />
                          </div>
                        )}

                        <button
                          onClick={createProcess}
                          disabled={!systemState.schedulingPolicy}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          title="Create a new process with the specified parameters"
                        >
                          Create Process
                        </button>
                      </div>
                    </div>

                    {/* Simulation Controls */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Simulation
                        <Info
                          className="inline ml-1 text-gray-400 cursor-help"
                          size={12}
                          title="Control the simulation execution - start automatic mode or advance manually"
                        />
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setIsRunning(!isRunning)}
                          disabled={!systemState.schedulingPolicy}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          title={isRunning ? "Pause automatic simulation" : "Start automatic simulation"}
                        >
                          {isRunning ? <Pause size={16} /> : <Play size={16} />}
                          {isRunning ? "Pause" : "Start"}
                        </button>

                        <button
                          onClick={advanceClock}
                          disabled={!systemState.runningProcess}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          title="Advance simulation by one time unit"
                        >
                          <Clock size={16} />
                          Tick
                        </button>
                      </div>
                    </div>

                    {/* Process Actions */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Process Actions
                        <Info
                          className="inline ml-1 text-gray-400 cursor-help"
                          size={12}
                          title="Actions to manage process states - schedule, interrupt, or terminate processes"
                        />
                      </h3>
                      <div className="space-y-2">
                        <button
                          onClick={scheduleNext}
                          disabled={systemState.readyQueue.length === 0 || !!systemState.runningProcess}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          title="Schedule the next process from ready queue to CPU"
                        >
                          Schedule Next
                        </button>

                        <button
                          onClick={() => {
                            if (systemState.runningProcess) {
                              const process = { ...systemState.runningProcess }
                              process.status = "waiting"
                              setSystemState((prev) => ({
                                ...prev,
                                runningProcess: null,
                                waitingQueue: [...prev.waitingQueue, process],
                              }))
                              logAction("IO_INTERRUPT", `Process P${process.id} moved to I/O queue`)

                              // Check manual guide step completion
                              if (manualGuideActive && currentTutorialSteps.length > 0) {
                                const currentStepData = currentTutorialSteps[manualGuideStep]
                                if (currentStepData.expectedAction === "interrupt") {
                                  completeManualStep()
                                }
                              }
                            }
                          }}
                          disabled={!systemState.runningProcess}
                          className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          title="Move running process to I/O queue for input/output operations"
                        >
                          I/O Interrupt
                        </button>

                        <button
                          onClick={() => {
                            if (systemState.runningProcess) {
                              const process = { ...systemState.runningProcess }
                              process.status = "terminated"
                              setSystemState((prev) => ({
                                ...prev,
                                runningProcess: null,
                                terminatedProcesses: [...prev.terminatedProcesses, process],
                              }))
                              logAction("TERMINATE", `Process P${process.id} terminated`)
                            }
                          }}
                          disabled={!systemState.runningProcess}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          title="Terminate the currently running process"
                        >
                          Terminate
                        </button>
                      </div>
                    </div>

                    {/* Reset */}
                    <button
                      onClick={resetSimulation}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      title="Reset simulation to initial state"
                    >
                      <RotateCcw size={16} />
                      Reset
                    </button>
                  </div>
                </div>

                {/* Main Simulation Area */}
                <div className="col-span-12 lg:col-span-6">
                  <div className="bg-white rounded-lg border-2 border-green-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Cpu className="text-blue-600" size={20} />
                      <h2 className="text-lg font-semibold text-gray-900">Process Scheduling Simulation</h2>
                      <Info
                        className="text-gray-400 cursor-help"
                        size={16}
                        title="Real-time visualization of process scheduling - shows CPU, queues, and process states"
                      />
                    </div>

                    {/* System Status */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-600 font-medium">Current Time</div>
                        <div className="text-2xl font-bold text-blue-900">{systemState.currentTime}</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-sm text-green-600 font-medium">Policy</div>
                        <div className="text-lg font-bold text-green-900">{systemState.schedulingPolicy || "None"}</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="text-sm text-purple-600 font-medium">Completed</div>
                        <div className="text-2xl font-bold text-purple-900">
                          {systemState.completedProcesses.length}
                        </div>
                      </div>
                    </div>

                    {/* Process Queues */}
                    <div className="space-y-6">
                      {/* CPU */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Cpu className="text-green-600" size={16} />
                          <h3 className="font-medium text-gray-900">CPU</h3>
                          <Info
                            className="text-gray-400 cursor-help"
                            size={14}
                            title="Shows the process currently executing on the CPU with its progress"
                          />
                        </div>
                        <div className="min-h-[80px] p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                          {systemState.runningProcess ? (
                            <div className="bg-green-600 text-white p-3 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">P{systemState.runningProcess.id}</span>
                                <span className="text-sm">
                                  {systemState.runningProcess.mapping?.run_time || 0}/
                                  {systemState.runningProcess.burstTime}
                                </span>
                              </div>
                              {systemState.schedulingPolicy === "RR" && systemState.quantumRemaining && (
                                <div className="text-xs mt-1 opacity-90">Quantum: {systemState.quantumRemaining}</div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 py-6">CPU Idle</div>
                          )}
                        </div>
                      </div>

                      {/* Ready Queue */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="text-blue-600" size={16} />
                          <h3 className="font-medium text-gray-900">Ready Queue</h3>
                          <span className="text-sm text-gray-500">({systemState.readyQueue.length})</span>
                          <Info
                            className="text-gray-400 cursor-help"
                            size={14}
                            title="Processes waiting to be scheduled for CPU execution"
                          />
                        </div>
                        <div className="min-h-[80px] p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                          {systemState.readyQueue.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {systemState.readyQueue.map((process) => (
                                <div
                                  key={process.id}
                                  onClick={() => setSelectedProcess(process.id)}
                                  className={`bg-blue-600 text-white p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors ${
                                    selectedProcess === process.id ? "ring-2 ring-blue-300" : ""
                                  }`}
                                  title={`Process ${process.id} - Burst: ${process.burstTime}${process.priority ? `, Priority: ${process.priority}` : ""}`}
                                >
                                  <div className="font-medium">P{process.id}</div>
                                  <div className="text-xs">
                                    Burst: {process.burstTime}
                                    {process.priority && ` | Priority: ${process.priority}`}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 py-6">No processes in ready queue</div>
                          )}
                        </div>
                      </div>

                      {/* I/O Queue */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="text-yellow-600" size={16} />
                          <h3 className="font-medium text-gray-900">I/O Queue</h3>
                          <span className="text-sm text-gray-500">({systemState.waitingQueue.length})</span>
                          <Info
                            className="text-gray-400 cursor-help"
                            size={14}
                            title="Processes waiting for I/O operations to complete - click to complete I/O"
                          />
                        </div>
                        <div className="min-h-[80px] p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                          {systemState.waitingQueue.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {systemState.waitingQueue.map((process) => (
                                <div
                                  key={process.id}
                                  onClick={() => {
                                    // Move back to ready queue
                                    const updatedProcess = { ...process, status: "ready" as const }
                                    setSystemState((prev) => ({
                                      ...prev,
                                      waitingQueue: prev.waitingQueue.filter((p) => p.id !== process.id),
                                      readyQueue: [...prev.readyQueue, updatedProcess],
                                    }))
                                    logAction(
                                      "IO_COMPLETE",
                                      `Process P${process.id} I/O completed, moved to ready queue`,
                                    )

                                    // Check manual guide step completion
                                    if (manualGuideActive && currentTutorialSteps.length > 0) {
                                      const currentStepData = currentTutorialSteps[manualGuideStep]
                                      if (currentStepData.expectedAction === "io_complete") {
                                        completeManualStep()
                                      }
                                    }
                                  }}
                                  className="bg-yellow-600 text-white p-3 rounded-lg cursor-pointer hover:bg-yellow-700 transition-colors"
                                  title={`Process ${process.id} - Click to complete I/O operation`}
                                >
                                  <div className="font-medium">P{process.id}</div>
                                  <div className="text-xs">Click to complete I/O</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 py-6">No processes waiting for I/O</div>
                          )}
                        </div>
                      </div>

                      {/* Completed Processes */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="text-green-600" size={16} />
                          <h3 className="font-medium text-gray-900">Completed</h3>
                          <span className="text-sm text-gray-500">({systemState.completedProcesses.length})</span>
                          <Info
                            className="text-gray-400 cursor-help"
                            size={14}
                            title="Processes that have finished execution with their performance metrics"
                          />
                        </div>
                        <div className="min-h-[60px] p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                          {systemState.completedProcesses.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {systemState.completedProcesses.map((process) => (
                                <div
                                  key={process.id}
                                  className="bg-gray-600 text-white p-2 rounded text-sm"
                                  title={`Process ${process.id} - Waiting Time: ${process.waitingTime}, Turnaround Time: ${process.turnaroundTime}`}
                                >
                                  P{process.id} (WT: {process.waitingTime}, TAT: {process.turnaroundTime})
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 py-4">No completed processes</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics & Log Panel */}
                <div className="col-span-12 lg:col-span-3">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="text-blue-600" size={20} />
                      <h2 className="text-lg font-semibold text-gray-900">Metrics & Log</h2>
                      <Info
                        className="text-gray-400 cursor-help"
                        size={16}
                        title="Performance metrics and detailed action history for analysis"
                      />
                    </div>

                    {/* Performance Metrics */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Performance Metrics
                        <Info
                          className="inline ml-1 text-gray-400 cursor-help"
                          size={12}
                          title="Key performance indicators for evaluating scheduling algorithm efficiency"
                        />
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm text-blue-700">CPU Utilization</span>
                          <span className="font-medium text-blue-900">
                            {systemState.currentTime > 0
                              ? Math.round(
                                  ((systemState.currentTime - (systemState.runningProcess ? 0 : 1)) /
                                    systemState.currentTime) *
                                    100,
                                )
                              : 0}
                            %
                          </span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="text-sm text-green-700">Avg Wait Time</span>
                          <span className="font-medium text-green-900">
                            {systemState.completedProcesses.length > 0
                              ? (
                                  systemState.completedProcesses.reduce((sum, p) => sum + (p.waitingTime || 0), 0) /
                                  systemState.completedProcesses.length
                                ).toFixed(1)
                              : "0.0"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                          <span className="text-sm text-purple-700">Throughput</span>
                          <span className="font-medium text-purple-900">
                            {systemState.currentTime > 0
                              ? (systemState.completedProcesses.length / systemState.currentTime).toFixed(2)
                              : "0.00"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Log */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Action Log
                        <Info
                          className="inline ml-1 text-gray-400 cursor-help"
                          size={12}
                          title="Chronological record of all simulation actions and events"
                        />
                      </h3>
                      <div
                        ref={logRef}
                        className="h-64 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-3"
                      >
                        {actionLog.length > 0 ? (
                          <div className="space-y-2">
                            {actionLog.map((log) => (
                              <div key={log.id} className="text-xs">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-900">{log.action}</span>
                                  <span className="text-gray-500">T{log.timestamp}</span>
                                </div>
                                <div className="text-gray-600 mt-1">{log.description}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-8">No actions logged yet</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSimulationTab === "states" && (
              <div>
                {/* Sub-navigation for System States */}
                <div className="bg-white rounded-lg border border-gray-200 mb-6">
                  <div className="flex justify-center border-b border-gray-200">
                    {[
                      {
                        id: "current",
                        label: "Current State",
                        tooltip: "View the current system state and process information",
                      },
                      {
                        id: "history",
                        label: "State History",
                        tooltip: "Browse through previous system states and transitions",
                      },
                      {
                        id: "graphs",
                        label: "Visualization",
                        tooltip: "Graphical representation of system performance and process timeline",
                      },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveStatesTab(tab.id as any)}
                        className={`px-8 py-4 font-medium transition-colors ${
                          activeStatesTab === tab.id
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                        title={tab.tooltip}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeStatesTab === "current" && (
                  <div className="bg-white rounded-lg border border-gray-200 p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <Activity className="text-blue-600" size={24} />
                      <h2 className="text-2xl font-bold text-gray-900">Current System State</h2>
                      <Info
                        className="text-gray-400 cursor-help"
                        size={20}
                        title="Real-time view of the current system state including all process queues and CPU status"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* System Overview */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-blue-900">Current Time</span>
                              <span className="text-2xl font-bold text-blue-900">{systemState.currentTime}</span>
                            </div>
                          </div>

                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-green-900">Scheduling Policy</span>
                              <span className="text-lg font-bold text-green-900">
                                {systemState.schedulingPolicy || "None"}
                              </span>
                            </div>
                          </div>

                          {systemState.schedulingPolicy === "RR" && systemState.timeQuantum && (
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-orange-900">Time Quantum</span>
                                <span className="text-lg font-bold text-orange-900">{systemState.timeQuantum}</span>
                              </div>
                              {systemState.quantumRemaining && (
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-sm text-orange-700">Remaining</span>
                                  <span className="text-sm font-medium text-orange-900">
                                    {systemState.quantumRemaining}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Process Queues State */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Queues</h3>
                        <div className="space-y-4">
                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Cpu className="text-green-600" size={16} />
                              <span className="font-medium text-gray-900">CPU</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {systemState.runningProcess ? (
                                <div className="bg-green-100 p-2 rounded">
                                  P{systemState.runningProcess.id} - {systemState.runningProcess.mapping?.run_time || 0}
                                  /{systemState.runningProcess.burstTime}
                                  {systemState.runningProcess.priority &&
                                    ` (Priority: ${systemState.runningProcess.priority})`}
                                </div>
                              ) : (
                                <div className="text-gray-500 italic">CPU Idle</div>
                              )}
                            </div>
                          </div>

                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="text-blue-600" size={16} />
                              <span className="font-medium text-gray-900">
                                Ready Queue ({systemState.readyQueue.length})
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {systemState.readyQueue.length > 0 ? (
                                <div className="space-y-1">
                                  {systemState.readyQueue.map((process) => (
                                    <div key={process.id} className="bg-blue-100 p-2 rounded">
                                      P{process.id} - Burst: {process.burstTime}, Remaining: {process.remainingTime}
                                      {process.priority && `, Priority: ${process.priority}`}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-500 italic">No processes in ready queue</div>
                              )}
                            </div>
                          </div>

                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="text-yellow-600" size={16} />
                              <span className="font-medium text-gray-900">
                                I/O Queue ({systemState.waitingQueue.length})
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {systemState.waitingQueue.length > 0 ? (
                                <div className="space-y-1">
                                  {systemState.waitingQueue.map((process) => (
                                    <div key={process.id} className="bg-yellow-100 p-2 rounded">
                                      P{process.id} - Remaining: {process.remainingTime}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-500 italic">No processes waiting for I/O</div>
                              )}
                            </div>
                          </div>

                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="text-green-600" size={16} />
                              <span className="font-medium text-gray-900">
                                Completed ({systemState.completedProcesses.length})
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {systemState.completedProcesses.length > 0 ? (
                                <div className="space-y-1">
                                  {systemState.completedProcesses.map((process) => (
                                    <div key={process.id} className="bg-gray-100 p-2 rounded">
                                      P{process.id} - WT: {process.waitingTime}, TAT: {process.turnaroundTime}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-500 italic">No completed processes</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mathematical Representation */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Mathematical State Representation</h3>
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 font-mono text-sm">
                        <div className="space-y-2">
                          <div>
                            <strong>
                              X<sub>s</sub> = &#123;
                            </strong>
                          </div>
                          <div className="ml-4">
                            <strong>ReadyQueue:</strong> [{systemState.readyQueue.map((p) => p.id).join(", ")}]
                          </div>
                          <div className="ml-4">
                            <strong>CPU:</strong> {systemState.runningProcess ? systemState.runningProcess.id : "null"}
                          </div>
                          <div className="ml-4">
                            <strong>ProcessMap:</strong> &#123;
                            {systemState.readyQueue
                              .concat(systemState.runningProcess ? [systemState.runningProcess] : [])
                              .map((p) => ` ${p.id}→${p.mapping?.run_time || 0}:${p.burstTime}`)
                              .join(", ")}{" "}
                            &#125;
                          </div>
                          <div className="ml-4">
                            <strong>Timer:</strong>{" "}
                            {systemState.schedulingPolicy === "RR"
                              ? systemState.quantumRemaining || systemState.timeQuantum || "null"
                              : "null"}
                          </div>
                          <div className="ml-4">
                            <strong>Policy:</strong> {systemState.schedulingPolicy || "null"}
                          </div>
                          <div>
                            <strong>&#125;</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStatesTab === "history" && (
                  <div className="bg-white rounded-lg border border-gray-200 p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <Clock className="text-blue-600" size={24} />
                      <h2 className="text-2xl font-bold text-gray-900">System State History</h2>
                      <Info
                        className="text-gray-400 cursor-help"
                        size={20}
                        title="Chronological history of all system state transitions and changes"
                      />
                    </div>

                    {systemStatesHistory.length > 0 ? (
                      <div className="space-y-4">
                        {systemStatesHistory
                          .slice()
                          .reverse()
                          .map((snapshot, index) => (
                            <div key={snapshot.id} className="border border-gray-200 rounded-lg p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                    {systemStatesHistory.length - index}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-900">{snapshot.action}</h3>
                                    <p className="text-sm text-gray-600">Time: {snapshot.timestamp}</p>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(snapshot.id).toLocaleTimeString()}
                                </div>
                              </div>

                              <p className="text-gray-700 mb-4">{snapshot.description}</p>

                              <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                  <div className="text-sm font-medium text-blue-900 mb-1">Ready Queue</div>
                                  <div className="text-sm text-blue-800">
                                    [{snapshot.state.readyQueue.map((p) => `P${p.id}`).join(", ")}]
                                  </div>
                                </div>

                                <div className="bg-green-50 p-3 rounded border border-green-200">
                                  <div className="text-sm font-medium text-green-900 mb-1">CPU</div>
                                  <div className="text-sm text-green-800">
                                    {snapshot.state.runningProcess ? `P${snapshot.state.runningProcess.id}` : "Idle"}
                                  </div>
                                </div>

                                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                  <div className="text-sm font-medium text-yellow-900 mb-1">I/O Queue</div>
                                  <div className="text-sm text-yellow-800">
                                    [{snapshot.state.waitingQueue.map((p) => `P${p.id}`).join(", ")}]
                                  </div>
                                </div>
                              </div>

                              {snapshot.state.schedulingPolicy === "RR" && snapshot.state.quantumRemaining && (
                                <div className="mt-3 bg-orange-50 p-3 rounded border border-orange-200">
                                  <div className="text-sm font-medium text-orange-900">
                                    Quantum Remaining: {snapshot.state.quantumRemaining}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                        <div className="text-gray-500 mb-4">No state history available</div>
                        <p className="text-sm text-gray-400">Start the simulation to see state transitions</p>
                      </div>
                    )}
                  </div>
                )}

                {activeStatesTab === "graphs" && (
                  <div className="bg-white rounded-lg border border-gray-200 p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="text-blue-600" size={24} />
                      <h2 className="text-2xl font-bold text-gray-900">System Performance Visualization</h2>
                      <Info
                        className="text-gray-400 cursor-help"
                        size={20}
                        title="Graphical representation of CPU utilization, process timeline, and system performance metrics"
                      />
                    </div>

                    {systemStatesHistory.length > 0 ? (
                      <div className="space-y-8">
                        {/* CPU Utilization Chart */}
                        <div className="border border-gray-200 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">CPU Utilization Over Time</h3>
                          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                            <div className="text-center">
                              <BarChart3 className="mx-auto text-gray-400 mb-2" size={32} />
                              <div className="text-gray-600">CPU Utilization Chart</div>
                              <div className="text-sm text-gray-500 mt-1">
                                {generateCPUUtilizationData().length} data points collected
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Process Timeline */}
                        <div className="border border-gray-200 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Execution Timeline</h3>
                          <div className="space-y-3">
                            {Object.entries(generateProcessTimelineData()).map(([pid, timeline]) => (
                              <div key={pid} className="flex items-center gap-4">
                                <div className="w-12 text-sm font-medium text-gray-700">P{pid}</div>
                                <div className="flex-1 h-8 bg-gray-100 rounded relative">
                                  {timeline.map((segment, index) => (
                                    <div
                                      key={index}
                                      className={`absolute h-full rounded ${
                                        segment.status === "running" ? "bg-green-500" : "bg-gray-300"
                                      }`}
                                      style={{
                                        left: `${(segment.start / Math.max(systemState.currentTime, 1)) * 100}%`,
                                        width: `${((segment.end - segment.start + 1) / Math.max(systemState.currentTime, 1)) * 100}%`,
                                      }}
                                      title={`${segment.status} from ${segment.start} to ${segment.end}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-green-500 rounded"></div>
                              <span>Running</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-gray-300 rounded"></div>
                              <span>Waiting/Ready</span>
                            </div>
                          </div>
                        </div>

                        {/* Performance Metrics Summary */}
                        <div className="border border-gray-200 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics Summary</h3>
                          <div className="grid md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                              <div className="text-sm text-blue-600 font-medium">Total States</div>
                              <div className="text-2xl font-bold text-blue-900">{systemStatesHistory.length}</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                              <div className="text-sm text-green-600 font-medium">Context Switches</div>
                              <div className="text-2xl font-bold text-green-900">
                                {
                                  systemStatesHistory.filter((s) => s.action === "SCHEDULE" || s.action === "PREEMPT")
                                    .length
                                }
                              </div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                              <div className="text-sm text-purple-600 font-medium">Processes Created</div>
                              <div className="text-2xl font-bold text-purple-900">
                                {systemStatesHistory.filter((s) => s.action === "CREATE_PROCESS").length}
                              </div>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                              <div className="text-sm text-orange-600 font-medium">I/O Operations</div>
                              <div className="text-2xl font-bold text-orange-900">
                                {
                                  systemStatesHistory.filter(
                                    (s) => s.action === "IO_INTERRUPT" || s.action === "IO_COMPLETE",
                                  ).length
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <TrendingUp className="mx-auto text-gray-400 mb-4" size={48} />
                        <div className="text-gray-500 mb-4">No performance data available</div>
                        <p className="text-sm text-gray-400">Run the simulation to generate performance graphs</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "manual" && (
          <div className="max-w-7xl mx-auto p-6">
            {/* Tutorial Header Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Guided Tutorial - Non-Preemptive Scheduling</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {tutorialStepsCompleted.filter(Boolean).length}/{NON_PREEMPTIVE_TUTORIAL_STEPS.length} Complete
                  </span>
                  <button
                    onClick={() => {
                      setTutorialStep(0)
                      setTutorialStepsCompleted(new Array(NON_PREEMPTIVE_TUTORIAL_STEPS.length).fill(false))
                      resetSimulation()
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset Tutorial
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(tutorialStepsCompleted.filter(Boolean).length / NON_PREEMPTIVE_TUTORIAL_STEPS.length) * 100}%` }}
                />
              </div>

              {/* Step Circles */}
              <div className="flex items-center gap-2 mb-2">
                {NON_PREEMPTIVE_TUTORIAL_STEPS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setTutorialStep(index)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      tutorialStepsCompleted[index]
                        ? "bg-blue-600 text-white"
                        : index === tutorialStep
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {tutorialStepsCompleted[index] ? "✓" : index + 1}
                  </button>
                ))}
              </div>

              <p className="text-sm text-gray-500">
                Progress: {Math.round((tutorialStepsCompleted.filter(Boolean).length / NON_PREEMPTIVE_TUTORIAL_STEPS.length) * 100)}% | Step {tutorialStep + 1} of {NON_PREEMPTIVE_TUTORIAL_STEPS.length}
              </p>
            </div>

            {/* 4-Column Layout */}
            <div className="grid grid-cols-12 gap-4">
              {/* Step Description Card */}
              <div className="col-span-12 lg:col-span-3">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                      <BookOpen className="text-gray-600" size={14} />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Step {tutorialStep + 1}: {NON_PREEMPTIVE_TUTORIAL_STEPS[tutorialStep].title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{NON_PREEMPTIVE_TUTORIAL_STEPS[tutorialStep].description}</p>

                  {/* Objective Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Target className="text-blue-600" size={12} />
                      <span className="text-xs font-semibold text-blue-900">Objective:</span>
                    </div>
                    <p className="text-xs text-blue-800">{NON_PREEMPTIVE_TUTORIAL_STEPS[tutorialStep].description}</p>
                  </div>

                  {/* Instructions Box */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Info className="text-green-600" size={12} />
                      <span className="text-xs font-semibold text-green-900">Instructions:</span>
                    </div>
                    <p className="text-xs text-green-800">{NON_PREEMPTIVE_TUTORIAL_STEPS[tutorialStep].instruction}</p>
                  </div>

                  {/* Hint Box */}
                  {NON_PREEMPTIVE_TUTORIAL_STEPS[tutorialStep].hint && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-1 mb-1">
                        <AlertCircle className="text-yellow-600" size={12} />
                        <span className="text-xs font-semibold text-yellow-900">Hint:</span>
                      </div>
                      <p className="text-xs text-yellow-800">{NON_PREEMPTIVE_TUTORIAL_STEPS[tutorialStep].hint}</p>
                    </div>
                  )}

                  {/* Mark Complete Button */}
                  <button
                    onClick={() => {
                      const newCompleted = [...tutorialStepsCompleted]
                      newCompleted[tutorialStep] = true
                      setTutorialStepsCompleted(newCompleted)
                      if (tutorialStep < NON_PREEMPTIVE_TUTORIAL_STEPS.length - 1) {
                        setTutorialStep(tutorialStep + 1)
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-3"
                  >
                    <CheckCircle size={16} />
                    Mark Complete
                  </button>

                  {/* Navigation */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
                      disabled={tutorialStep === 0}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <ArrowLeft size={14} />
                      Previous
                    </button>
                    <button
                      onClick={() => setTutorialStep(Math.min(NON_PREEMPTIVE_TUTORIAL_STEPS.length - 1, tutorialStep + 1))}
                      disabled={tutorialStep === NON_PREEMPTIVE_TUTORIAL_STEPS.length - 1}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Next
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Controls Panel */}
              <div className="col-span-12 lg:col-span-2">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="text-blue-600" size={16} />
                    <h3 className="font-semibold text-gray-900 text-sm">Controls</h3>
                    <Info className="text-gray-400 cursor-help" size={12} />
                  </div>

                  {/* Simulation Controls */}
                  <div className="space-y-2 mb-4">
                    <button
                      onClick={() => setIsRunning(!isRunning)}
                      disabled={!systemState.schedulingPolicy}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      {isRunning ? <Pause size={14} /> : <Play size={14} />}
                      {isRunning ? "Pause" : "Start"}
                    </button>

                    <button
                      onClick={resetSimulation}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm border border-gray-300"
                    >
                      <RotateCcw size={14} />
                      Reset
                    </button>

                    <button
                      onClick={advanceClock}
                      disabled={!systemState.runningProcess}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors text-sm border border-gray-300"
                    >
                      <Clock size={14} />
                      Advance Clock
                    </button>
                  </div>

                  {/* Create Process */}
                  <div className="mb-4">
                    <input
                      type="number"
                      value={newProcessBurst}
                      onChange={(e) => setNewProcessBurst(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg mb-2"
                      placeholder="Burst time"
                      min="1"
                    />
                    <button
                      onClick={createProcess}
                      disabled={!systemState.schedulingPolicy}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Create Process
                    </button>
                  </div>

                  {/* Current Time */}
                  <div className="mb-4">
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                      <Clock size={12} />
                      Current Time:
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{systemState.currentTime}</div>
                  </div>

                  {/* Legend */}
                  <div className="mb-4">
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-2">
                      Legend
                      <Info className="text-gray-400 cursor-help" size={10} />
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                        <span className="text-gray-600">Not Created</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-gray-600">Ready (waiting for CPU)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-gray-600">CPU (executing)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-gray-600">I/O (waiting for I/O)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-600" />
                        <span className="text-gray-600">Terminated</span>
                      </div>
                    </div>
                  </div>

                  {/* Valid Transitions */}
                  <div>
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-2">
                      <ArrowRight size={12} />
                      Valid Transitions
                    </div>
                    <div className="space-y-0.5 text-xs text-blue-600">
                      <div>Ready → CPU (CPU allocation)</div>
                      <div>CPU → I/O (I/O request)</div>
                      <div>I/O → Ready (I/O completion)</div>
                      <div>CPU → Terminated (process completes)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Process Scheduling Simulation Panel */}
              <div className="col-span-12 lg:col-span-4">
                <div className="bg-white rounded-lg border-2 border-green-200 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Cpu className="text-gray-700" size={16} />
                    <h3 className="font-semibold text-gray-900 text-sm">Non-Preemptive Scheduling Simulation</h3>
                    <Info className="text-gray-400 cursor-help" size={12} />
                  </div>

                  {/* Scheduling Policy Selector */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Scheduling Policy</label>
                    <select
                      value={systemState.schedulingPolicy || ""}
                      onChange={(e) => {
                        const policy = e.target.value as SystemState["schedulingPolicy"]
                        setSystemState((prev) => ({ ...prev, schedulingPolicy: policy }))
                        logAction("SET_POLICY", `Changed scheduling policy to ${policy}`)
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    >
                      <option value="">Select Policy...</option>
                      <option value="FCFS">First Come First Serve (FCFS)</option>
                      <option value="SJF">Shortest Job First (SJF)</option>
                      <option value="Priority">Priority Scheduling</option>
                    </select>
                  </div>

                  {/* Processes Section */}
                  <div className="space-y-3">
                    {/* CPU */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Cpu className="text-green-600" size={12} />
                        <span className="text-xs font-medium text-gray-700">CPU</span>
                      </div>
                      <div className="min-h-[50px] p-3 bg-green-50 border border-dashed border-green-300 rounded-lg">
                        {systemState.runningProcess ? (
                          <div className="bg-green-600 text-white px-3 py-2 rounded text-sm inline-block">
                            P{systemState.runningProcess.id} ({systemState.runningProcess.mapping?.run_time || 0}/{systemState.runningProcess.burstTime})
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No process running</span>
                        )}
                      </div>
                    </div>

                    {/* Ready Queue */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="text-blue-600" size={12} />
                        <span className="text-xs font-medium text-gray-700">Ready</span>
                      </div>
                      <div className="min-h-[50px] p-3 bg-blue-50 border border-dashed border-blue-300 rounded-lg">
                        {systemState.readyQueue.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {systemState.readyQueue.map((p) => (
                              <div key={p.id} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                                P{p.id} (B:{p.burstTime})
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No processes ready</span>
                        )}
                      </div>
                    </div>

                    {/* I/O Queue */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="text-yellow-600" size={12} />
                        <span className="text-xs font-medium text-gray-700">I/O</span>
                      </div>
                      <div className="min-h-[50px] p-3 bg-yellow-50 border border-dashed border-yellow-300 rounded-lg">
                        {systemState.waitingQueue.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {systemState.waitingQueue.map((p) => (
                              <div
                                key={p.id}
                                onClick={() => {
                                  const updatedProcess = { ...p, status: "ready" as const }
                                  setSystemState((prev) => ({
                                    ...prev,
                                    waitingQueue: prev.waitingQueue.filter((proc) => proc.id !== p.id),
                                    readyQueue: [...prev.readyQueue, updatedProcess],
                                  }))
                                  logAction("IO_COMPLETE", `P${p.id} I/O completed`)
                                }}
                                className="bg-yellow-600 text-white px-2 py-1 rounded text-xs cursor-pointer hover:bg-yellow-700"
                              >
                                P{p.id}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No processes in I/O</span>
                        )}
                      </div>
                    </div>

                    {/* Terminated */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="text-gray-600" size={12} />
                        <span className="text-xs font-medium text-gray-700">Terminated</span>
                      </div>
                      <div className="min-h-[50px] p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                        {systemState.completedProcesses.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {systemState.completedProcesses.map((p) => (
                              <div key={p.id} className="bg-gray-600 text-white px-2 py-1 rounded text-xs">
                                P{p.id}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No terminated processes</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Schedule Next Button */}
                  <button
                    onClick={scheduleNext}
                    disabled={systemState.readyQueue.length === 0 || !!systemState.runningProcess}
                    className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Schedule Next
                  </button>
                </div>
              </div>

              {/* Metrics & Log Panel */}
              <div className="col-span-12 lg:col-span-3">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="text-gray-700" size={16} />
                    <h3 className="font-semibold text-gray-900 text-sm">Metrics & Log</h3>
                    <Info className="text-gray-400 cursor-help" size={12} />
                  </div>

                  {/* Metrics */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Valid Transitions</span>
                      <span className="font-medium text-green-600">{actionLog.filter(l => !l.action.includes('INVALID')).length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Invalid Attempts</span>
                      <span className="font-medium text-red-600">{actionLog.filter(l => l.action.includes('INVALID')).length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Completed Processes</span>
                      <span className="font-medium text-blue-600">{systemState.completedProcesses.length}</span>
                    </div>
                  </div>

                  {/* State Presence */}
                  <div className="mb-4">
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-2">
                      State Presence (Relative)
                      <Info className="text-gray-400 cursor-help" size={10} />
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      {systemState.completedProcesses.length > 0 || systemState.runningProcess ? (
                        <div className="space-y-2">
                          {systemState.completedProcesses.map((p) => (
                            <div key={p.id} className="text-xs">
                              <div className="flex justify-between mb-1">
                                <span>P{p.id}</span>
                                <span className="text-gray-500">WT: {p.waitingTime}</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (p.waitingTime || 0) * 10)}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">No process data yet. Create a process and advance the clock to see state presence tracking.</p>
                      )}
                    </div>
                  </div>

                  {/* Action Log */}
                  <div>
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-2">
                      Action Log
                      <Info className="text-gray-400 cursor-help" size={10} />
                    </div>
                    <div ref={logRef} className="h-32 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-2">
                      {actionLog.length > 0 ? (
                        <div className="space-y-1">
                          {actionLog.slice(-10).map((log) => (
                            <div key={log.id} className="text-xs">
                              <span className="text-gray-500">[{log.timestamp}]</span>{" "}
                              <span className="text-gray-700">{log.description}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-4">No activity yet. Start the simulation to see logs.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System States Section */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <RotateCcw className="text-gray-700" size={16} />
                  <h3 className="font-semibold text-gray-900 text-sm">System States</h3>
                  <Info className="text-gray-400 cursor-help" size={12} />
                </div>
                <button className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Export
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Current State Summary */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current State Summary</h4>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    {systemState.readyQueue.length === 0 && !systemState.runningProcess && systemState.completedProcesses.length === 0 ? (
                      <p className="text-xs text-gray-400">No active processes. Create a process to see state information.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Ready: <span className="font-medium text-blue-600">{systemState.readyQueue.length}</span></div>
                        <div>CPU: <span className="font-medium text-green-600">{systemState.runningProcess ? 1 : 0}</span></div>
                        <div>I/O: <span className="font-medium text-yellow-600">{systemState.waitingQueue.length}</span></div>
                        <div>Terminated: <span className="font-medium text-gray-600">{systemState.completedProcesses.length}</span></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* State Transition History */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">State Transition History</h4>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg max-h-24 overflow-y-auto">
                    {actionLog.length === 0 ? (
                      <p className="text-xs text-gray-400">No transitions recorded yet. Interact with the simulation to see history.</p>
                    ) : (
                      <div className="space-y-1">
                        {actionLog.slice(-5).map((log) => (
                          <div key={log.id} className="text-xs text-gray-600">
                            T{log.timestamp}: {log.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "guided" && (
          <div className="max-w-7xl mx-auto p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="text-blue-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">Guided Learning Scenarios</h2>
                <Info
                  className="text-gray-400 cursor-help"
                  size={20}
                  title="Interactive step-by-step learning scenarios with specific objectives and outcomes"
                />
              </div>

              <p className="text-gray-600 mb-8">
                Learn process scheduling algorithms through interactive, step-by-step guided scenarios with immediate
                feedback and hints.
              </p>

              <div className="space-y-6">
                {GUIDED_SCENARIOS.map((scenario) => (
                  <div key={scenario.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{scenario.title}</h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              scenario.difficulty === "beginner"
                                ? "bg-green-100 text-green-800"
                                : scenario.difficulty === "intermediate"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {scenario.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{scenario.description}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {scenario.estimatedTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {scenario.processes.length} processes
                          </span>
                          <span className="flex items-center gap-1">
                            <ArrowRight size={14} />
                            {scenario.steps.length} guided steps
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Learning Objectives:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {scenario.objectives.map((objective, index) => (
                          <li key={index}>{objective}</li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => startGuidedScenario(scenario)}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Play size={16} />
                      Start Guided Learning
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "evaluation" && (
          <div className="max-w-7xl mx-auto p-6">
            {/* Sub-navigation for Evaluation - Centered */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
              <div className="flex justify-center border-b border-gray-200">
                {[
                  { id: "scenarios", label: "Scenarios", tooltip: "Assessment scenarios for evaluation" },
                  { id: "results", label: "Results", tooltip: "View your performance results and scores" },
                  { id: "analytics", label: "Analytics", tooltip: "Detailed learning analytics and progress" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id as any)}
                    className={`px-8 py-4 font-medium transition-colors ${
                      activeSubTab === tab.id
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    title={tab.tooltip}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeSubTab === "scenarios" && (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Target className="text-blue-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-900">Instructor Evaluation Scenarios</h2>
                  <Info
                    className="text-gray-400 cursor-help"
                    size={20}
                    title="Comprehensive evaluation scenarios designed for formal assessment and grading"
                  />
                </div>

                <p className="text-gray-600 mb-8">
                  Comprehensive scenarios designed to test different aspects of process scheduling knowledge. Each
                  scenario includes detailed scoring and feedback for educational assessment.
                </p>

                <div className="space-y-6">
                  {GUIDED_SCENARIOS.map((scenario) => (
                    <div key={scenario.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{scenario.title}</h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                scenario.difficulty === "beginner"
                                  ? "bg-green-100 text-green-800"
                                  : scenario.difficulty === "intermediate"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {scenario.difficulty}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4">{scenario.description}</p>

                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {scenario.estimatedTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={14} />
                              Min throughput: 3
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Learning Objectives:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {scenario.objectives.map((objective, index) => (
                            <li key={index}>{objective}</li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => {
                          setEvaluationMode(true)
                          startGuidedScenario(scenario)
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Play size={16} />
                        Start Scenario
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSubTab === "results" && (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="text-blue-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-900">Evaluation Results</h2>
                  <Info
                    className="text-gray-400 cursor-help"
                    size={20}
                    title="Detailed performance results, scores, and feedback from completed evaluations"
                  />
                </div>

                {evaluationScore ? (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Overall Performance Summary</h3>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-900">{evaluationScore.total}</div>
                          <div className="text-sm text-blue-700">Total Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-900">0%</div>
                          <div className="text-sm text-red-700">Error Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-900">A</div>
                          <div className="text-sm text-green-700">Grade</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-900">95%</div>
                          <div className="text-sm text-purple-700">Efficiency</div>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic FCFS Scheduling</h3>
                      <div className="space-y-4">
                        {evaluationScore.breakdown.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-gray-700">{item.category}</span>
                            <span className="font-medium">
                              {item.score}/{item.maxScore}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">No evaluation results yet</div>
                    <button
                      onClick={() => setActiveSubTab("scenarios")}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Your First Scenario
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeSubTab === "analytics" && (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="text-blue-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-900">Learning Analytics Dashboard</h2>
                  <Info
                    className="text-gray-400 cursor-help"
                    size={20}
                    title="Comprehensive learning analytics including progress tracking, performance trends, and detailed insights"
                  />
                </div>

                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">Complete some scenarios to see analytics data</div>
                  <button
                    onClick={() => setActiveSubTab("scenarios")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Learning
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
