/**
 * Student data-access seam.
 *
 * Every screen talks to the backend ONLY through this module. Today it is
 * backed by mock curriculum data plus localStorage. Each function documents
 * the backend contract it will be replaced by, so swapping in Firebase Auth +
 * Cloud Run requires no change to presentational components.
 *
 * NOTE: nothing here is a security boundary. Role and ownership checks are
 * enforced server-side (Firebase ID token -> role -> resource relationship).
 */

import {
  literacyItemsFor,
  numeracyItemsFor,
  storyItems,
  writingItems,
} from './curriculum'

const STORAGE_KEY = 'tarl.student.v1'

/** Demo roster. Replaced by: Firebase Auth session -> GET /students/me */
const DEMO_STUDENTS = [
  { id: 'stu_amina', name: 'Amina', avatar: 'amina', grade: 2 },
  { id: 'stu_juma', name: 'Juma', avatar: 'juma', grade: 2 },
  { id: 'stu_neema', name: 'Neema', avatar: 'neema', grade: 3 },
  { id: 'stu_baraka', name: 'Baraka', avatar: 'baraka', grade: 1 },
]

const DEFAULT_STATE = {
  studentId: null,
  lang: 'sw',
  stars: 0,
  starsToday: 0,
  dailyGoal: 10,
  streak: 1,
  levels: { literacy: 'WORD', numeracy: 'ONE_DIGIT' },
  history: [],
}

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

function write(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* private mode / storage disabled — the session still works in memory */
  }
  return state
}

/* ---------------------------------------------------------------- */

/** Replaced by: Firebase Auth (anonymous or class-code sign-in). */
export function listStudents() {
  return DEMO_STUDENTS
}

/** Replaced by: GET /students/me  -> { profile, levels, progress } */
export function loadSession() {
  const state = read()
  const student = DEMO_STUDENTS.find((s) => s.id === state.studentId) ?? null
  return { ...state, student }
}

export function signIn(studentId) {
  const state = read()
  return write({ ...state, studentId })
}

export function signOut() {
  const state = read()
  return write({ ...state, studentId: null })
}

export function setLanguage(lang) {
  return write({ ...read(), lang })
}

/**
 * Replaced by: POST /tutor/next-activity { studentId, subject }
 * The server picks items from the learner's deterministic TaRL level.
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
 * Replaced by: POST /progress/answer { studentId, itemId, correct, ms }
 * Server persists to Firestore and returns updated progress + level.
 */
export function recordAnswer({ subject, correct }) {
  const state = read()
  const gain = correct ? 1 : 0
  return write({
    ...state,
    stars: state.stars + gain,
    starsToday: state.starsToday + gain,
    history: [
      { subject, correct, at: Date.now() },
      ...state.history,
    ].slice(0, 100),
  })
}

export function resetProgress() {
  const state = read()
  return write({ ...state, stars: 0, starsToday: 0, history: [] })
}
