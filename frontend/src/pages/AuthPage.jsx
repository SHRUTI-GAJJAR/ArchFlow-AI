import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../services/api'
import { loginUser, registerUser } from '../services/authService'
import { ErrorMessage } from '../components/UiStates'

export default function AuthPage({ mode }) {
  const isRegistering = mode === 'register'
  const { isAuthenticated, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  function handleChange(event) {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = isRegistering
        ? await registerUser(formData)
        : await loginUser({ email: formData.email, password: formData.password })
      signIn(response)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <Link className="brand brand-light" to="/">
          <span className="brand-symbol">AF</span>
          <span>ArchFlow <strong>AI</strong></span>
        </Link>
        <div className="auth-story">
          <p className="eyebrow eyebrow-light">Project intelligence, made clear</p>
          <h1>Make every conversation move the work forward.</h1>
          <p>Turn meetings, emails, and notes into a clear view of what was decided, who owns the next step, and what needs attention.</p>
          <div className="story-flow">
            <span>Communication</span><b>→</b><span>AI analysis</span><b>→</b><span>Actionable clarity</span>
          </div>
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-heading">
            <p className="eyebrow">Welcome to ArchFlow AI</p>
            <h2>{isRegistering ? 'Create your workspace' : 'Welcome back'}</h2>
            <p>{isRegistering ? 'Start turning project noise into a confident next step.' : 'Sign in to see what matters across your projects.'}</p>
          </div>
          {error && <ErrorMessage message={error} />}
          <form className="form-stack" onSubmit={handleSubmit}>
            {isRegistering && (
              <label className="field-label">Full name<input name="name" value={formData.name} onChange={handleChange} placeholder="Alex Morgan" required /></label>
            )}
            <label className="field-label">Email address<input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@company.com" required /></label>
            <label className="field-label">Password<input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="At least 6 characters" minLength="6" required /></label>
            <button className="button button-primary button-full" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Working...' : isRegistering ? 'Create account' : 'Sign in'}</button>
          </form>
          <p className="auth-switch">{isRegistering ? 'Already have an account?' : 'New to ArchFlow AI?'} <Link to={isRegistering ? '/login' : '/register'}>{isRegistering ? 'Sign in' : 'Create an account'}</Link></p>
        </div>
      </section>
    </main>
  )
}
