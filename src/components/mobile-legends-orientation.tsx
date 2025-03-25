"use client"

import { useOrientation } from "@/hooks/use-orientation"
import { useEffect, useRef } from "react"

export function MobileLegendsOrientation() {
  const orientation = useOrientation()
  const iconRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (iconRef.current) {
      // Create rotation animation
      const animate = () => {
        iconRef.current?.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(90deg)" }], {
          duration: 1500,
          iterations: Number.POSITIVE_INFINITY,
          easing: "ease-in-out",
          direction: "alternate",
        })
      }

      animate()
    }
  }, [])

  if (orientation === "landscape") {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1b33]">
      <div
        ref={iconRef}
        className="w-16 h-16 rounded-full bg-[#0a1b33] border-2 border-[#3498db] flex items-center justify-center"
        style={{ transformOrigin: "center" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17 1.01L7 1C5.9 1 5 1.9 5 3V21C5 22.1 5.9 23 7 23H17C18.1 23 19 22.1 19 21V3C19 1.9 18.1 1.01 17 1.01ZM17 19H7V5H17V19Z"
            fill="#3498db"
          />
        </svg>
      </div>
    </div>
  )
}

