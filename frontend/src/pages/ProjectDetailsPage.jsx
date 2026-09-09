import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Modal from '../components/Modal'
import CommunicationForm from '../components/CommunicationForm'
import { EmptyState, ErrorMessage, LoadingState, SuccessMessage } from '../components/UiStates'
import { getApiErrorMessage } from '../services/api'
import { getCommunicationInsight } from '../services/aiService'
import { createCommunication, deleteCommunication, getProjectCommunications } from '../services/communicationService'
import { deleteProject, getProject } from '../services/projectService'
import { capitalize, formatDate, formatRelativeDate, getId } from '../utils/formatters'

export default function ProjectDetailsPage() {
  const { projectId } = useParams(); const navigate = useNavigate()
  const [project, setProject] = useState(null); const [communications, setCommunications] = useState([])
  const [insightMap, setInsightMap] = useState({}); const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [showForm, setShowForm] = useState(false); const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => { loadData() }, [projectId])

  async function loadData() { setIsLoading(true); setError(''); try { const [projectData, communicationData] = await Promise.all([getProject(projectId), getProjectCommunications(projectId)]); setProject(projectData); setCommunications(communicationData); const nextInsightMap = {}; for (const communication of communicationData) { const id = getId(communication); try { nextInsightMap[id] = await getCommunicationInsight(id) } catch (insightError) { if (insightError.response?.status !== 404) throw insightError; nextInsightMap[id] = null } } setInsightMap(nextInsightMap) } catch (requestError) { setError(getApiErrorMessage(requestError)) } finally { setIsLoading(false) } }
  async function handleCommunicationSubmit(data) { setIsSubmitting(true); setError(''); try { const communication = await createCommunication(data); setCommunications((current) => [communication, ...current]); setShowForm(false); setSuccess('Communication added successfully.') } catch (requestError) { setError(getApiErrorMessage(requestError)) } finally { setIsSubmitting(false) } }
  async function handleDeleteCommunication(communication) { if (!window.confirm(`Delete ${communication.title}?`)) return; try { await deleteCommunication(getId(communication)); setCommunications((current) => current.filter((item) => getId(item) !== getId(communication))); setSuccess('Communication deleted successfully.') } catch (requestError) { setError(getApiErrorMessage(requestError)) } }
  async function handleDeleteProject() { if (!window.confirm(`Delete ${project.name}?`)) return; try { await deleteProject(projectId); navigate('/projects') } catch (requestError) { setError(getApiErrorMessage(requestError)) } }

  const normalizedQuery = searchTerm.trim().toLowerCase()
  const filteredCommunications = communications.filter((communication) => {
    if (!normalizedQuery) return true
    const insight = insightMap[getId(communication)] || {}
    const searchableText = [
      communication.title,
      communication.content,
      communication.source,
      (communication.participants || []).join(' '),
      insight.summary || '',
      (insight.decisions || []).join(' '),
      (insight.actionItems || []).map((item) => `${item.task} ${item.assignee} ${item.deadline} ${item.status}`).join(' '),
      (insight.deadlines || []).map((deadline) => `${deadline.description} ${deadline.date}`).join(' '),
      (insight.peopleInvolved || []).join(' '),
    ].join(' ').toLowerCase()
    return searchableText.includes(normalizedQuery)
  })

  if (isLoading) return <div className="content-container"><LoadingState label="Loading project..." /></div>
  if (error && !project) return <div className="content-container"><ErrorMessage message={error} onRetry={loadData} /></div>
  if (!project) return null

  return <div className="content-container"><Link className="back-link" to="/projects">← Back to projects</Link><div className="project-detail-heading"><div><div className="heading-with-badge"><span className={`status-badge status-badge-${project.status}`}>{capitalize(project.status || 'planning')}</span></div><h1>{project.name}</h1><p className="page-subtitle">{project.description || 'No project description yet.'}</p></div><div className="heading-actions"><button className="button button-danger-ghost" type="button" onClick={handleDeleteProject}>Delete project</button><button className="button button-primary" type="button" onClick={() => setShowForm(true)}>+ Add communication</button></div></div><SuccessMessage message={success} />{error && <ErrorMessage message={error} />}
    <div className="detail-meta"><span><strong>Client</strong>{project.clientName || 'Not added'}</span><span><strong>Created</strong>{formatDate(project.createdAt)}</span><span><strong>Last activity</strong>{formatRelativeDate(project.updatedAt)}</span><span><strong>Communications</strong>{communications.length}</span></div>
    <section className="communications-section"><div className="section-heading-row"><div><p className="eyebrow">Project memory</p><h2>Communications</h2></div><span className="muted-copy">{communications.length} captured</span></div>{communications.length === 0 ? <EmptyState title="No communication captured" message="Add a meeting, email, chat, or note to start extracting project intelligence." action={<button className="button button-primary" type="button" onClick={() => setShowForm(true)}>Add communication</button>} /> : <><div className="project-memory-search"><label className="search-field" htmlFor="project-memory-search">Search project memory<input id="project-memory-search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search decisions, actions, deadlines, people..." /></label></div>{searchTerm && <div className="search-summary">{filteredCommunications.length} {filteredCommunications.length === 1 ? 'memory match' : 'memory matches'} in this project</div>}{filteredCommunications.length === 0 ? <div className="empty-state search-empty-state"><div className="empty-icon" aria-hidden="true">⌕</div><h3>No project memory matches</h3><p>Try a different keyword such as a person, deadline, decision, or action item.</p></div> : <div className="communication-list">{filteredCommunications.map((communication) => { const insight = insightMap[getId(communication)] || {}; const insightPreview = insight.summary || (insight.actionItems && insight.actionItems.length ? insight.actionItems.map((item) => item.task).join(' • ') : ''); const matchPreview = communication.content?.slice(0, 160) || insightPreview || 'No saved communication content available.'; return <article className="communication-row" key={getId(communication)}><div className={`source-icon source-${communication.source}`}>{communication.source?.charAt(0)?.toUpperCase() || 'N'}</div><div className="communication-main"><div className="communication-title-row"><Link to={`/communications/${getId(communication)}`}><h3>{communication.title}</h3></Link><span className="source-label">{capitalize(communication.source || 'note')}</span></div>{searchTerm && <p className="search-memory-preview">{matchPreview}{matchPreview.length >= 160 ? '...' : ''}</p>}{!searchTerm && <p>{communication.content?.slice(0, 150)}{communication.content?.length > 150 ? '...' : ''}</p>}{insight && (insight.summary || insight.actionItems?.length || insight.deadlines?.length || insight.peopleInvolved?.length) ? <div className="search-result-tags"><span>{insight.summary ? 'Summary' : 'Insight available'}</span>{insight.actionItems?.length ? <span>{insight.actionItems.length} action items</span> : null}{insight.deadlines?.length ? <span>{insight.deadlines.length} deadlines</span> : null}{insight.peopleInvolved?.length ? <span>{insight.peopleInvolved.length} people</span> : null}</div> : null}<div className="communication-meta"><span>{formatDate(communication.createdAt)}</span><span>{communication.participants?.length || 0} participants</span></div></div><div className="communication-actions"><Link className="text-button" to={`/communications/${getId(communication)}`}>Open →</Link><button className="text-button danger-text" type="button" onClick={() => handleDeleteCommunication(communication)}>Delete</button></div></article> })}</div>}</>}</section>{showForm && <Modal title="Add communication" onClose={() => setShowForm(false)}><CommunicationForm projectId={projectId} onSubmit={handleCommunicationSubmit} isSubmitting={isSubmitting} onCancel={() => setShowForm(false)} /></Modal>}</div>
}
