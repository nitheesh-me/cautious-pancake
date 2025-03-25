import { useEffect, useRef } from "react"

export function PhoneRotationAnimation() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    // Animation will start automatically when component mounts
    const phoneElement = svgRef.current?.getElementById("phone")
    const arrowElement = svgRef.current?.getElementById("arrow")

    if (phoneElement && arrowElement) {
      // Reset animation when component mounts
      phoneElement.style.transform = "rotate(0deg)"
      arrowElement.style.opacity = "1"

      // Animation loop
      const animate = () => {
        // Phone rotation animation
        phoneElement.animate(
          [
            { transform: "rotate(0deg)", offset: 0 },
            { transform: "rotate(0deg)", offset: 0.2 },
            { transform: "rotate(90deg)", offset: 0.6 },
            { transform: "rotate(90deg)", offset: 1 },
          ],
          {
            duration: 2000,
            iterations: Number.POSITIVE_INFINITY,
            easing: "ease-in-out",
          },
        )

        // Arrow pulsing animation
        arrowElement.animate(
          [
            { opacity: 1, offset: 0 },
            { opacity: 0.4, offset: 0.5 },
            { opacity: 1, offset: 1 },
          ],
          {
            duration: 2000,
            iterations: Number.POSITIVE_INFINITY,
            easing: "ease-in-out",
          },
        )
      }

      animate()
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      {/* Circular background */}
      <circle cx="100" cy="100" r="80" fill="#3498db" fillOpacity="0.2" />

      {/* Phone */}
      <g id="phone" style={{ transformOrigin: "center" }}>
        <rect x="70" y="60" width="60" height="80" rx="8" fill="#3498db" stroke="white" strokeWidth="3" />
        <rect x="75" y="65" width="50" height="70" rx="4" fill="#2980b9" />
        <circle cx="100" cy="145" r="4" fill="white" />
        <rect x="90" y="60" width="20" height="3" rx="1.5" fill="white" />
      </g>

      {/* Rotation arrow */}
      <g id="arrow" style={{ transformOrigin: "center" }}>
        <path
          d="M140 100 A 40 40 0 1 1 100 60"
          stroke="#2ecc71"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="5 3"
        />
        <path d="M100 50 L 100 70 L 120 60 Z" fill="#2ecc71" transform="rotate(-90, 100, 60)" />
      </g>
    </svg>
  )
}

