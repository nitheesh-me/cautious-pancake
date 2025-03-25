export function ManualInstructions() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Manual Simulation Guide</h3>

      <div className="space-y-2">
        <h4 className="font-medium">Interacting with Philosophers:</h4>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Click on a <span className="bg-gray-200 px-1 rounded">thinking</span> philosopher to make them{" "}
            <span className="bg-yellow-200 px-1 rounded">hungry</span>
          </li>
          <li>When a philosopher is hungry, they can pick up chopsticks</li>
          <li>
            Click on a <span className="bg-green-200 px-1 rounded">eating</span> philosopher to make them finish eating
            and return to <span className="bg-gray-200 px-1 rounded">thinking</span>
          </li>
        </ol>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Interacting with Chopsticks:</h4>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Click on a <span className="bg-[#3498db] text-white px-1 rounded">blue</span> chopstick to have a hungry
            philosopher pick it up
          </li>
          <li>
            Click on a <span className="bg-red-400 text-white px-1 rounded">red</span> chopstick to have the philosopher
            put it down
          </li>
          <li>Each philosopher can only pick up the chopsticks to their immediate left and right</li>
          <li>A philosopher needs both chopsticks to eat</li>
        </ol>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Chopstick Assignment:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Philosopher 1 uses chopsticks 1 and 5</li>
          <li>Philosopher 2 uses chopsticks 2 and 1</li>
          <li>Philosopher 3 uses chopsticks 3 and 2</li>
          <li>Philosopher 4 uses chopsticks 4 and 3</li>
          <li>Philosopher 5 uses chopsticks 5 and 4</li>
        </ul>
        <p className="text-sm italic">
          Note: Each philosopher's left chopstick has the same number as the philosopher, and their right chopstick is
          the previous one (or chopstick 5 for philosopher 1).
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Creating a Deadlock:</h4>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Make all philosophers hungry</li>
          <li>Have each philosopher pick up their left chopstick</li>
          <li>Now no philosopher can pick up their right chopstick</li>
          <li>This is a deadlock - a circular waiting condition</li>
        </ol>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Creating Starvation:</h4>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Make two philosophers (e.g., 1 and 3) repeatedly eat and think</li>
          <li>Observe that other philosophers (e.g., 2, 4, and 5) rarely get a chance to eat</li>
          <li>This is starvation - unfair resource allocation</li>
        </ol>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium">Learning Tips:</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Try different strategies for picking up chopsticks</li>
          <li>Observe what happens when philosophers follow different rules</li>
          <li>Think about how to solve the deadlock and starvation problems</li>
          <li>Use the action log to track the sequence of events</li>
        </ul>
      </div>
    </div>
  )
}

