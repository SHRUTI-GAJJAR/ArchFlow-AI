import { useEffect, useState } from "react"
import { X } from "lucide-react"

/**
 * Toast - a dismissible message that slides in and auto-expires.
 *
 * The dismissal timer is rendered as a draining rule so the remaining
 * time is visible rather than surprising.
 */

const DEFAULT_DURATION = 4200

export function Toast({
  title,
  detail,
  variant = "success",
  duration = DEFAULT_DURATION,
  onDismiss,
}) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!duration) return undefined

    const timer = setTimeout(() => {
      setVisible(false)
      onDismiss?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  if (!visible) return null

  return (
    <div
      className={`toast toast-${variant}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <span className="toast-icon" aria-hidden="true">
        {variant === "error" ? "!" : "✓"}
      </span>

      <div className="toast-body">
        <div className="toast-title">{title}</div>
        {detail && <div className="toast-detail">{detail}</div>}
      </div>

      {onDismiss && (
        <button
          className="toast-close"
          type="button"
          aria-label="Dismiss message"
          onClick={() => {
            setVisible(false)
            onDismiss()
          }}
        >
          <X size={15} strokeWidth={1.9} />
        </button>
      )}

      {duration > 0 && (
        <span
          className="toast-timer"
          style={{ "--toast-duration": `${duration}ms` }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export default Toast