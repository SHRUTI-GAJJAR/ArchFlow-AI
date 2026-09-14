import { useEffect, useRef, useState } from 'react'
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
  const loadRequestRef = useRef(0)
  const analyzeRequestRef = useRef(0)
  const saveRequestRef = useRef(0)
  const deleteRequestRef = useRef(0)

  useEffect(() => {
    loadData()
    return () => {
      loadRequestRef.current += 1
      analyzeRequestRef.current += 1
      saveRequestRef.current += 1
      deleteRequestRef.current += 1
    }
  }, [communicationId])
  async function loadData() {
    const requestId = ++loadRequestRef.current
    setIsLoading(true)
    setError('')
    try {
      const communicationData = await getCommunication(communicationId)
      if (requestId !== loadRequestRef.current) return
      setCommunication(communicationData)
      try {
        const insightData = await getCommunicationInsight(communicationId)
        if (requestId === loadRequestRef.current) setInsight(insightData)
      } catch (insightError) {
        if (insightError.response?.status !== 404) throw insightError
        if (requestId === loadRequestRef.current) setInsight(null)
      }
    } catch (requestError) {
      if (requestId === loadRequestRef.current) setError(getApiErrorMessage(requestError))
    } finally {
      if (requestId === loadRequestRef.current) setIsLoading(false)
    }
  }
  async function handleAnalyze() {
    if (isAnalyzing) return
    const requestId = ++analyzeRequestRef.current
    setIsAnalyzing(true)
    setError('')
    setSuccess('')
    try {
      const insightData = await analyzeCommunication(communicationId)
      if (requestId !== analyzeRequestRef.current) return
      setInsight(insightData)
      setSuccess('AI analysis completed successfully.')
    } catch (requestError) {
      if (requestId === analyzeRequestRef.current) setError(getApiErrorMessage(requestError))
    } finally {
      if (requestId === analyzeRequestRef.current) setIsAnalyzing(false)
    }
  }
  async function handleUpdate(data) {
    const requestId = ++saveRequestRef.current
    setIsSaving(true)
    setError('')
    try {
      const updated = await updateCommunication(communicationId, data)
      if (requestId !== saveRequestRef.current) return
      setCommunication(updated)
      setShowEdit(false)
      setSuccess('Communication updated successfully.')
    } catch (requestError) {
      if (requestId === saveRequestRef.current) setError(getApiErrorMessage(requestError))
    } finally {
      if (requestId === saveRequestRef.current) setIsSaving(false)
    }
  }
  async function handleDelete() {
    if (isDeleting) return
    if (!window.confirm(`Delete ${communication.title}?`)) return
    const requestId = ++deleteRequestRef.current
    setIsDeleting(true)
    try {
      await deleteCommunication(communicationId)
      if (requestId !== deleteRequestRef.current) return
      navigate(`/projects/${getId(communication.project)}`)
    } catch (requestError) {
      if (requestId === deleteRequestRef.current) setError(getApiErrorMessage(requestError))
    } finally {
      if (requestId === deleteRequestRef.current) setIsDeleting(false)
    }
  }

  if (isLoading) return <div className="content-container"><LoadingState label="Loading communication..." /></div>
  if (error && !communication) return <div className="content-container"><ErrorMessage message={error} onRetry={loadData} /></div>
  if (!communication) return null
  const projectId = getId(communication.project)

  return <div className="content-container"><Link className="back-link" to={`/projects/${projectId}`}>← Back to project</Link><div className="communication-detail-heading"><div><span className={`source-label source-label-${communication.source}`}>{capitalize(communication.source || 'note')}</span><h1>{communication.title}</h1><p className="page-subtitle">Captured {formatDate(communication.createdAt)}</p></div><div className="heading-actions"><button className="button button-danger-ghost" type="button" disabled={isDeleting} onClick={handleDelete}>{isDeleting ? 'Deleting...' : 'Delete'}</button><button className="button button-ghost" type="button" onClick={() => setShowEdit(true)}>Edit</button><button className="button button-primary" type="button" onClick={handleAnalyze} disabled={isAnalyzing}>{isAnalyzing ? 'Analyzing...' : insight ? 'Re-analyze with AI' : 'Analyze with AI'}</button></div></div><SuccessMessage message={success} />{error && <ErrorMessage message={error} />}<div className="communication-detail-grid"><article className="source-content-card"><div className="section-heading-row"><h2>Original communication</h2><span>{communication.participants?.length || 0} participants</span></div>{communication.participants?.length > 0 && <div className="participant-row">{communication.participants.map((participant) => <span className="person-chip" key={participant}>{participant}</span>)}</div>}<div className="full-content">{communication.content}</div></article><aside className="analysis-callout"><span className="analysis-icon">✦</span><h3>{insight ? 'AI analysis' : 'Analyze this communication'}</h3><p>{insight ? 'Key information extracted from this communication.' : 'Extract decisions, action items, deadlines, and people involved.'}</p>{!insight && <button className="button button-primary button-full" type="button" onClick={handleAnalyze} disabled={isAnalyzing}>{isAnalyzing ? 'Analyzing communication...' : 'Analyze with AI'}</button>}</aside></div>{insight && <InsightPanel insight={insight} />}{showEdit && <Modal title="Edit communication" onClose={() => setShowEdit(false)}><CommunicationForm communication={communication} onSubmit={handleUpdate} isSubmitting={isSaving} onCancel={() => setShowEdit(false)} /></Modal>}</div>
}
