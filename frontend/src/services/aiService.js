import api from './api'

export async function analyzeCommunication(communicationId) {
  const response = await api.post(`/ai/analyze/${communicationId}`)
  return response.data.insight
}

export async function getCommunicationInsight(communicationId) {
  const response = await api.get(`/ai/insight/${communicationId}`)
  return response.data.insight
}
