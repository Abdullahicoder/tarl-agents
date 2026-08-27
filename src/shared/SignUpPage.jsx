import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from './firebase'
import { DEMO_MODE } from './demoMode'

export default function SignUpPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const auth = getFirebaseAuth()

    if (!auth) {
      setError('Firebase is not configured.')
      return
    }

    setBusy(true)

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      )

      if (name.trim()) {
        await updateProfile(credential.user, {
          displayName: name.trim(),
        })
      }

      /*
       * IMPORTANT:
       * New accounts do NOT receive the teacher role here.
       * Roles are assigned by trusted backend/admin tooling.
       */
      navigate('/signin', {
        replace: true,
        state: {
          message:
            'Account created. An administrator must grant teacher access before you can use the teacher dashboard.',
        },
      })
    } catch (err) {
      if (err?.code === 'auth/email-already-in-use') {
        setError('That email is already registered.')
      } else if (err?.code === 'auth/weak-password') {
        setError('Please choose a stronger password.')
      } else {
        setError('We could not create your account. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  if (DEMO_MODE) {
    return (
      <div className="grid min-h-full place-items-center bg-page px-4 py-12 font-ui">
        <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-stage p-6">
          <h1 className="text-xl font-bold">Demo Mode</h1>

          <p className="mt-3 text-sm text-ink-soft">
            Account creation is disabled in demo mode. Use the demo teacher
            account to explore the Teacher Frontend.
          </p>

          <Link
            to="/teacher"
            className="mt-5 block rounded-lg bg-sky-ink px-4 py-2.5 text-center text-sm font-semibold text-white"
          >
            Open Teacher Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="grid min-h-full place-items-center bg-page px-4 py-12 font-ui">
        <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-stage p-6">
          <h1 className="text-xl font-bold">Create account</h1>

          <p className="mt-3 rounded-lg border border-lemon-ink/25 bg-lemon-tile/60 p-3 text-sm text-lemon-ink">
            Firebase is not configured. Add the Firebase configuration to
            <code className="mx-1 rounded bg-page px-1">.env.local</code>
            first.
          </p>

          <Link
            to="/signin"
            className="mt-5 block text-center text-sm font-semibold text-sky-ink hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-full place-items-center bg-page px-4 py-12 font-ui">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-ink font-bold text-white">
            Ta
          </span>

          <div className="leading-tight">
            <p className="font-bold">TaRL Classroom</p>
            <p className="text-xs text-ink-soft">Teach at the right level</p>
          </div>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-stage p-6">
          <h1 className="text-xl font-bold">Create your account</h1>

          <p className="mt-2 text-sm text-ink-soft">
            Create an account first. Teacher access is granted separately by an
            administrator.
          </p>

          <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Name</span>

              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-sky-ink focus:ring-2 focus:ring-sky-ink/20"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Email</span>

              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-sky-ink focus:ring-2 focus:ring-sky-ink/20"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Password</span>

              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-sky-ink focus:ring-2 focus:ring-sky-ink/20"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Confirm password</span>

              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-sky-ink focus:ring-2 focus:ring-sky-ink/20"
              />
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-blush-ink/20 bg-blush-tile p-3 text-sm font-semibold text-blush-ink"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-sky-ink px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'Creating account…' : 'Create account'}
            </button>

            <Link
              to="/signin"
              className="text-center text-sm font-semibold text-sky-ink hover:underline"
            >
              Already have an account? Sign in
            </Link>
          </form>
        </div>
      </div>
    </div>
  )
}
