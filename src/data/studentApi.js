/**
 * HTTP client for the student-safe backend surface.
 *
 * ────────────────────────────────────────────────────────────────────────
 * CONFIRM THESE THREE PATHS AGAINST `deploy/student_api.py` BEFORE RUNNING.
 * They are written to the flow specified in the implementation handoff:
 *
 *     class-scoped roster (safe fields only)
 *       -> POST /student/session
 *       -> short-lived student session token
 *       -> GET  /student/me
 *
 * If the server names them differently, change ROUTES here and nothing else.
 * ────────────────────────────────────────────────────────────────────────
 *
 * Why a session token and not a Firebase account per child: a six-year-old
 * cannot hold a credential, and the roster must never be a public dump of the
 * student table. The server returns only { id, name, avatar } for one class,
 * and the session token it mints is the only thing that can read a record.
 */

const ROUTES = {
  roster: (classId) => `/student/classes/${encodeURIComponent(classId)}/roster`,
  session: '/student/session',
  me: '/student/me',
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(
  /\/$/,
  '',
)

/** The class this device belongs to. One tablet serves one classroom. */
export const CLASS_ID = import.meta.env.VITE_CLASS_ID ?? 'c1'

/**
 * The session token lives in memory only.
 *
 * Deliberately NOT localStorage: it is short-lived, and persisting it would
 * silently re-enter the last child's account when the next child picks up the
 * tablet — which is the "learner randomly assigned to a student" bug.
 */
let sessionToken = null

export function getSessionToken() {
  return sessionToken
}

export function clearSession() {
  sessionToken = null
}

export class StudentApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'StudentApiError'
    this.status = status
  }
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    if (!sessionToken) throw new StudentApiError('No student session', 401)
    headers.Authorization = `Bearer ${sessionToken}`
  }

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new StudentApiError('offline', 0)
  }

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    if (response.status === 401) clearSession()
    throw new StudentApiError(payload?.detail ?? `HTTP ${response.status}`, response.status)
  }
  return payload
}

/** Safe fields only: id, name, avatar. No levels, no history, no other class. */
export function fetchRoster(classId = CLASS_ID) {
  return request(ROUTES.roster(classId))
}

/** Exchanges a picture tap for a short-lived session scoped to that child. */
export async function openSession(studentId, classId = CLASS_ID) {
  const result = await request(ROUTES.session, {
    method: 'POST',
    body: { class_id: classId, student_id: studentId },
  })
  sessionToken = result.session_token ?? result.token ?? null
  return result
}

/** The signed-in child's own record. Never another child's. */
export function fetchMe() {
  return request(ROUTES.me, { auth: true })
}
