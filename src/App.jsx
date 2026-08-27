import { useCallback, useEffect, useMemo, useState } from 'react'
import HeaderBar from './components/layout/HeaderBar'
import NavigationDock from './components/layout/NavigationDock'
import SignInScreen from './components/screens/SignInScreen'
import HomeScreen from './components/screens/HomeScreen'
import ActivityScreen from './components/screens/ActivityScreen'
import RewardsScreen from './components/screens/RewardsScreen'
import { makeT } from './data/i18n'
import { useSpeech } from './hooks/useSpeech'
import * as api from './data/api'

const SUBJECTS = ['LITERACY', 'NUMERACY', 'STORIES', 'WRITING']

/**
 * Student application root.
 *
 * Routing is a small local state machine rather than a router: the learner
 * never types a URL and the app must keep working when the connection drops.
 *
 * Session rule: the app ALWAYS starts at the picker. No student is selected
 * from storage, so the next child to pick up the tablet is never dropped into
 * the previous child's account. Back from Home clears the session and returns
 * to the picker; Back inside an activity returns to Home.
 */
export default function StudentApp() {
  const [lang, setLang] = useState(() => api.getLanguage())
  const [roster, setRoster] = useState(null)
  const [rosterError, setRosterError] = useState(null)
  const [session, setSession] = useState(null)
  const [signingIn, setSigningIn] = useState(false)
  const [signInError, setSignInError] = useState(null)
  const [screen, setScreen] = useState('HOME')
  const [stars, setStars] = useState(0)

  const t = useMemo(() => makeT(lang), [lang])
  const { speak, repeat } = useSpeech(lang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Roster loads once per app start, for this device's class only.
  useEffect(() => {
    let cancelled = false
    setRosterError(null)
    api
      .listStudents()
      .then((list) => {
        if (!cancelled) setRoster(list)
      })
      .catch((error) => {
        if (!cancelled) setRosterError(error)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const items = useMemo(() => {
    if (!session || !SUBJECTS.includes(screen)) return []
    return api.nextRound(screen, session.levels, lang)
  }, [screen, session, lang])

  const handleLanguage = useCallback((next) => {
    api.setLanguage(next)
    setLang(next)
  }, [])

  const handlePick = useCallback(async (studentId) => {
    setSigningIn(true)
    setSignInError(null)
    try {
      const me = await api.signIn(studentId)
      setSession(me)
      setStars(me.stars ?? 0)
      setScreen('HOME')
    } catch (error) {
      setSignInError(error)
    } finally {
      setSigningIn(false)
    }
  }, [])

  /** Back from Home: end the session and return to the picker. */
  const handleLeave = useCallback(() => {
    api.signOut()
    setSession(null)
    setStars(0)
    setScreen('HOME')
  }, [])

  const handleAnswer = useCallback((payload) => {
    if (payload.correct) setStars((n) => n + 1)
    // Fire-and-forget: a dropped answer must not interrupt a child mid-lesson.
    // Until POST /student/answers exists this is a no-op — see api.js.
    api.recordAnswer(payload).catch(() => {})
  }, [])

  if (!session) {
    return (
      <SignInScreen
        students={roster ?? []}
        loading={roster === null && !rosterError}
        error={rosterError ?? signInError}
        busy={signingIn}
        lang={lang}
        t={t}
        onLanguageChange={handleLanguage}
        onPick={handlePick}
      />
    )
  }

  const inActivity = SUBJECTS.includes(screen)

  return (
    <div className="flex min-h-full flex-col">
      <HeaderBar
        student={inActivity ? null : session.student}
        stars={stars}
        lang={lang}
        onLanguageChange={handleLanguage}
        onRepeatAudio={inActivity ? repeat : undefined}
        onBack={inActivity ? () => setScreen('HOME') : handleLeave}
        backLabel={inActivity ? t('back') : t('whoIsLearning')}
        title={inActivity ? t(screen === 'WRITING' ? 'writing' : screen.toLowerCase()) : null}
      />

      <main className="flex-1">
        {screen === 'HOME' && (
          <HomeScreen
            student={session.student}
            levels={session.levels}
            starsToday={stars}
            dailyGoal={session.dailyGoal ?? 10}
            lang={lang}
            t={t}
            onOpen={setScreen}
          />
        )}

        {inActivity && (
          <ActivityScreen
            key={screen}
            subject={screen}
            items={items}
            lang={lang}
            t={t}
            speak={speak}
            onAnswer={handleAnswer}
            onExit={() => setScreen('HOME')}
          />
        )}

        {screen === 'REWARDS' && <RewardsScreen stars={stars} lang={lang} t={t} />}
      </main>

      <NavigationDock
        active={screen}
        t={t}
        onNavigate={(id) => setScreen(id === 'HOME' ? 'HOME' : id)}
      />
    </div>
  )
}
