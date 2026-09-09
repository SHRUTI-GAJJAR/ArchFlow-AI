import { useEffect, useState } from 'react'

const emptyCommunication = { title: '', source: 'meeting', content: '', participants: '' }

export default function CommunicationForm({ communication, projectId, onSubmit, isSubmitting, onCancel }) {
  const [formData, setFormData] = useState(communication ? { ...communication, participants: communication.participants?.join(', ') || '' } : emptyCommunication)

  useEffect(() => {
    setFormData(communication ? { ...communication, participants: communication.participants?.join(', ') || '' } : emptyCommunication)
  }, [communication])

  function handleChange(event) {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({
      ...(communication ? {} : { project: projectId }),
      title: formData.title,
      source: formData.source,
      content: formData.content,
      participants: formData.participants.split(',').map((person) => person.trim()).filter(Boolean),
    })
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label className="field-label">Title<input name="title" value={formData.title} onChange={handleChange} placeholder="Weekly client alignment" required /></label>
      <label className="field-label">Source<select name="source" value={formData.source} onChange={handleChange}><option value="meeting">Meeting</option><option value="email">Email</option><option value="chat">Chat</option><option value="note">Note</option></select></label>
      <label className="field-label">Participants <span className="field-hint">Separate names with commas</span><input name="participants" value={formData.participants} onChange={handleChange} placeholder="Client, Architect, Supplier" /></label>
      <label className="field-label">Communication content<textarea name="content" value={formData.content} onChange={handleChange} rows="8" placeholder="Paste the meeting notes, email, or conversation here..." required /></label>
      <div className="form-actions"><button className="button button-ghost" type="button" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : communication ? 'Save changes' : 'Add communication'}</button></div>
    </form>
  )
}
