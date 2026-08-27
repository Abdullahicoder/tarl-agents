/**
 * Thin fetch wrapper for the FastAPI backend on Cloud Run.
 *
 * Responsibilities: attach the Firebase ID token, JSON-encode, and turn every
 * failure into an ApiError with a message a teacher can act on. It deliberately
 * knows nothing about routes — those live in `src/teacher/api.js`.
 */

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
).replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, { status, detail } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

function friendlyMessage(status, detail) {
  if (status === 401) return 'Your session expired. Sign in again to continue.'
  if (status === 403) return 'Your account does not have teacher access.'
  if (status === 404) return 'Not found, or not one of your classes.'
  if (status === 422) return detail || 'Some of those details were not valid.'
  if (status === 503) return detail || 'The AI service is unavailable right now.'
  if (status >= 500) return 'The server had a problem. Try again in a moment.'
  return detail || `Request failed (${status}).`
}

/** `getToken` is injected so this module never imports Firebase. */
export function createApiClient(getToken) {
  return async function request(path, { method = 'GET', body, query } = {}) {
    const url = new URL(`${API_BASE_URL}${path}`)
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) url.searchParams.set(key, value)
      }
    }

    const token = await getToken()
    const headers = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    if (body !== undefined) headers['Content-Type'] = 'application/json'

    let response
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    } catch {
      throw new ApiError('Could not reach the server. Check your connection.')
    }

    if (response.status === 204) return null

    const text = await response.text()
    let payload = null
    try {
      payload = text ? JSON.parse(text) : null
    } catch {
      payload = null
    }

    if (!response.ok) {
      const detail =
        typeof payload?.detail === 'string'
          ? payload.detail
          : Array.isArray(payload?.detail)
            ? payload.detail.map((d) => d.msg).join('; ')
            : null
      throw new ApiError(friendlyMessage(response.status, detail), {
        status: response.status,
        detail,
      })
    }

    return payload
  }
}
