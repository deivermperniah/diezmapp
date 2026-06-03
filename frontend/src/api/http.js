const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/_/backend/api' : 'http://localhost:3000/api')

const buildUrl = (path) => `${API_BASE_URL}${path}`

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'No se pudo completar la solicitud.')
  }

  return payload.data
}

export const api = {
  get: (path) => apiRequest(path),
  post: (path, data) =>
    apiRequest(path, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: (path, data) =>
    apiRequest(path, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (path) =>
    apiRequest(path, {
      method: 'DELETE',
    }),
}
