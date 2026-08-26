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
 * Routing is intentionally a small local state machine rather than a router:
 * the learner never types a URL, the app must work offline, and the teacher
 * and parent applications will be separate entry points (see CLAUDE.md §17).
 */
export default function StudentApp() {
  const [session, setSession] = useState(() => api.loadSession())
  const [screen, setScreen] = useState('HOME')

  const t = useMemo(() => makeT(session.lang), [session.lang])
  const { speak, repeat } = useSpeech(session.lang)

  const students = useMemo(() => api.listStudents(), [])

  const items = useMemo(() => {
    if (!SUBJECTS.includes(screen)) return []
    return api.nextRound(screen, session.levels, session.lang)
  }, [screen, session.levels])

  const refresh = useCallback(() => setSession(api.loadSession()), [])

  const handleAnswer = useCallback(
    (payload) => {
      api.recordAnswer(payload)
      refresh()
    },
    [refresh],
  )

  const handleLanguage = useCallback(
    (lang) => {
      api.setLanguage(lang)
      refresh()
    },
    [refresh],
  )


  const handleSwitchStudent = useCallback(() => {
    api.signOut()
    refresh()
    setScreen('HOME')
  }, [refresh])

  useEffect(() => {
    document.documentElement.lang = session.lang
  }, [session.lang])

  if (!session.student) {
    return (
      <SignInScreen
        students={students}
        lang={session.lang}
        t={t}
        onLanguageChange={handleLanguage}
        onPick={(id) => {
          api.signIn(id)
          refresh()
          setScreen('HOME')
        }}
      />
    )
  }

  const inActivity = SUBJECTS.includes(screen)

  return (
    <div className="flex min-h-full flex-col">
      <HeaderBar
        student={inActivity ? null : session.student}
        stars={session.stars}
        lang={session.lang}
        onLanguageChange={handleLanguage}
        onRepeatAudio={inActivity ? repeat : undefined}
        onBack={inActivity ? () => setScreen('HOME') : undefined}
        onSwitchStudent={!inActivity ? handleSwitchStudent : undefined}
        title={inActivity ? t(screen === 'WRITING' ? 'writing' : screen.toLowerCase()) : null}
      />

      <main className="flex-1">
        {screen === 'HOME' && (
          <HomeScreen
            student={session.student}
            levels={session.levels}
            starsToday={session.starsToday}
            dailyGoal={session.dailyGoal}
            lang={session.lang}
            t={t}
            onOpen={setScreen}
          />
        )}

        {inActivity && (
          <ActivityScreen
            key={screen}
            subject={screen}
            items={items}
            lang={session.lang}
            t={t}
            speak={speak}
            onAnswer={handleAnswer}
            onExit={() => setScreen('HOME')}
          />
        )}

        {screen === 'REWARDS' && (
          <RewardsScreen
            stars={session.stars}
            lang={session.lang}
            t={t}
          />
        )}
      </main>

      <NavigationDock
        active={screen}
        t={t}
        onNavigate={(id) => setScreen(id === 'HOME' ? 'HOME' : id)}
      />
    </div>
  )
}
