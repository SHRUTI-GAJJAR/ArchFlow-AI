import api from './api'

export async function getProjects() {
  const response = await api.get('/projects')
  return response.data.projects || []
}

export async function getProject(projectId) {
  const response = await api.get(`/projects/${projectId}`)
  return response.data.project
}

export async function createProject(projectData) {
  const response = await api.post('/projects', projectData)
  return response.data.project
}

export async function updateProject(projectId, projectData) {
  const response = await api.patch(`/projects/${projectId}`, projectData)
  return response.data.project
}

export async function deleteProject(projectId) {
  return api.delete(`/projects/${projectId}`)
}
