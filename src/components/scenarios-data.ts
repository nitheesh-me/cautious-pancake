import type { Philosopher } from "./dining-philosophers"

export interface ScenarioStep {
  title: string
  description: string
  hint: string
  validation: ((philosophers: Philosopher[]) => boolean) | null
}

export interface Scenario {
  id: number
  slug: string
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  duration: string
  timeLimit: number
  objectives: string[]
  expectedOutcome: {
    minEatingCycles: number
    maxDeadlocks: number
    minPhilosophers: number
  }
  scoringCriteria: {
    timeBonus: number
    accuracyWeight: number
    completionWeight: number
    fairnessWeight: number
  }
  steps: ScenarioStep[]
}

// Single source of truth shared by both the Guided Scenarios tab and the
// Evaluation (unguided) tab. 2 beginner, 2 intermediate, 2 advanced.
export const SCENARIOS: Scenario[] = [
  // ---------------- BEGINNER ----------------
  {
    id: 1,
    slug: "basic-operation",
    title: "Basic Operation",
    description: "Learn how philosophers think, become hungry, and eat with chopsticks.",
    difficulty: "beginner",
    duration: "~10m",
    timeLimit: 300,
    objectives: [
      "Understand philosopher state transitions",
      "Learn to pick up and release chopsticks",
      "Complete a successful eating cycle",
      "Return a philosopher to the thinking state",
    ],
    expectedOutcome: { minEatingCycles: 1, maxDeadlocks: 0, minPhilosophers: 1 },
    scoringCriteria: { timeBonus: 1.0, accuracyWeight: 1.2, completionWeight: 1.0, fairnessWeight: 1.0 },
    steps: [
      {
        title: "Step 1: Understanding Thinking State",
        description: "All philosophers start in the thinking state (grey). Observe the table.",
        hint: "Look at the circular table. Grey circles represent thinking philosophers.",
        validation: null,
      },
      {
        title: "Step 2: Making a Philosopher Hungry",
        description: "Click on Philosopher 1 to make them hungry (yellow).",
        hint: "Click on the grey circle labeled 'Philosopher 1'.",
        validation: (phil) => phil[0]?.state === "hungry",
      },
      {
        title: "Step 3: Picking Up First Chopstick",
        description: "Click on the chopstick to the left of Philosopher 1.",
        hint: "Available chopsticks are highlighted. Click the one next to Philosopher 1.",
        validation: (phil) => phil[0]?.leftChopstick !== null,
      },
      {
        title: "Step 4: Picking Up Second Chopstick",
        description: "Click on the chopstick to the right of Philosopher 1 so they can eat.",
        hint: "Now pick up the other chopstick so Philosopher 1 can eat.",
        validation: (phil) => phil[0]?.state === "eating",
      },
      {
        title: "Step 5: Finishing the Meal",
        description: "Click on Philosopher 1 again to finish eating and release chopsticks.",
        hint: "Click the green eating philosopher to return them to the thinking state.",
        validation: (phil) => phil[0]?.state === "thinking" && phil[0]?.eatingCount > 0,
      },
    ],
  },
  {
    id: 2,
    slug: "chopstick-sharing",
    title: "Chopstick Sharing",
    description: "Discover how non-adjacent philosophers can eat at the same time by sharing resources.",
    difficulty: "beginner",
    duration: "~10m",
    timeLimit: 300,
    objectives: [
      "Identify which philosophers share a chopstick",
      "Let two non-adjacent philosophers eat simultaneously",
      "Observe parallel resource usage",
      "Avoid blocking neighbors",
    ],
    expectedOutcome: { minEatingCycles: 2, maxDeadlocks: 0, minPhilosophers: 2 },
    scoringCriteria: { timeBonus: 1.0, accuracyWeight: 1.0, completionWeight: 1.2, fairnessWeight: 1.0 },
    steps: [
      {
        title: "Step 1: Make Philosopher 1 Eat",
        description: "Make Philosopher 1 hungry and give them both chopsticks to start eating.",
        hint: "Click Philosopher 1, then click the chopsticks on both sides.",
        validation: (phil) => phil[0]?.state === "eating",
      },
      {
        title: "Step 2: Make Philosopher 3 Eat Too",
        description: "While Philosopher 1 eats, make Philosopher 3 eat at the same time.",
        hint: "Philosopher 3 is not adjacent to Philosopher 1, so their chopsticks are free.",
        validation: (phil) => phil[0]?.state === "eating" && phil[2]?.state === "eating",
      },
      {
        title: "Step 3: Observe Parallel Eating",
        description: "Two philosophers are eating concurrently without conflict. This is maximum parallelism for 5 seats.",
        hint: "Non-adjacent philosophers never compete for the same chopstick.",
        validation: null,
      },
      {
        title: "Step 4: Release Resources",
        description: "Click both eating philosophers to finish their meals and free the chopsticks.",
        hint: "Click each green philosopher to return them to thinking.",
        validation: (phil) => phil[0]?.eatingCount > 0 && phil[2]?.eatingCount > 0,
      },
    ],
  },
  // ---------------- INTERMEDIATE ----------------
  {
    id: 3,
    slug: "deadlock-creation",
    title: "Deadlock Creation & Detection",
    description: "Create a deadlock scenario where every philosopher holds exactly one chopstick.",
    difficulty: "intermediate",
    duration: "~15m",
    timeLimit: 420,
    objectives: [
      "Make all philosophers hungry simultaneously",
      "Have each philosopher pick up their left chopstick",
      "Observe the circular wait (deadlock) condition",
      "Reset and resolve the deadlock",
    ],
    expectedOutcome: { minEatingCycles: 0, maxDeadlocks: 1, minPhilosophers: 5 },
    scoringCriteria: { timeBonus: 0.8, accuracyWeight: 1.0, completionWeight: 1.2, fairnessWeight: 1.0 },
    steps: [
      {
        title: "Step 1: Make All Philosophers Hungry",
        description: "Click each philosopher to make all 5 hungry.",
        hint: "Click on each grey philosopher circle to turn them yellow.",
        validation: (phil) => phil.every((p) => p.state === "hungry"),
      },
      {
        title: "Step 2: Each Picks Up Left Chopstick",
        description: "Have each philosopher pick up their left chopstick only.",
        hint: "Click the chopstick to the left of each philosopher.",
        validation: (phil) => phil.every((p) => p.leftChopstick !== null && p.rightChopstick === null),
      },
      {
        title: "Step 3: Observe Deadlock",
        description: "Notice that no philosopher can pick up their right chopstick. This is deadlock!",
        hint: "All chopsticks are taken, creating a circular wait condition.",
        validation: null,
      },
      {
        title: "Step 4: Resolve Deadlock",
        description: "Click Reset to break the deadlock and restore the system.",
        hint: "Use the Reset button in the Controls panel.",
        validation: null,
      },
    ],
  },
  {
    id: 4,
    slug: "starvation-prevention",
    title: "Starvation Prevention",
    description: "Manage resource allocation fairly to prevent any philosopher from starving.",
    difficulty: "intermediate",
    duration: "~12m",
    timeLimit: 480,
    objectives: [
      "Complete eating cycles for at least 3 different philosophers",
      "Ensure no philosopher is repeatedly blocked by neighbors",
      "Maintain zero deadlock conditions",
      "Demonstrate fair resource distribution",
    ],
    expectedOutcome: { minEatingCycles: 3, maxDeadlocks: 0, minPhilosophers: 3 },
    scoringCriteria: { timeBonus: 1.0, accuracyWeight: 1.2, completionWeight: 1.2, fairnessWeight: 1.5 },
    steps: [
      {
        title: "Step 1: Feed Philosophers 1 and 3",
        description: "Let Philosophers 1 and 3 each complete an eating cycle.",
        hint: "Make them hungry, hand them both chopsticks, then release.",
        validation: (phil) => phil[0]?.eatingCount > 0 && phil[2]?.eatingCount > 0,
      },
      {
        title: "Step 2: Feed the Starved Philosopher",
        description: "Now make sure Philosopher 2 also gets to eat, even though both neighbors used resources.",
        hint: "Make Philosopher 2 hungry and free up the chopsticks they need.",
        validation: (phil) => phil[1]?.eatingCount > 0,
      },
      {
        title: "Step 3: Confirm Fair Distribution",
        description: "Ensure at least 3 different philosophers have eaten at least once.",
        hint: "Check the Metrics panel: at least 3 philosophers should show a non-zero eat count.",
        validation: (phil) => phil.filter((p) => p.eatingCount > 0).length >= 3,
      },
    ],
  },
  // ---------------- ADVANCED ----------------
  {
    id: 5,
    slug: "full-cycle-mastery",
    title: "Full Cycle Mastery",
    description: "Execute multiple complete eating cycles so that every philosopher eats without deadlock.",
    difficulty: "advanced",
    duration: "~18m",
    timeLimit: 600,
    objectives: [
      "Complete at least 5 eating cycles total",
      "Have every philosopher eat at least once",
      "Maintain zero deadlocks throughout",
      "Demonstrate mastery of the algorithm",
    ],
    expectedOutcome: { minEatingCycles: 5, maxDeadlocks: 0, minPhilosophers: 5 },
    scoringCriteria: { timeBonus: 0.8, accuracyWeight: 1.5, completionWeight: 1.2, fairnessWeight: 1.0 },
    steps: [
      {
        title: "Step 1: Feed Every Philosopher Once",
        description: "Cycle through all 5 philosophers so each completes at least one meal.",
        hint: "Work around the table, feeding non-adjacent philosophers in parallel when possible.",
        validation: (phil) => phil.every((p) => p.eatingCount > 0),
      },
      {
        title: "Step 2: Reach 5 Total Eating Cycles",
        description: "Continue feeding philosophers until the total number of eating cycles reaches 5.",
        hint: "The total is the sum of every philosopher's eat count.",
        validation: (phil) => phil.reduce((sum, p) => sum + p.eatingCount, 0) >= 5,
      },
      {
        title: "Step 3: Maintain a Deadlock-Free System",
        description: "Confirm the system never settled into a deadlock during your cycles.",
        hint: "If everyone is hungry holding a single chopstick, you have deadlocked — reset and retry.",
        validation: null,
      },
    ],
  },
  {
    id: 6,
    slug: "throughput-optimization",
    title: "Throughput Optimization",
    description: "Maximize concurrency by keeping two philosophers eating in parallel across many cycles.",
    difficulty: "advanced",
    duration: "~20m",
    timeLimit: 600,
    objectives: [
      "Keep two non-adjacent philosophers eating simultaneously",
      "Complete at least 8 total eating cycles",
      "Avoid all deadlock and starvation",
      "Optimize for maximum resource utilization",
    ],
    expectedOutcome: { minEatingCycles: 8, maxDeadlocks: 0, minPhilosophers: 5 },
    scoringCriteria: { timeBonus: 1.0, accuracyWeight: 1.5, completionWeight: 1.5, fairnessWeight: 1.2 },
    steps: [
      {
        title: "Step 1: Establish Parallel Eating",
        description: "Get two non-adjacent philosophers (e.g. 1 and 3) eating at the same time.",
        hint: "Non-adjacent philosophers can eat concurrently without competing for chopsticks.",
        validation: (phil) => phil.filter((p) => p.state === "eating").length >= 2,
      },
      {
        title: "Step 2: Sustain High Throughput",
        description: "Keep cycling philosophers in parallel until 8 total eating cycles are reached.",
        hint: "As soon as one pair finishes, start the next non-adjacent pair.",
        validation: (phil) => phil.reduce((sum, p) => sum + p.eatingCount, 0) >= 8,
      },
      {
        title: "Step 3: Verify Balanced Utilization",
        description: "Make sure every philosopher contributed to the throughput at least once.",
        hint: "Each philosopher should show a non-zero eat count in the Metrics panel.",
        validation: (phil) => phil.every((p) => p.eatingCount > 0),
      },
    ],
  },
]
