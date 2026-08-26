/** Shared visual primitives for the student experience. */

export const TILE_THEMES = {
  sky: 'bg-sky-tile text-sky-ink border-sky-ink/15',
  mint: 'bg-mint-tile text-mint-ink border-mint-ink/15',
  lemon: 'bg-lemon-tile text-lemon-ink border-lemon-ink/15',
  blush: 'bg-blush-tile text-blush-ink border-blush-ink/15',
  lilac: 'bg-lilac-tile text-lilac-ink border-lilac-ink/15',
}

export function IconButton({ label, onClick, children, tone = 'sky', size = 'md' }) {
  const sizes = { sm: 'w-11 h-11 text-lg', md: 'w-14 h-14 text-2xl', lg: 'w-16 h-16 text-3xl' }
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`press grid place-items-center rounded-full border-2 shadow-tile ${TILE_THEMES[tone]} ${sizes[size]}`}
    >
      {children}
    </button>
  )
}

export function StarBadge({ count }) {
  return (
    <div className="flex items-center gap-2 rounded-full border-2 border-lemon-ink/20 bg-lemon-tile px-4 py-2 shadow-tile">
      <svg viewBox="0 0 64 64" className="h-7 w-7" aria-hidden="true">
        <path
          d="M32 8l7.4 15 16.6 2.4-12 11.7 2.8 16.5L32 45.8 17.2 53.6 20 37.1 8 25.4 24.6 23z"
          fill="#FFC107"
          stroke="#F9A825"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-2xl font-extrabold tabular-nums text-lemon-ink">{count}</span>
    </div>
  )
}

export function ProgressBar({ value, total, tone = 'mint' }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0
  const fill = { mint: 'bg-mint-ink', sky: 'bg-sky-ink', lemon: 'bg-lemon-ink' }[tone]
  return (
    <div
      className="h-4 w-full overflow-hidden rounded-full bg-ink/10"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${fill}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/**
 * A chunky answer tile. Large hit area (min 96px) for small hands and
 * low-precision touchscreens.
 */
export function OptionTile({ children, onClick, state = 'idle', tone = 'lemon', wide = false }) {
  const stateClass =
    state === 'correct'
      ? 'bg-mint-tile border-correct ring-4 ring-correct/40'
      : state === 'wrong'
        ? 'bg-blush-tile border-retry animate-shake'
        : TILE_THEMES[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state !== 'idle'}
      className={`press grid min-h-[96px] place-items-center rounded-tile border-4 shadow-tile ${stateClass} ${
        wide ? 'w-full px-8 py-6' : 'aspect-square w-full max-w-40 p-4'
      }`}
    >
      {children}
    </button>
  )
}

export function Panel({ children, className = '' }) {
  return (
    <section
      className={`rounded-stage border border-ink/5 bg-stage p-5 shadow-stage sm:p-8 ${className}`}
    >
      {children}
    </section>
  )
}

export function FeedbackOverlay({ kind, correctText, retryText }) {
  if (!kind) return null
  const correct = kind === 'correct'
  return (
    <div
      role="status"
      aria-live="assertive"
      className={`pointer-events-none absolute inset-0 z-30 grid place-items-center rounded-stage backdrop-blur-[2px] ${
        correct ? 'bg-mint-tile/85' : 'bg-blush-tile/85'
      }`}
    >
      <div className="animate-pop-in text-center">
        <div className="text-7xl">{correct ? '🌟' : '💡'}</div>
        <p
          className={`mt-3 text-3xl font-extrabold sm:text-4xl ${
            correct ? 'text-mint-ink' : 'text-blush-ink'
          }`}
        >
          {correct ? correctText : retryText}
        </p>
      </div>
    </div>
  )
}
