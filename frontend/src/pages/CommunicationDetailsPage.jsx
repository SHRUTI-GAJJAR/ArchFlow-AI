import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Modal from '../components/Modal'
import CommunicationForm from '../components/CommunicationForm'
import InsightPanel from '../components/InsightPanel'
import { ErrorMessage, LoadingState, SuccessMessage } from '../components/UiStates'
import { getApiErrorMessage } from '../services/api'
import { getCommunication, updateCommunication, deleteCommunication } from '../services/communicationService'
import { analyzeCommunication, getCommunicationInsight } from '../services/aiService'
import { capitalize, formatDate, getId } from '../utils/formatters'

export default function CommunicationDetailsPage() {
  const { communicationId } = useParams(); const navigate = useNavigate()
  const [communication, setCommunication] = useState(null); const [insight, setInsight] = useState(null); const [isLoading, setIsLoading] = useState(true); const [isAnalyzing, setIsAnalyzing] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [showEdit, setShowEdit] = useState(false); const [isSaving, setIsSaving] = useState(false); const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => { loadData() }, [communicationId])
  async function loadData() { setIsLoading(true); setError(''); try { const communicationData = await getCommunication(communicationId); setCommunication(communicationData); try { setInsight(await getCommunicationInsight(communicationId)) } catch (insightError) { if (insightError.response?.status !== 404) throw insightError } } catch (requestError) { setError(getApiErrorMessage(requestError)) } finally { setIsLoading(false) } }
  async function handleAnalyze() { setIsAnalyzing(true); setError(''); setSuccess(''); try { setInsight(await analyzeCommunication(communicationId)); setSuccess('AI analysis completed successfully.') } catch (requestError) { setError(getApiErrorMessage(requestError)) } finally { setIsAnalyzing(false) } }
  async function handleUpdate(data) { setIsSaving(true); setError(''); try { setCommunication(await updateCommunication(communicationId, data)); setShowEdit(false); setSuccess('Communication updated successfully.') } catch (requestError) { setError(getApiErrorMessage(requestError)) } finally { setIsSaving(false) } }
  async function handleDelete() { if (!window.confirm(`Delete ${communication.title}?`)) return; if (isDeleting) return; setIsDeleting(true); try { await deleteCommunication(communicationId); navigate(`/projects/${getId(communication.project)}`) } catch (requestError) { setError(getApiErrorMessage(requestError)) } finally { setIsDeleting(false) } }

  if (isLoading) return <div className="content-container"><LoadingState label="Loading communication..." /></div>
  if (error && !communication) return <div className="content-container"><ErrorMessage message={error} onRetry={loadData} /></div>
  if (!communication) return null
  const projectId = getId(communication.project)

  return <div className="content-container"><Link className="back-link" to={`/projects/${projectId}`}>← Back to project</Link><div className="communication-detail-heading"><div><span className={`source-label source-label-${communication.source}`}>{capitalize(communication.source || 'note')}</span><h1>{communication.title}</h1><p className="page-subtitle">Captured {formatDate(communication.createdAt)}</p></div><div className="heading-actions"><button className="button button-danger-ghost" type="button" onClick={handleDelete}>Delete</button><button className="button button-ghost" type="button" onClick={() => setShowEdit(true)}>Edit</button><button className="button button-primary" type="button" onClick={handleAnalyze} disabled={isAnalyzing}>{isAnalyzing ? 'Analyzing...' : insight ? 'Re-analyze with AI' : 'Analyze with AI'}</button></div></div><SuccessMessage message={success} />{error && <ErrorMessage message={error} />}<div className="communication-detail-grid"><article className="source-content-card"><div className="section-heading-row"><h2>Original communication</h2><span>{communication.participants?.length || 0} participants</span></div>{communication.participants?.length > 0 && <div className="participant-row">{communication.participants.map((participant) => <span className="person-chip" key={participant}>{participant}</span>)}</div>}<div className="full-content">{communication.content}</div></article><aside className="analysis-callout"><span className="analysis-icon">✦</span><h3>{insight ? 'Intelligence extracted' : 'Ready to find what matters?'}</h3><p>{insight ? 'Review the structured insight below and keep your team aligned.' : 'ArchFlow AI can turn this conversation into decisions, owners, and deadlines.'}</p>{!insight && <button className="button button-primary button-full" type="button" onClick={handleAnalyze} disabled={isAnalyzing}>{isAnalyzing ? 'Analyzing communication...' : 'Analyze with AI'}</button>}</aside></div>{insight && <InsightPanel insight={insight} />}{showEdit && <Modal title="Edit communication" onClose={() => setShowEdit(false)}><CommunicationForm communication={communication} onSubmit={handleUpdate} isSubmitting={isSaving} onCancel={() => setShowEdit(false)} /></Modal>}</div>
}
