"use client"

import { useOrientation } from "@/hooks/use-orientation"
import { PhoneRotationAnimation } from "./phone-rotation-animation"

export function OrientationMessage() {
  const orientation = useOrientation()

  if (orientation === "landscape") {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#3498db] bg-opacity-95 text-white p-6">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-6">Please Rotate Your Device</h2>
        <p className="mb-8">
          The Dining Philosophers simulation works best in landscape mode. Please rotate your device for the best
          experience.
        </p>

        <div className="w-48 h-48 mx-auto mb-8">
          <PhoneRotationAnimation />
        </div>

        <div className="p-4 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20">
          <p className="text-sm">
            You'll be able to see the full simulation and interact with all elements when your device is in landscape
            orientation.
          </p>
        </div>
      </div>
    </div>
  )
}

