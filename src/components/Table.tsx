import { motion } from 'framer-motion'
import type { Philosopher } from 'types';

interface TableProps {
  philosophers: Philosopher[];
  pickUpForks: (id: number) => void;
}

export default function Table({ philosophers, pickUpForks }: TableProps) {
  const getStateColor = (state: Philosopher['state']) => {
    switch (state) {
      case 'thinking': return '#2C9AD1'
      case 'hungry': return '#E6C74C'
      case 'eating': return '#98CB3B'
      default: return '#FFFFFF'
    }
  }

  const tableRadius = 37.5
  const chopstickLength = 10

  return (
    <div className="relative w-full aspect-square max-w-[400px] mx-auto">
      {/* Table */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          className="w-3/4 h-3/4 rounded-full bg-[#96A0A3]"
          initial={false}
        >
          {/* Food Animation */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-1/3 h-1/3 rounded-full bg-[#98CB3B] opacity-80" />
          </motion.div>
        </motion.div>
      </div>
      
      {/* Philosophers */}
      {philosophers.map((philosopher, i) => {
        const angle = (i * (360 / philosophers.length) - 90) * (Math.PI / 180)
        const x = Math.cos(angle) * tableRadius + 50
        const y = Math.sin(angle) * tableRadius + 50

        return (
          <motion.div
            key={i}
            className="absolute w-[20%] h-[20%] -ml-[10%] -mt-[10%] rounded-full cursor-pointer flex items-center justify-center text-white font-bold"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              backgroundColor: getStateColor(philosopher.state),
            }}
            onClick={() => pickUpForks(i)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            tabIndex={0}
            role="button"
            aria-label={`Philosopher ${i}: ${philosopher.state}`}
          >
            P{i}
          </motion.div>
        )
      })}

      {/* Chopsticks */}
      {philosophers.map((_, i) => {
        const startAngle = (i * (360 / philosophers.length) - 90) * (Math.PI / 180)
        const endAngle = ((i + 1) * (360 / philosophers.length) - 90) * (Math.PI / 180)
        const midAngle = (startAngle + endAngle) / 2

        const startX = Math.cos(startAngle) * tableRadius + 50
        const startY = Math.sin(startAngle) * tableRadius + 50
        const endX = Math.cos(endAngle) * tableRadius + 50
        const endY = Math.sin(endAngle) * tableRadius + 50

        const midX = (startX + endX) / 2
        const midY = (startY + endY) / 2

        const chopstickX = Math.cos(midAngle) * (tableRadius - chopstickLength) + 50
        const chopstickY = Math.sin(midAngle) * (tableRadius - chopstickLength) + 50

        const isInUse = philosophers[i].rightFork || philosophers[(i + 1) % philosophers.length].leftFork

        return (
          <motion.div
            key={`chopstick-${i}`}
            className="absolute w-[10%] h-[1.5%] origin-center"
            style={{
              left: `${chopstickX}%`,
              top: `${chopstickY}%`,
              backgroundColor: isInUse ? 'rgb(185, 28, 28)' : '#000000',
              rotate: `${midAngle * (180 / Math.PI)}deg`,
            }}
            animate={{
              scale: isInUse ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: isInUse ? Infinity : 0,
            }}
          />
        )
      })}
    </div>
  )
}

