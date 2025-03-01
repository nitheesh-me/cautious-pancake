import { TooltipButton } from './TooltipButton'

export default function Legend() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {[
        { state: 'THINKING', color: '#2C9AD1' },
        { state: 'HUNGRY', color: '#E6C74C' },
        { state: 'EATING', color: '#98CB3B' },
      ].map(({ state, color }) => (
        <div key={state} className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
          <span>{state}</span>
          <TooltipButton 
            content={`Philosopher is ${state.toLowerCase()}${state === 'HUNGRY' ? ' and waiting for forks' : ''}`}
            ariaLabel={`${state} state information`}
          />
        </div>
      ))}
    </div>
  )
}

