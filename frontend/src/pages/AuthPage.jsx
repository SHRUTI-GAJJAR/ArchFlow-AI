import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../services/api'
import { loginUser, registerUser } from '../services/authService'
import { ErrorMessage } from '../components/UiStates'
import { MoveRight } from "lucide-react";

export default function AuthPage({ mode }) {
  const isRegistering = mode === 'register'
  const { isAuthenticated, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitRequestRef = useRef(0)

  useEffect(() => () => {
    submitRequestRef.current += 1
  }, [])

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  function handleChange(event) {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const requestId = ++submitRequestRef.current
    setError('')
    setIsSubmitting(true)

    try {
      const response = isRegistering
        ? await registerUser(formData)
        : await loginUser({
            email: formData.email,
            password: formData.password,
          })

      if (requestId !== submitRequestRef.current) return

      signIn(response)
      navigate(location.state?.from?.pathname || '/dashboard', {
        replace: true,
      })
    } catch (requestError) {
      if (requestId === submitRequestRef.current) {
        setError(getApiErrorMessage(requestError))
      }
    } finally {
      if (requestId === submitRequestRef.current) setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <Link className="brand brand-light" to="/">
          <span className="brand-symbol">AF</span>
          <span>
            ArchFlow <strong>AI</strong>
          </span>
        </Link>

        <div className="auth-story">
          <p className="eyebrow eyebrow-light">
            Project communication, made actionable
          </p>

          <h1>Turn project communication into actionable insights.</h1>

          <p>
            Analyze project conversations to identify decisions, action items,
            deadlines, and people involved.
          </p>

          <div className="story-flow">
            <span>Capture</span>
            <MoveRight size={20} strokeWidth={1.8} />
            <span>Analyze</span>
            <MoveRight size={20} strokeWidth={1.8} />
            <span>Act</span>
          </div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-heading">
            <p className="eyebrow">Welcome to ArchFlow AI</p>

            <h2>
              {isRegistering ? 'Create your workspace' : 'Welcome back'}
            </h2>

            <p>
              {isRegistering
                ? 'Set up your workspace for clearer project communication.'
                : 'Sign in to review your projects and communication.'}
            </p>
          </div>

          {error && <ErrorMessage message={error} />}

          <form className="form-stack" onSubmit={handleSubmit}>
            {isRegistering && (
              <label className="field-label">
                Full name
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Alex Morgan"
                  required
                />
              </label>
            )}

            <label className="field-label">
              Email address
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                required
              />
            </label>

            <label className="field-label">
              Password
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                minLength="6"
                required
              />
            </label>

            <button
              className="button button-primary button-full"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Working...'
                : isRegistering
                  ? 'Create account'
                  : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            {isRegistering
              ? 'Already have an account?'
              : 'New to ArchFlow AI?'}{' '}
            <Link to={isRegistering ? '/login' : '/register'}>
              {isRegistering ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}