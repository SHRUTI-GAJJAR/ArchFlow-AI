import { useEffect, useRef, useState } from "react"

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * NumberTicker - animates a number counting up to `value`.
 *
 * Used on the dashboard stat cards. Intl.NumberFormat is applied per frame
 * so values keep their separators (e.g. 1,250) while counting.
 *
 * Two behaviours matter here:
 *
 *  1. `inView` defers the *first* reveal until the element is on screen.
 *  2. If `value` changes afterwards (e.g. data finishes loading), the
 *     number animates again to the new figure rather than staying stuck.
 *
 * @param {object} props
 * @param {number} props.value        Target value.
 * @param {number} [props.duration]   Animation duration in ms.
 * @param {number} [props.delay]      Delay before starting, in ms.
 * @param {boolean} [props.inView]    Defer the first animation until visible.
 * @param {string} [props.className]
 */
export function NumberTicker({
  value = 0,
  duration = 1200,
  delay = 0,
  inView = false,
  className = "",
}) {
  const target = Number.isFinite(value) ? value : 0

  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const frameRef = useRef(null)
  const timeoutRef = useRef(null)
  const guardRef = useRef(null)
  const hasRevealed = useRef(false)

  useEffect(() => {
    const stop = () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (guardRef.current) clearTimeout(guardRef.current)
      frameRef.current = null
      timeoutRef.current = null
      guardRef.current = null
    }

    // Always jump straight to the value when motion is not wanted.
    if (prefersReducedMotion()) {
      setDisplay(target)
      return
    }

    const animate = () => {
      // Animate from whatever is currently on screen, not from zero, so
      // subsequent value changes count from the visible figure.
      const startValue = display
      let startTime = null
      let settled = false

      const finish = () => {
        if (settled) return
        settled = true
        stop()
        setDisplay(target)
      }

      const step = (timestamp) => {
        if (startTime === null) startTime = timestamp

        const progress = Math.min((timestamp - startTime) / duration, 1)

        // easeOutExpo, so the number decelerates instead of snapping.
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

        setDisplay(startValue + (target - startValue) * eased)

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(step)
        } else {
          finish()
        }
      }

      stop()
      frameRef.current = requestAnimationFrame(step)

      // Safety net: requestAnimationFrame is throttled when the tab is
      // backgrounded or the element is off-screen. Without this the
      // counter could sit on a stale value indefinitely.
      guardRef.current = setTimeout(finish, duration + 400)
    }

    if (inView && !hasRevealed.current) {
      const element = ref.current

      if (!element) return undefined

      const isAlreadyVisible = () => {
        const rect = element.getBoundingClientRect()
        return rect.top < window.innerHeight && rect.bottom > 0
      }

      // Short pages and fast loads can paint the element before the
      // observer gets a chance to fire, so check visibility directly.
      if (isAlreadyVisible()) {
        hasRevealed.current = true
        timeoutRef.current = setTimeout(animate, delay)
      } else {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                hasRevealed.current = true
                observer.disconnect()
                timeoutRef.current = setTimeout(animate, delay)
              }
            })
          },
          { threshold: 0.1 }
        )

        observer.observe(element)

        return () => {
          observer.disconnect()
          stop()
        }
      }
    } else {
      hasRevealed.current = true
      timeoutRef.current = setTimeout(animate, delay)
    }

    return stop
    // `display` is intentionally excluded: including it would restart the
    // animation on every frame it writes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, delay, inView])

  const rounded = Number.isInteger(target)
    ? Math.round(display)
    : Number(display.toFixed(1))

  return (
    <span ref={ref} className={className}>
      {new Intl.NumberFormat("en").format(rounded)}
    </span>
  )
}

export default NumberTicker