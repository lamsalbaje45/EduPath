/**
 * API Client - Fetch wrapper with auth & error handling
 * Reads base URL from import.meta.env.VITE_API_URL
 * Attaches Authorization header from localStorage if token exists
 * Parses responses following backend's envelope: { success, message, data?, meta?, errors? }
 */

const getBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
}

// Uploaded files (e.g. profile pictures) are served from the API server's
// origin but outside the /api prefix, so relative paths like
// "/uploads/profiles/.." need that origin prepended to resolve correctly.
export const getAssetUrl = (path) => {
  if (!path) return path
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path
  const origin = getBaseUrl().replace(/\/api\/?$/, '')
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

const getToken = () => {
  try {
    return localStorage.getItem('edupath_token')
  } catch {
    return null
  }
}

const normalizeError = (response, data) => {
  const error = {
    status: response.status,
    message: data?.message || response.statusText || 'An error occurred',
  }
  if (data?.errors) {
    error.errors = data.errors
  }
  return error
}

const request = async (endpoint, options = {}) => {
  const url = `${getBaseUrl()}${endpoint}`
  const token = getToken()
  const isFormData = options.body instanceof FormData

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  let data
  try {
    data = await response.json()
  } catch {
    data = { message: response.statusText }
  }
  
  if (!response.ok) {
    throw normalizeError(response, data)
  }
  
  return data
}

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  del: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
}

export default apiClient
