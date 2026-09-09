import { useEffect, useState } from 'react'

const emptyProject = { name: '', clientName: '', description: '', status: 'planning' }

export default function ProjectForm({ project, onSubmit, isSubmitting, onCancel }) {
  const [formData, setFormData] = useState(project || emptyProject)

  useEffect(() => {
    setFormData(project || emptyProject)
  }, [project])

  function handleChange(event) {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(formData)
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label className="field-label">Project name<input name="name" value={formData.name} onChange={handleChange} placeholder="Riverside Residence" required /></label>
      <label className="field-label">Client name<input name="clientName" value={formData.clientName} onChange={handleChange} placeholder="Client or organization" /></label>
      <label className="field-label">Status<select name="status" value={formData.status} onChange={handleChange}><option value="planning">Planning</option><option value="active">Active</option><option value="completed">Completed</option><option value="on-hold">On hold</option></select></label>
      <label className="field-label">Description<textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="What is this project about?" /></label>
      <div className="form-actions"><button className="button button-ghost" type="button" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : project ? 'Save changes' : 'Create project'}</button></div>
    </form>
  )
}
