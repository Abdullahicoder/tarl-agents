import { NavLink, Outlet, useMatch } from 'react-router-dom'
import { useAuth } from '../shared/auth'
import { Button } from './components/ui'
import { DEMO_MODE } from '../shared/demoMode'

function navClass({ isActive }) {
  return `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-sky-tile text-sky-ink' : 'text-ink-soft hover:bg-page'
  }`
}

export default function TeacherLayout() {
  const { user, signOut } = useAuth()
  // useParams on a layout route only sees params matched by the layout itself,
  // and :classId lives on the children — so match the path explicitly.
  const classMatch = useMatch('/teacher/classes/:classId/*')
  const classId = classMatch?.params.classId

  return (
    <div className="min-h-full bg-page font-ui">
      {DEMO_MODE && (
        <div className="border-b border-amber-200 bg-amber-50 px-5 py-2 text-center text-xs font-semibold text-amber-900">
          DEMO MODE — You are viewing sample classroom data.
        </div>
      )}
      <header className="border-b border-ink/10 bg-stage">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-5 py-3">
          <NavLink to="/teacher" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-ink text-sm font-bold text-white">
              Ta
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold">TaRL Classroom</span>
              <span className="block text-[11px] text-ink-soft">
                AI recommends · teachers decide
              </span>
            </span>
          </NavLink>

          <nav className="flex items-center gap-1">
            <NavLink to="/teacher" end className={navClass}>
              Classes
            </NavLink>
            {classId && (
              <>
                <NavLink to={`/teacher/classes/${classId}`} end className={navClass}>
                  Roster
                </NavLink>
                <NavLink to={`/teacher/classes/${classId}/grouping`} className={navClass}>
                  Grouping
                </NavLink>
                <NavLink to={`/teacher/classes/${classId}/plans`} className={navClass}>
                  Lesson plans
                </NavLink>
              </>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-ink-soft sm:inline">
              {user?.name || user?.email}
            </span>
            <Button variant="secondary" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  )
}
