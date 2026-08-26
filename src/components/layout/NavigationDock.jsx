const ITEMS = [
  { id: 'HOME', labelKey: 'continueLearning', glyph: '🏠', tone: 'sky' },
  { id: 'LITERACY', labelKey: 'literacy', glyph: 'abc', tone: 'mint' },
  { id: 'NUMERACY', labelKey: 'numeracy', glyph: '123', tone: 'blush' },
  { id: 'STORIES', labelKey: 'stories', glyph: '📖', tone: 'lemon' },
  { id: 'REWARDS', labelKey: 'rewards', glyph: '⭐', tone: 'lilac' },
]

const ACTIVE = {
  sky: 'bg-sky-tile text-sky-ink',
  mint: 'bg-mint-tile text-mint-ink',
  blush: 'bg-blush-tile text-blush-ink',
  lemon: 'bg-lemon-tile text-lemon-ink',
  lilac: 'bg-lilac-tile text-lilac-ink',
}

export default function NavigationDock({ active, onNavigate, t }) {
  return (
    <nav
      aria-label="Main"
      className="sticky bottom-0 z-20 mx-auto w-full max-w-3xl px-3 pb-3 sm:pb-5"
    >
      <ul className="flex items-stretch justify-between gap-1 rounded-stage border border-ink/5 bg-stage/95 p-2 shadow-stage backdrop-blur">
        {ITEMS.map((item) => {
          const isActive = active === item.id
          return (
            <li key={item.id} className="flex-1">
              <button
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onNavigate(item.id)}
                className={`press flex w-full flex-col items-center gap-1 rounded-2xl px-1 py-2.5 ${
                  isActive ? ACTIVE[item.tone] : 'text-ink-soft hover:bg-page'
                }`}
              >
                <span className="text-2xl leading-none font-extrabold" aria-hidden="true">
                  {item.glyph}
                </span>
                <span className="text-[11px] font-extrabold sm:text-xs">
                  {t(item.labelKey)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
