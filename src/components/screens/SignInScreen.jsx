import { Avatar } from '../ui/Art'
import { Panel } from '../ui/primitives'
import { LANGUAGES } from '../../data/i18n'

/**
 * Picture sign-in. Young learners cannot type an email; the production
 * version will exchange this pick for a Firebase Auth session scoped to the
 * class (class code + learner pick), never a free-text identity.
 */
export default function SignInScreen({ students, lang, onLanguageChange, onPick, t }) {
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

        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {students.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onPick(s.id)}
                className="press flex w-full flex-col items-center gap-3 rounded-tile border-4 border-ink/5 bg-page p-4 shadow-tile hover:border-sky-ink/30"
              >
                <Avatar id={s.avatar} className="h-20 w-20 sm:h-24 sm:w-24" />
                <span className="text-xl font-extrabold">{s.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
