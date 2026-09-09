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
  return response.data.communication
}

export async function deleteCommunication(communicationId) {
  return api.delete(`/communications/${communicationId}`)
}
