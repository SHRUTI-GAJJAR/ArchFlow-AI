/*
 * ShimmerCard - a card wrapper with a hover-driven light sweep.
 *
 * Opt-in wrapper around existing markup. It applies the sweep via a
 * ::before overlay, so any element placed inside gets the effect without
 * needing to change its own classes.
 */
export function ShimmerCard({
  children,
  className = "",
  shimmerColor = "#c98a3c",
  ...props
}) {
  return (
    <div
      className={`shimmer-card ${className}`}
      style={{ "--shimmer-color": shimmerColor }}
      {...props}
    >
      {children}
    </div>
  )
}

export default ShimmerCard