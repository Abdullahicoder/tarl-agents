import Art from '../ui/Art'
import { Panel, ProgressBar } from '../ui/primitives'
import { LEVEL_LABELS } from '../../data/curriculum'

const SUBJECTS = [
  {
    id: 'LITERACY',
    labelKey: 'literacy',
    tone: 'mint',
    glyph: 'abc',
    art: 'sprout',
    levelKey: 'literacy',
  },
  {
    id: 'NUMERACY',
    labelKey: 'numeracy',
    tone: 'blush',
    glyph: '123',
    art: 'ball',
    levelKey: 'numeracy',
  },
  { id: 'STORIES', labelKey: 'stories', tone: 'lemon', glyph: '📖', art: 'tree' },
  { id: 'WRITING', labelKey: 'writing', tone: 'lilac', glyph: '✏️', art: 'seed' },
]

const CARD = {
  mint: 'bg-mint-tile text-mint-ink',
  blush: 'bg-blush-tile text-blush-ink',
  lemon: 'bg-lemon-tile text-lemon-ink',
  lilac: 'bg-lilac-tile text-lilac-ink',
}

export default function HomeScreen({ student, levels, starsToday, dailyGoal, onOpen, t, lang }) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-4 sm:p-6">
      <Panel className="stage-grain">
        <p className="text-lg font-bold text-ink-soft">
          {t('hello')}, {student?.name} 👋
        </p>
        <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">{t('chooseActivity')}</h1>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-baseline justify-between text-sm font-bold text-ink-soft">
              <span>{t('todaysGoal')}</span>
              <span className="tabular-nums">
                {starsToday}/{dailyGoal} {t('starsToday')}
              </span>
            </div>
            <ProgressBar value={starsToday} total={dailyGoal} />
          </div>
          <Art name="star" className="h-12 w-12" />
        </div>
      </Panel>

      <ul className="grid grid-cols-2 gap-4">
        {SUBJECTS.map((s) => {
          const level = s.levelKey ? levels[s.levelKey] : null
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onOpen(s.id)}
                className={`press relative flex h-full w-full flex-col items-start gap-2 overflow-hidden rounded-stage p-5 text-left shadow-tile ${CARD[s.tone]}`}
              >
                <span className="text-3xl leading-none font-extrabold" aria-hidden="true">
                  {s.glyph}
                </span>
                <span className="text-2xl font-extrabold">{t(s.labelKey)}</span>
                {level && (
                  <span className="rounded-full bg-stage/70 px-3 py-1 text-xs font-extrabold">
                    {t('yourLevel')}: {LEVEL_LABELS[level]?.[lang] ?? level}
                  </span>
                )}
                <Art
                  name={s.art}
                  className="pointer-events-none absolute -right-3 -bottom-3 h-24 w-24 opacity-25"
                />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
