import { Avatar } from '../ui/Art'
import { Panel } from '../ui/primitives'
import { LANGUAGES } from '../../data/i18n'

/**
 * Picture sign-in.
 *
 * A six-year-old cannot hold a credential, so tapping a face is the whole
 * identity step. The roster is class-scoped and carries only id, name and
 * avatar; the tap is exchanged server-side for a short-lived session that can
 * read that child's record and no other.
 *
 * When the roster cannot be fetched the learner is TOLD so. It must never fall
 * back to demo names, because progress recorded against a fake identity is
 * progress a teacher will later read as real.
 */
export default function SignInScreen({
  students,
  loading,
  error,
  busy,
  lang,
  onLanguageChange,
  onPick,
  t,
}) {
  const offline = error?.status === 0

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center gap-6 p-4 sm:p-6">
      <div className="flex justify-center gap-2">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => onLanguageChange(l.code)}
            className={`press rounded-full border-2 px-5 py-2 text-base font-extrabold ${
              lang === l.code
                ? 'border-mint-ink/25 bg-mint-tile text-mint-ink shadow-tile'
                : 'border-ink/10 bg-stage text-ink-soft'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <Panel className="text-center">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{t('whoIsLearning')}</h1>
        <p className="mt-2 text-lg text-ink-soft">{t('tapYourPicture')}</p>

        {loading && (
          <div
            role="status"
            className="mt-10 flex flex-col items-center gap-3 text-ink-soft"
          >
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-ink/15 border-t-sky-ink" />
            <span className="text-base font-bold">…</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-8 rounded-tile border-4 border-blush-ink/25 bg-blush-tile/60 p-6"
          >
            <p className="text-5xl" aria-hidden="true">
              {offline ? '📡' : '⚠️'}
            </p>
            <p className="mt-3 text-lg font-extrabold text-blush-ink">
              {offline ? t('noConnection') : t('cannotLoadClass')}
            </p>
            <p className="mt-1 text-sm font-semibold text-blush-ink/80">
              {t('askYourTeacher')}
            </p>
          </div>
        )}

        {!loading && !error && students.length === 0 && (
          <p className="mt-10 text-lg font-bold text-ink-soft">{t('noStudentsYet')}</p>
        )}

        {students.length > 0 && (
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {students.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onPick(s.id)}
                  className="press flex w-full flex-col items-center gap-3 rounded-tile border-4 border-ink/5 bg-page p-4 shadow-tile hover:border-sky-ink/30 disabled:opacity-50"
                >
                  <Avatar id={s.avatar} className="h-20 w-20 sm:h-24 sm:w-24" />
                  <span className="text-xl font-extrabold">{s.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
