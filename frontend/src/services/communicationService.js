import api from './api'

export async function getProjectCommunications(projectId) {
  const response = await api.get(`/communications/project/${projectId}`)
  return response.data.communications || []
}

export async function getCommunication(communicationId) {
  const response = await api.get(`/communications/${communicationId}`)
  return response.data.communication
}

export async function createCommunication(communicationData) {
  const response = await api.post('/communications', communicationData)
  return response.data.communication
}

export async function updateCommunication(communicationId, communicationData) {
  const response = await api.patch(`/communications/${communicationId}`, communicationData)

  // Attach the invalidation flag so callers can refresh stale insights.
  return {
    ...response.data.communication,
    insightInvalidated: Boolean(response.data.insightInvalidated),
  }
}

export async function deleteCommunication(communicationId) {
  return api.delete(`/communications/${communicationId}`)
}
