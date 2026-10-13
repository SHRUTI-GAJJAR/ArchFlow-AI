import { useEffect, useState } from "react"

/**
 * AIScanner - the animated "AI is thinking" state.
 *
 * Purely presentational and frontend-only; it does not change any API
 * behaviour. Cycles through phase labels so the wait feels like progress
 * rather than a frozen button.
 */

const PHASES = [
  "Reading communication",
  "Identifying decisions",
  "Extracting action items",
  "Resolving deadlines",
  "Mapping people involved",
  "Structuring insight",
]

export function AIScanner({ label = "Analyzing", compact = false }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((current) => (current + 1) % PHASES.length)
    }, 1500)

    return () => clearInterval(timer)
  }, [])

  return (
    <span className="ai-scanner">
      <span className="ai-scanner-stage" aria-hidden="true">
        <span className="ai-scanner-ring" />
        <span className="ai-scanner-ring-inner" />
        <span className="ai-scanner-sweep" />
      </span>

      <span className="ai-scanner-copy">
        <span className="ai-scanner-title">{label}</span>
        {!compact && (
          <span className="ai-scanner-phase" aria-live="polite">
            {PHASES[phase]}
          </span>
        )}
      </span>
    </span>
  )
}

export default AIScanner