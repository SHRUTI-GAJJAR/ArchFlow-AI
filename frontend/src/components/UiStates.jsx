export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" aria-hidden="true" />
      {label}
    </div>
  )
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="feedback feedback-error" role="alert">
      <span>{message}</span>
      {onRetry && <button className="text-button" type="button" onClick={onRetry}>Try again</button>}
    </div>
  )
}

export function SuccessMessage({ message }) {
  if (!message) return null
  return <div className="feedback feedback-success" role="status">{message}</div>
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">+</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  )
}
