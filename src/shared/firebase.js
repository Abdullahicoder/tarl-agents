/**
 * Firebase app + auth singleton.
 *
 * Config comes from Vite env vars, which are PUBLIC by design — a Firebase web
 * API key identifies the project, it does not authorize anything. Access is
 * enforced by backend role checks and Firestore rules, never by hiding this.
 *
 * Set these in `.env.local` at the repository root (Vite reads the root, not
 * `frontend/`). See `.env.example`.
 */

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId)

let auth = null

export function getFirebaseAuth() {
  if (!isFirebaseConfigured) return null
  if (!auth) auth = getAuth(initializeApp(config))
  return auth
}
