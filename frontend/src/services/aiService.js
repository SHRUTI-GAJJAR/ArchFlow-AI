import api from './api'

export async function analyzeCommunication(communicationId) {
  const response = await api.post(`/ai/analyze/${communicationId}`)
  return response.data.insight
}

export async function getCommunicationInsight(communicationId) {
  const response = await api.get(`/ai/insight/${communicationId}`)
  return response.data.insight
}

// Fetches insights for many communications in a single request.
// Replaces the previous per-communication N+1 request pattern.
export async function getCommunicationInsights(communicationIds) {
  if (!communicationIds || communicationIds.length === 0) return {}

  try {
    const response = await api.post('/ai/insights/batch', { communicationIds })
    return response.data.insights || {}
  } catch (error) {
    // The batch endpoint is newer than some deployed backends. During a
    // deploy window the route 404s (as an HTML response from Express's
    // default handler), so fall back to per-communication requests rather
    // than failing the whole page. The fallback keeps search and the
    // insight tags working until the backend is updated.
    if (error.response?.status !== 404) throw error

    return getInsightsIndividually(communicationIds)
  }
}

// One request per communication, used only when the batch route is
// unavailable. Communications without a saved insight are omitted, which
// is exactly what the batch endpoint does.
async function getInsightsIndividually(communicationIds) {
  const entries = await Promise.all(
    communicationIds.map(async (id) => {
      try {
        const response = await api.get(`/ai/insight/${id}`)
        return [id, response.data.insight]
      } catch (error) {
        // 404 here means "no analysis saved yet", which is not a failure.
        if (error.response?.status === 404) return [id, null]
        throw error
      }
    })
  )

  return entries.reduce((map, [id, insight]) => {
    if (insight) map[id] = insight
    return map
  }, {})
}

// Aggregate counts used by the dashboard stat cards.
export async function getInsightSummary() {
  const response = await api.get('/ai/insights/summary')
  return response.data.summary || {}
}