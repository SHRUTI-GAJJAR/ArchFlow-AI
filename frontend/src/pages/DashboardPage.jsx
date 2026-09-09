import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorMessage, LoadingState } from '../components/UiStates'
import { getApiErrorMessage } from '../services/api'
import { getProjects } from '../services/projectService'
import { formatRelativeDate, getId, capitalize } from '../utils/formatters'

export default function DashboardPage() {
  const [projects, setProjects] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    setIsLoading(true)
    setError('')
    try {
      setProjects(await getProjects())
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }

  const activeProjects = projects.filter((project) => project.status === 'active').length
  const completedProjects = projects.filter((project) => project.status === 'completed').length

  return (
    <div className="content-container">
      <div className="page-heading dashboard-heading"><div><p className="eyebrow">Workspace overview</p><h1>Good work starts with clarity.</h1><p className="page-subtitle">A focused view of your projects and the conversations moving them forward.</p></div><Link className="button button-primary" to="/projects">View projects <span>→</span></Link></div>
      {error && <ErrorMessage message={error} onRetry={loadProjects} />}
      {isLoading ? <LoadingState label="Loading your workspace..." /> : projects.length === 0 ? <EmptyState title="Your workspace is ready" message="Create your first project to start turning communication into momentum." action={<Link className="button button-primary" to="/projects">Create your first project</Link>} /> : <>
        <div className="stat-grid"><div className="stat-card"><span className="stat-label">Total projects</span><strong>{projects.length}</strong><span className="stat-note">Across your workspace</span></div><div className="stat-card stat-highlight"><span className="stat-label">Active projects</span><strong>{activeProjects}</strong><span className="stat-note">Currently in motion</span></div><div className="stat-card"><span className="stat-label">Completed</span><strong>{completedProjects}</strong><span className="stat-note">Delivered projects</span></div><div className="stat-card"><span className="stat-label">Action items</span><strong>—</strong><span className="stat-note">Tracked from AI insights</span></div></div>
        <section className="dashboard-section"><div className="section-heading-row"><div><p className="eyebrow">Recent activity</p><h2>Your projects</h2></div><Link className="quiet-link" to="/projects">See all projects →</Link></div><div className="project-list">{projects.slice(0, 5).map((project) => <Link className="project-row" to={`/projects/${getId(project)}`} key={getId(project)}><span className="project-initial">{project.name?.charAt(0)?.toUpperCase() || 'P'}</span><span className="project-row-info"><strong>{project.name}</strong><span>{project.clientName || 'No client added'} · Updated {formatRelativeDate(project.updatedAt || project.createdAt)}</span></span><span className={`status-badge status-badge-${project.status}`}>{capitalize(project.status || 'planning')}</span><span className="row-arrow">→</span></Link>)}</div></section>
      </>}
    </div>
  )
}
