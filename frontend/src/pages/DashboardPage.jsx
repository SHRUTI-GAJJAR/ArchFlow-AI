import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  EmptyState,
  ErrorMessage,
  LoadingState,
} from '../components/UiStates'
import { getApiErrorMessage } from '../services/api'
import { getProjects } from '../services/projectService'
import { getInsightSummary } from '../services/aiService'
import {
  formatRelativeDate,
  getId,
  capitalize,
} from '../utils/formatters'
import { MoveRight } from "lucide-react";
import { NumberTicker } from '../components/ui/number-ticker'
import { ShimmerCard } from '../components/ui/shimmer-card'
import { BlurFade } from '../components/ui/blur-fade'
import { ProgressBar } from '../components/ui/progress-bar'

export default function DashboardPage() {
  const [projects, setProjects] = useState([])
  const [insightSummary, setInsightSummary] = useState({})
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const loadRequestRef = useRef(0)

  useEffect(() => {
    loadProjects()

    return () => {
      loadRequestRef.current += 1
    }
  }, [])

  async function loadProjects() {
    const requestId = ++loadRequestRef.current

    setIsLoading(true)
    setError('')

    try {
      const [nextProjects, nextSummary] = await Promise.all([
        getProjects(),
        getInsightSummary().catch(() => ({})),
      ])

      if (requestId === loadRequestRef.current) {
        setProjects(nextProjects)
        setInsightSummary(nextSummary)
      }
    } catch (requestError) {
      if (requestId === loadRequestRef.current) {
        setError(getApiErrorMessage(requestError))
      }
    } finally {
      if (requestId === loadRequestRef.current) {
        setIsLoading(false)
      }
    }
  }

  const activeProjects = projects.filter(
    (project) => project.status === 'active'
  ).length

  const completedProjects = projects.filter(
    (project) => project.status === 'completed'
  ).length

  return (
    <div className="content-container">
      <div className="page-heading dashboard-heading">
        <div>
          <p className="eyebrow">Workspace overview</p>
          <h1>Stay on top of your projects.</h1>
          <p className="page-subtitle">
            Track projects, conversations, and the work that needs attention.
          </p>
        </div>

        <Link className="button button-primary" to="/projects">
          View projects <MoveRight size={18} strokeWidth={1.8} />
        </Link>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadProjects} />}

      {isLoading ? (
        <LoadingState label="Loading your workspace..." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="Your workspace is ready"
          message="Create your first project to start turning communication into momentum."
          action={
            <Link className="button button-primary" to="/projects">
              Create your first project
            </Link>
          }
        />
      ) : (
        <>
          <div className="stat-grid">
            <ShimmerCard className="stat-card" delay={0}>
              <span className="stat-label">Projects</span>
              <strong>
                <NumberTicker value={projects.length} inView />
              </strong>
              <span className="stat-note">In this workspace</span>
            </ShimmerCard>

            <ShimmerCard
              className="stat-card stat-highlight"
              delay={100}
            >
              <span className="stat-label">Active projects</span>
              <strong>
                <NumberTicker value={activeProjects} inView />
              </strong>
              <ProgressBar
                className="stat-progress"
                value={projects.length ? (activeProjects / projects.length) * 100 : 0}
                label={`${Math.round(
                  projects.length ? (activeProjects / projects.length) * 100 : 0
                )}% active`}
                delay={200}
              />
            </ShimmerCard>

            <ShimmerCard className="stat-card" delay={200}>
              <span className="stat-label">Completed</span>
              <strong>
                <NumberTicker value={completedProjects} inView />
              </strong>
              <ProgressBar
                className="stat-progress"
                value={projects.length ? (completedProjects / projects.length) * 100 : 0}
                label={`${Math.round(
                  projects.length ? (completedProjects / projects.length) * 100 : 0
                )}% completed`}
                delay={320}
              />
            </ShimmerCard>

            <ShimmerCard className="stat-card" delay={300}>
              <span className="stat-label">Action items</span>
              <strong>
                <NumberTicker
                  value={insightSummary.pendingActionItems ?? 0}
                  inView
                />
              </strong>
              <span className="stat-note">
                {insightSummary.pendingActionItems
                  ? 'Pending from AI insights'
                  : 'No pending action items'}
              </span>
              {/* The bar only earns its space once there is something
                  to show - an empty track reads as a rendering fault. */}
              {insightSummary.totalActionItems > 0 && (
                <ProgressBar
                  className="stat-progress"
                  value={
                    (insightSummary.pendingActionItems /
                      insightSummary.totalActionItems) *
                    100
                  }
                  label={`${insightSummary.pendingActionItems || 0} of ${
                    insightSummary.totalActionItems || 0
                  } still pending`}
                  delay={440}
                />
              )}
            </ShimmerCard>
          </div>

          <section className="dashboard-section">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Recent activity</p>
                <h2>Recent projects</h2>
              </div>

              <Link className="quiet-link" to="/projects">
                View all projects <MoveRight size={10} strokeWidth={1.8} />
              </Link>
            </div>

            <div className="project-list">
              {projects.slice(0, 5).map((project, index) => (
                <BlurFade
                  key={getId(project)}
                  delay={index * 60}
                  inView
                >
                  <Link
                    className="project-row"
                    to={`/projects/${getId(project)}`}
                  >
                    <span className="project-initial">
                      {project.name?.charAt(0)?.toUpperCase() || 'P'}
                    </span>

                    <span className="project-row-info">
                      <strong>{project.name}</strong>
                      <span>
                        {project.clientName || 'No client added'} · Updated{' '}
                        {formatRelativeDate(
                          project.updatedAt || project.createdAt
                        )}
                      </span>
                    </span>

                    <span
                      className={`status-badge status-badge-${project.status}`}
                    >
                      {capitalize(project.status || 'planning')}
                    </span>

                    <MoveRight
                      className="row-arrow"
                      size={17}
                      strokeWidth={1.8}
                    />
                  </Link>
                </BlurFade>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}