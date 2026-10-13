import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import Toast from '../components/ui/toast'

/**
 * ToastContext - a small queue for success/error messages.
 *
 * Replaces the previous pattern where each page rendered its own
 * SuccessMessage banner that never dismissed. Messages now stack in one
 * place, slide in, and auto-expire.
 */

const ToastContext = createContext(null)

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))

    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (toast) => {
      nextId += 1
      const id = nextId
      const entry = { id, variant: 'success', duration: 4200, ...toast }

      // Cap the stack so a burst of errors cannot fill the screen.
      setToasts((current) => [...current.slice(-2), entry])

      // The Toast component owns its own visible timer; this is only a
      // backstop that removes the entry if unmounting interrupts it.
      const timer = setTimeout(() => dismiss(id), entry.duration + 400)
      timers.current.set(id, timer)

      return id
    },
    [dismiss]
  )

  const success = useCallback(
    (title, detail) => push({ title, detail, variant: 'success' }),
    [push]
  )

  const error = useCallback(
    (title, detail) => push({ title, detail, variant: 'error', duration: 6000 }),
    [push]
  )

  const value = useMemo(
    () => ({ push, success, error, dismiss }),
    [push, success, error, dismiss]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            detail={toast.detail}
            variant={toast.variant}
            duration={toast.duration}
            onDismiss={() => dismiss(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}