import { useEffect, useState } from "react"

/**
 * PageTransition - fades and lifts content on every route change.
 *
 * `transitionKey` should be the route identity (usually the pathname).
 * The content is remounted via `key` so the CSS animation replays.
 */
export function PageTransition({ transitionKey, children, className = "" }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Re-trigger on route change.
    setMounted(false)

    const frame = requestAnimationFrame(() => {
      setMounted(true)
    })

    return () => cancelAnimationFrame(frame)
  }, [transitionKey])

  return (
    <div className={`page-transition ${mounted ? "is-mounted" : ""} ${className}`}>
      {children}
    </div>
  )
}

export default PageTransition