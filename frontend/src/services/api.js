import axios from 'axios'

// In dev, fall back to the local backend. Without this, a missing VITE_API_URL
// silently sends dev traffic to production, so local backend changes can never
// be tested. Production builds keep using the configured URL.
const DEV_API_URL = 'http://localhost:5500/api'

const baseURL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? DEV_API_URL : undefined)

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Analyze can make up to 3 provider attempts plus backoff, so the default
  // (no timeout) could leave the button spinning indefinitely if the
  // request hung. 60s clears the worst case with room to spare.
  timeout: 60000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('archflow_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export function getApiErrorMessage(error) {
  const data = error.response?.data

  // Only trust `message` when the response really is JSON. An older
  // backend (or a proxy) can answer with an HTML error page, where `data`
  // is a string and `.message` is undefined - which previously surfaced
  // the raw "Request failed with status code 404".
  if (data && typeof data === 'object' && data.message) {
    return data.message
  }

  if (error.response?.status === 404) {
    return 'Not found. This usually means the backend needs redeploying.'
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'The request timed out. The server took too long to respond.'
  }

  if (error.code === 'ERR_NETWORK' || !error.response) {
    return 'Cannot reach the server. Check that the backend is running.'
  }

  return error.message || 'Something went wrong. Please try again.'
}

export default api
