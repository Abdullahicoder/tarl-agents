/**
 * Student data-access seam.
 *
 * Production path: Firestore is the single source of truth. The roster and the
 * learner's record come from `deploy/student_api.py` over the student session
 * flow in `studentApi.js`; they are the SAME `students/{id}` documents the
 * teacher app reads. There is no second student identity anywhere.
 *
 * Demo path: only when `VITE_DEMO_MODE === 'true'`. It exists so the UI can be
 * developed without a backend, and it is never reachable otherwise — the demo
 * roster below is not a fallback for a failed request. A failed request is an
 * error the learner is told about, because silently dropping into fake data is
 * how a teacher ends up looking at progress that was never recorded.
 *
 * NOTE: nothing here is a security boundary. Ownership is enforced server-side.
 */

import {
  literacyItemsFor,
  numeracyItemsFor,
  storyItems,
  writingItems,
} from './curriculum'
import * as remote from './studentApi'

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

const STORAGE_KEY = 'tarl.student.v1'

/**
 * Device-local preferences ONLY.
 *
 * The selected student is deliberately absent: the app must start at the
 * picker every time, so the next child to pick up the tablet is never dropped
 * into the previous child's account. Progress is not stored here either — it
 * belongs to Firestore.
 */
function readPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return { lang: parsed.lang === 'en' ? 'en' : 'sw' }
  } catch {
    return { lang: 'sw' }
  }
}

function writePrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    /* private mode — preferences just do not persist */
  }
  return prefs
}

export function getLanguage() {
  return readPrefs().lang
}

export function setLanguage(lang) {
  return writePrefs({ ...readPrefs(), lang }).lang
}

/* ------------------------------------------------------------------ */
/* Demo roster — VITE_DEMO_MODE only. Not a production fallback.       */
/* ------------------------------------------------------------------ */

const DEMO_ROSTER = [
  { id: 's1', name: 'Amina', avatar: 'amina' },
  { id: 's2', name: 'Kamau', avatar: 'kamau' },
  { id: 's3', name: 'Zainab', avatar: 'zainab' },
  { id: 's5', name: 'Neema', avatar: 'neema' },
]

const DEMO_RECORD = {
  s1: { levels: { literacy: 'LETTER', numeracy: 'ONE_DIGIT' } },
  s2: { levels: { literacy: 'WORD', numeracy: 'ADDITION' } },
  s3: { levels: { literacy: 'LETTER', numeracy: 'BEGINNER' } },
  s5: { levels: { literacy: 'BEGINNER', numeracy: 'TWO_DIGIT' } },
}

/* ------------------------------------------------------------------ */
/* Roster and session                                                  */
/* ------------------------------------------------------------------ */

/** Class-scoped, safe fields only. Never the whole student table. */
export async function listStudents() {
  if (DEMO_MODE) return DEMO_ROSTER
  const roster = await remote.fetchRoster()
  return roster.map((s) => ({ id: s.id, name: s.name, avatar: s.avatar ?? s.id }))
}

/**
 * Picture tap -> short-lived session -> that child's own record.
 * Returns the shape every screen consumes.
 */
export async function signIn(studentId) {
  if (DEMO_MODE) {
    const student = DEMO_ROSTER.find((s) => s.id === studentId)
    return {
      student,
      levels: DEMO_RECORD[studentId]?.levels ?? { literacy: 'BEGINNER', numeracy: 'BEGINNER' },
      stars: 0,
      starsToday: 0,
      dailyGoal: 10,
    }
  }

  await remote.openSession(studentId)
  return normalize(await remote.fetchMe())
}

/** Refresh the learner's own record after answers have been recorded. */
export async function loadMe() {
  if (DEMO_MODE) return null
  return normalize(await remote.fetchMe())
}

export function signOut() {
  remote.clearSession()
}

/**
 * Maps the server record onto the shape the screens expect.
 *
 * The server sends english/swahili literacy separately, because that is what
 * the deterministic engine produces. The learner app targets one instructional
 * language at a time, so it reads the level for the language in use.
 */
function normalize(me, lang = getLanguage()) {
  const student = me.student ?? me
  const literacy =
    lang === 'en'
      ? (student.english_literacy_level ?? student.literacy_level)
      : (student.swahili_literacy_level ?? student.literacy_level)

  return {
    student: { id: student.id, name: student.name, avatar: student.avatar ?? student.id },
    levels: {
      literacy: literacy ?? 'BEGINNER',
      numeracy: student.numeracy_level ?? 'BEGINNER',
    },
    stars: me.progress?.stars ?? 0,
    starsToday: me.progress?.stars_today ?? 0,
    dailyGoal: me.progress?.daily_goal ?? 10,
  }
}

/* ------------------------------------------------------------------ */
/* Activities and answers                                              */
/* ------------------------------------------------------------------ */

/**
 * Item selection is local because the curriculum is deterministic and the app
 * must work when the connection drops mid-lesson. The LEVEL it selects for is
 * always the verified one from Firestore — never chosen on the device.
 */
export function nextRound(subject, levels, lang = 'sw') {
  switch (subject) {
    case 'LITERACY':
      return literacyItemsFor(levels.literacy, lang)
    case 'NUMERACY':
      return numeracyItemsFor(levels.numeracy, lang)
    case 'STORIES':
      return storyItems(lang)
    case 'WRITING':
      return writingItems(lang)
    default:
      return []
  }
}

/**
 * TODO(backend): POST /student/answers with the session token, so evidence
 * reaches Firestore and the deterministic engine can use it. Until that route
 * exists, answers advance the on-screen star count only and are NOT evidence.
 * Do not present this count to a teacher as recorded progress.
 */
export async function recordAnswer({ subject, correct }) {
  if (DEMO_MODE) return { accepted: false, reason: 'demo' }
  return { accepted: false, reason: 'not-implemented', subject, correct }
}
