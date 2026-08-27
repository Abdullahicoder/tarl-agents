import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from './shared/auth'
import SignInPage from './shared/SignInPage'
import SignUpPage from './shared/SignUpPage'
import StudentApp from './App'
import TeacherLayout from './teacher/TeacherLayout'
import ClassesPage from './teacher/pages/ClassesPage'
import ClassPage from './teacher/pages/ClassPage'
import StudentPage from './teacher/pages/StudentPage'
import GroupingPage from './teacher/pages/GroupingPage'
import LessonPlansPage from './teacher/pages/LessonPlansPage'
import { Loading } from './teacher/components/ui'
import { DEMO_MODE } from './shared/demoMode'

/**
 * Route structure.
 *
 * `/student/*` and `/teacher/*` are separate experiences that happen to share a
 * bundle today. Keeping them apart at the route level is what lets the teacher
 * and (later) parent apps become their own entry points without a rewrite.
 *
 * RequireRole is a UX gate, not a security boundary — it decides what to render,
 * while the backend decides what data anyone may have.
 */

function Shell() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

function RequireRole({ allow, children }) {
  const { status, role } = useAuth()

  if (DEMO_MODE) return children

  if (status === 'loading') return <Loading label="Checking your account…" />
  if (status === 'signed-out' || status === 'unconfigured') {
    return <Navigate to="/signin" replace />
  }
  if (!allow.includes(role)) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-bold">This area is for teachers</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Your account has the role “{role}”. Ask an administrator to grant teacher
          access, then sign in again.
        </p>
      </div>
    )
  }
  return children
}

function Landing() {
  const { status, role } = useAuth()

  if (DEMO_MODE) return <Navigate to="/teacher" replace />
  if (status === 'loading') return <Loading label="Loading…" />
  if (status === 'signed-in' && (role === 'teacher' || role === 'admin')) {
    return <Navigate to="/teacher" replace />
  }
  // Learners and anyone not signed in land in the student app, which has its own
  // picture sign-in and works without a staff account.
  return <Navigate to="/student" replace />
}

export const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/signin', element: <SignInPage /> },
      { path: '/signup', element: <SignUpPage /> },
      { path: '/student/*', element: <StudentApp /> },
      {
        path: '/teacher',
        element: (
          <RequireRole allow={['teacher', 'admin']}>
            <TeacherLayout />
          </RequireRole>
        ),
        children: [
          { index: true, element: <ClassesPage /> },
          { path: 'classes/:classId', element: <ClassPage /> },
          { path: 'classes/:classId/grouping', element: <GroupingPage /> },
          { path: 'classes/:classId/plans', element: <LessonPlansPage /> },
          { path: 'students/:studentId', element: <StudentPage /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
