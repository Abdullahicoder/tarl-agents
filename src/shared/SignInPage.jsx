import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './auth'

export default function SignInPage() {
  const { signIn, isFirebaseConfigured, demoMode } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError(null)

    try {
      await signIn(email.trim(), password)
      navigate('/teacher', { replace: true })
    } catch {
      setError('That email and password did not match.')
    } finally {
      setBusy(false)
    }
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
          <h1 className="text-xl font-bold">Teacher sign in</h1>

          {demoMode ? (
            <div className="mt-4 rounded-lg border border-lemon-ink/25 bg-lemon-tile/60 p-3 text-sm text-lemon-ink">
              Demo mode is enabled. You can open the teacher dashboard without
              Firebase authentication.
            </div>
          ) : !isFirebaseConfigured ? (
            <div className="mt-4 rounded-lg border border-lemon-ink/25 bg-lemon-tile/60 p-3 text-sm text-lemon-ink">
              Firebase is not configured. Add your Firebase web configuration to
              <code className="mx-1 rounded bg-page px-1">.env.local</code>
              and restart the development server.
            </div>
          ) : (
            <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold">Email</span>

                <input
                  type="email"
                  required
                  autoComplete="username"
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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
                className="rounded-lg bg-sky-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? 'Signing in…' : 'Sign in'}
              </button>

              <Link
                to="/signup"
                className="text-center text-sm font-semibold text-sky-ink hover:underline"
              >
                Create a teacher account
              </Link>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-ink-soft">
          Are you a learner?{' '}
          <Link
            to="/student"
            className="font-semibold text-sky-ink hover:underline"
          >
            Open the learning app
          </Link>
        </p>
      </div>
    </div>
  )
}
