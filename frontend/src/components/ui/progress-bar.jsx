import { useEffect, useState } from "react"

/**
 * ProgressBar - an animated progress indicator for project status.
 *
 * Width animates from 0 on mount (and on value change) using a CSS
 * transition, so status changes read as movement rather than a jump.
 */
export function ProgressBar({
  value = 0,
  max = 100,
  label,
  delay = 0,
  className = "",
}) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      const clamped = Math.max(0, Math.min(100, (value / max) * 100))
      setWidth(clamped)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, max, delay])

  return (
    <div className={className}>
      {label && (
        <div className="drafting-label" style={{ marginBottom: 5 }}>
          {label}
        </div>
      )}

      <div
        className="draft-progress"
        role="progressbar"
        aria-valuenow={Math.round((value / max) * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "Progress"}
      >
        <div className="draft-progress-fill" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

export default ProgressBar