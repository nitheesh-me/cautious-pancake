import { useState, useEffect } from "react"

type Orientation = "portrait" | "landscape"

export function useOrientation() {
  const [orientation, setOrientation] = useState<Orientation>("landscape")

  useEffect(() => {
    // Initial check
    checkOrientation()

    // Add event listener for orientation changes
    window.addEventListener("resize", checkOrientation)

    // Clean up
    return () => {
      window.removeEventListener("resize", checkOrientation)
    }
  }, [])

  function checkOrientation() {
    if (window.innerWidth < window.innerHeight) {
      setOrientation("portrait")
    } else {
      setOrientation("landscape")
    }
  }

  return orientation
}

