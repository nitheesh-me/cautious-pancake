import { useOrientation } from "@/hooks/use-orientation"

export function RotateDeviceMessage() {
  const orientation = useOrientation()

  if (orientation === "landscape") {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a1b33]">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-6 relative">
          {/* Phone container with animation */}
          <div className="w-full h-full flex items-center justify-center animate-[rotate-phone_1.5s_ease-in-out_infinite_alternate]">
            {/* Phone outline */}
            <div className="w-16 h-28 rounded-xl border-2 border-white relative">
              {/* Phone screen */}
              <div className="absolute inset-[3px] rounded-lg bg-[#3498db] opacity-70"></div>

              {/* Home button */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 rounded-full bg-white"></div>
            </div>
          </div>
        </div>

        <p className="text-white text-sm font-light">Please rotate your device</p>
      </div>
    </div>
  )
}

