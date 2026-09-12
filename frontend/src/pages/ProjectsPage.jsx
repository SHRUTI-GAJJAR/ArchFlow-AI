import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../components/Modal'
import ProjectForm from '../components/ProjectForm'
import { EmptyState, ErrorMessage, LoadingState, SuccessMessage } from '../components/UiStates'
import { getApiErrorMessage } from '../services/api'
import { createProject, deleteProject, getProjects, updateProject } from '../services/projectService'
import { capitalize, formatRelativeDate, getId } from '../utils/formatters'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modal, setModal] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingProjectId, setDeletingProjectId] = useState(null)

  useEffect(() => { loadProjects() }, [])

  async function loadProjects() {
    setIsLoading(true); setError('')
    try { setProjects(await getProjects()) } catch (requestError) { setError(getApiErrorMessage(requestError)) } finally { setIsLoading(false) }
  }

  async function handleProjectSubmit(projectData) {
    setIsSubmitting(true); setError('')
    try {
      if (modal.project) {
        const updatedProject = await updateProject(getId(modal.project), projectData)
        setProjects((current) => current.map((project) => getId(project) === getId(updatedProject) ? updatedProject : project))
        setSuccess('Project updated successfully.')
      } else {
        const newProject = await createProject(projectData)
        setProjects((current) => [newProject, ...current])
        setSuccess('Project created successfully.')
      }
      setModal(null)
    } catch (requestError) { setError(getApiErrorMessage(requestError)) } finally { setIsSubmitting(false) }
  }

  async function handleDelete(project) {
    if (!window.confirm(`Delete ${project.name}? This cannot be undone.`)) return
    const projectId = getId(project)
    setDeletingProjectId(projectId)
    setError('')
    try { await deleteProject(projectId); setProjects((current) => current.filter((item) => getId(item) !== projectId)); setSuccess('Project deleted successfully.') } catch (requestError) { setError(getApiErrorMessage(requestError)) } finally { setDeletingProjectId(null) }
  }

  return (
    <div className="content-container"><div className="page-heading"><div><p className="eyebrow">Workspace</p><h1>Projects</h1><p className="page-subtitle">Keep every project, conversation, and next step in view.</p></div><button className="button button-primary" type="button" onClick={() => setModal({ type: 'create' })}>+ New project</button></div><SuccessMessage message={success} />{error && <ErrorMessage message={error} onRetry={loadProjects} />}{isLoading ? <LoadingState label="Loading projects..." /> : projects.length === 0 ? <EmptyState title="No projects yet" message="Create a project to give your communication a home." action={<button className="button button-primary" type="button" onClick={() => setModal({ type: 'create' })}>Create project</button>} /> : <div className="project-card-grid">{projects.map((project) => <article className="project-card" key={getId(project)}><div className="project-card-top"><span className={`status-badge status-badge-${project.status}`}>{capitalize(project.status || 'planning')}</span><div className="card-menu"><button type="button" className="icon-button" aria-label={`Actions for ${project.name}`} onClick={() => setModal({ type: 'edit', project })}>•••</button></div></div><Link to={`/projects/${getId(project)}`} className="project-card-link"><span className="project-initial large">{project.name?.charAt(0)?.toUpperCase() || 'P'}</span><h2>{project.name}</h2><p>{project.description || 'No description added yet.'}</p></Link><div className="project-card-footer"><span>{project.clientName || 'No client'}</span><span>Updated {formatRelativeDate(project.updatedAt || project.createdAt)}</span></div><div className="card-actions"><Link className="text-button" to={`/projects/${getId(project)}`}>Open project →</Link><button className="text-button danger-text" type="button" disabled={deletingProjectId === getId(project)} onClick={() => handleDelete(project)}>Delete</button></div></article>)}</div>}{modal && <Modal title={modal.type === 'edit' ? 'Edit project' : 'Create a project'} onClose={() => setModal(null)}><ProjectForm project={modal.project} onSubmit={handleProjectSubmit} isSubmitting={isSubmitting} onCancel={() => setModal(null)} /></Modal>}</div>
  )
}
