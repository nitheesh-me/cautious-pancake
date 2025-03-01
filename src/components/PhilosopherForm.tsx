interface PhilosopherFormProps {
  philosopherCount: number;
  onPhilosopherCountChange: (count: number) => void;
}

export default function PhilosopherForm({ philosopherCount, onPhilosopherCountChange }: PhilosopherFormProps) {
  return (
    <div className="mb-4">
      <label htmlFor="philosopherCount" className="block text-sm font-medium text-gray-700">
        Number of Philosophers:
      </label>
      <input
        type="number"
        id="philosopherCount"
        name="philosopherCount"
        min="2"
        max="10"
        value={philosopherCount}
        onChange={(e) => onPhilosopherCountChange(parseInt(e.target.value, 10))}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
      />
    </div>
  )
}

