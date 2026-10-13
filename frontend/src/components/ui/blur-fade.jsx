import { useEffect, useRef, useState } from "react"

/**
 * BlurFade - staggered fade + rise entrance, ported from shadcn/Magic UI.
 *
 * By default the animation runs on mount. Pass `inView` to defer it until
 * the element first scrolls into the viewport, which keeps long pages from
 * animating everything at once and guarantees off-screen content stays
 * visible rather than stuck at opacity 0.
 *
 * Motion is skipped entirely when the user prefers reduced motion.
 */
export function BlurFade({
  children,
  className = "",
  delay = 0,
  yOffset = 8,
  inView = false,
  // Blur is opt-in. Animating `filter` forces the browser to re-rasterise
  // the element every frame, which is expensive when many elements animate
  // at once (stacked lists, insight panels) and leaves content sitting at
  // opacity 0 on slower devices. Opacity + transform alone are
  // compositor-accelerated, so blur stays available via the `blur` prop.
  blur = "0px",
  as: Tag = "div",
  ...props
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(!inView)

  useEffect(() => {
    if (!inView) {
      setVisible(true)
      return
    }

    const element = ref.current
    if (!element) return

    // Already on screen (short page, fast scroll): reveal without waiting.
    const rect = element.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.15 }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [inView])

  // Entrance slides *up* into place, so it starts below its final position.
  const style = {
    "--blur-fade-delay": `${delay}ms`,
    "--blur-fade-y": `${yOffset}px`,
    "--blur-fade-blur": blur,
  }

  return (
    <Tag
      ref={ref}
      className={`${visible ? "animate-blur-fade" : "blur-fade-hidden"} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Tag>
  )
}

export default BlurFade