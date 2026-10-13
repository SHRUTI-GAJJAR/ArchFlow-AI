/*
 * ShimmerButton - a button with a travelling light sweep, ported from
 * shadcn/Magic UI.
 *
 * Designed to be drop-in compatible with the existing `.button-primary`
 * class so it can sit inside current markup without restyling it.
 */
export function ShimmerButton({
  children,
  className = "",
  shimmerColor = "#ffffff",
  shimmerSize = "0.06em",
  shimmerDuration = "2.4s",
  as: Tag = "button",
  ...props
}) {
  return (
    <Tag
      className={`shimmer-btn ${className}`}
      style={
        {
          "--shimmer-color": shimmerColor,
          "--shimmer-size": shimmerSize,
          "--shimmer-duration": shimmerDuration,
        }
      }
      {...props}
    >
      <span className="shimmer-btn-content">{children}</span>
    </Tag>
  )
}

export default ShimmerButton