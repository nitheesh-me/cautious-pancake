export function Legend() {
  return (
    <div className="space-y-2">
      <h3 className="text-md font-semibold">Legend</h3>
      <div className="space-y-1 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded-sm mr-2"></div>
          <span>Thinking</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded-sm mr-2"></div>
          <span>Hungry</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-200 border border-green-400 rounded-sm mr-2"></div>
          <span>Eating</span>
        </div>
        <div className="flex items-center mt-2">
          <div className="w-4 h-4 bg-[#3498db] rounded-sm mr-2"></div>
          <span>Available Chopstick</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-400 rounded-sm mr-2"></div>
          <span>Taken Chopstick</span>
        </div>
      </div>
    </div>
  )
}

