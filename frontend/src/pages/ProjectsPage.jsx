import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../components/Modal'
import ProjectForm from '../components/ProjectForm'
import { EmptyState, ErrorMessage, LoadingState, SuccessMessage } from '../components/UiStates'
import { getApiErrorMessage } from '../services/api'
import { createProject, deleteProject, getProjects, updateProject } from '../services/projectService'
import { capitalize, formatRelativeDate, getId } from '../utils/formatters'
import { Plus, MoveRight, SquarePen } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modal, setModal] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingProjectId, setDeletingProjectId] = useState(null)
  const loadRequestRef = useRef(0)
  const submitRequestRef = useRef(0)
  const deleteRequestRef = useRef(0)

  useEffect(() => {
    loadProjects()
    return () => {
      loadRequestRef.current += 1
      submitRequestRef.current += 1
      deleteRequestRef.current += 1
    }
  }, [])

  async function loadProjects() {
    const requestId = ++loadRequestRef.current
    setIsLoading(true); setError('')
    try {
      const nextProjects = await getProjects()
      if (requestId === loadRequestRef.current) setProjects(nextProjects)
    } catch (requestError) {
      if (requestId === loadRequestRef.current) setError(getApiErrorMessage(requestError))
    } finally {
      if (requestId === loadRequestRef.current) setIsLoading(false)
    }
  }

  async function handleProjectSubmit(projectData) {
    const requestId = ++submitRequestRef.current
    setIsSubmitting(true); setError('')
    try {
      if (modal.project) {
        const updatedProject = await updateProject(getId(modal.project), projectData)
        if (requestId !== submitRequestRef.current) return
        setProjects((current) => current.map((project) => getId(project) === getId(updatedProject) ? updatedProject : project))
        setSuccess('Project updated successfully.')
      } else {
        const newProject = await createProject(projectData)
        if (requestId !== submitRequestRef.current) return
        setProjects((current) => [newProject, ...current])
        setSuccess('Project created successfully.')
      }
      setModal(null)
    } catch (requestError) {
      if (requestId === submitRequestRef.current) setError(getApiErrorMessage(requestError))
    } finally {
      if (requestId === submitRequestRef.current) setIsSubmitting(false)
    }
  }

  async function handleDelete(project) {
    if (deletingProjectId) return
    if (!window.confirm(`Delete ${project.name}? This cannot be undone.`)) return
    const requestId = ++deleteRequestRef.current
    const projectId = getId(project)
    setDeletingProjectId(projectId)
    setError('')
    try {
      await deleteProject(projectId)
      if (requestId !== deleteRequestRef.current) return
      setProjects((current) => current.filter((item) => getId(item) !== projectId))
      setSuccess('Project deleted successfully.')
    } catch (requestError) {
      if (requestId === deleteRequestRef.current) setError(getApiErrorMessage(requestError))
    } finally {
      if (requestId === deleteRequestRef.current) setDeletingProjectId(null)
    }
  }

  return (
    <div className="content-container"><div className="page-heading"><div><p className="eyebrow">Workspace</p><h1>Projects</h1><p className="page-subtitle">Manage your projects and keep communication organized.</p></div><button
  className="button button-primary"
  type="button"
  onClick={() => setModal({ type: 'create' })}
>
  <Plus size={18} strokeWidth={1.8} />
  New project
</button>
</div><SuccessMessage message={success} />{error && <ErrorMessage message={error} onRetry={loadProjects} />}{isLoading ? <LoadingState label="Loading projects..." /> : projects.length === 0 ? <EmptyState title="No projects yet" message="Create a project to give your communication a home." action={<button className="button button-primary" type="button" onClick={() => setModal({ type: 'create' })}>Create project</button>} /> : <div className="project-card-grid">{projects.map((project) => <article className="project-card" key={getId(project)}><div className="project-card-top"><span className={`status-badge status-badge-${project.status}`}>{capitalize(project.status || 'planning')}</span><div className="card-menu"><button
  type="button"
  className="icon-button"
  aria-label={`Edit ${project.name}`}
  onClick={() => setModal({ type: 'edit', project })}
>
  <SquarePen size={17} strokeWidth={1.8} />
</button>
</div></div><Link to={`/projects/${getId(project)}`} className="project-card-link"><span className="project-initial large">{project.name?.charAt(0)?.toUpperCase() || 'P'}</span><h2>{project.name}</h2><p>{project.description || 'No description added yet.'}</p></Link><div className="project-card-footer"><span>{project.clientName || 'No client'}</span><span>Updated {formatRelativeDate(project.updatedAt || project.createdAt)}</span></div><div className="card-actions">
 <Link className="text-button" to={`/projects/${getId(project)}`}>
  Open project <MoveRight size={17} strokeWidth={1.8} />
</Link>
<button className="text-button danger-text" type="button" disabled={deletingProjectId === getId(project)} onClick={() => handleDelete(project)}>Delete</button></div></article>)}</div>}{modal && <Modal title={modal.type === 'edit' ? 'Edit project' : 'Create a project'} onClose={() => setModal(null)}><ProjectForm project={modal.project} onSubmit={handleProjectSubmit} isSubmitting={isSubmitting} onCancel={() => setModal(null)} /></Modal>}</div>
  )
}
