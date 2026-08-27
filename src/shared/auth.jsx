import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from './firebase'
import { DEMO_MODE, DEMO_USER } from './demoMode'

const AuthContext = createContext(null)

const EMPTY = {
  user: null,
  role: null,
  status: 'loading',
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(EMPTY)

  useEffect(() => {
    if (DEMO_MODE) {
      setState({
        user: DEMO_USER,
        role: 'teacher',
        status: 'signed-in',
      })
      return undefined
    }

    const auth = getFirebaseAuth()

    if (!auth) {
      setState({
        user: null,
        role: null,
        status: 'unconfigured',
      })
      return undefined
    }

    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({
          user: null,
          role: null,
          status: 'signed-out',
        })
        return
      }

      try {
        const token = await user.getIdTokenResult(true)

        console.log('[TaRL Auth] UID:', user.uid)
        console.log('[TaRL Auth] Email:', user.email)
        console.log('[TaRL Auth] Claims:', token.claims)
        console.log('[TaRL Auth] Role:', token.claims.role)

        setState({
          user: {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
          },
          role: token.claims.role ?? 'student',
          status: 'signed-in',
        })
      } catch {
        setState({
          user: null,
          role: null,
          status: 'signed-out',
        })
      }
    })
  }, [])

  const signIn = useCallback(async (email, password) => {
    if (DEMO_MODE) return

    const auth = getFirebaseAuth()

    if (!auth) {
      throw new Error('Firebase is not configured — see .env.example')
    }

    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const signOut = useCallback(async () => {
    if (DEMO_MODE) {
      setState({
        user: DEMO_USER,
        role: 'teacher',
        status: 'signed-in',
      })
      return
    }

    const auth = getFirebaseAuth()

    if (auth) {
      await fbSignOut(auth)
    }
  }, [])

  const getToken = useCallback(async () => {
    if (DEMO_MODE) return null

    const auth = getFirebaseAuth()

    return auth?.currentUser
      ? auth.currentUser.getIdToken()
      : null
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      isFirebaseConfigured,
      demoMode: DEMO_MODE,
      signIn,
      signOut,
      getToken,
    }),
    [state, signIn, signOut, getToken],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }

  return context
}
