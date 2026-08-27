/**
 * Teacher UI primitives.
 *
 * Deliberately a different register from the student app: denser, quieter,
 * information-first. It shares the token file so the two never drift apart in
 * hue, but a teacher is scanning a roster on a laptop, not tapping a tile.
 */

import { LITERACY_LEVELS, NUMERACY_LEVELS, levelLabel } from '../../shared/levels'

export function Card({ children, className = '', as: Tag = 'section' }) {
  return (
    <Tag
      className={`rounded-2xl border border-ink/10 bg-stage p-5 shadow-[0_1px_2px_rgb(20_32_46/0.06)] ${className}`}
    >
      {children}
    </Tag>
  )
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold tracking-[0.14em] text-ink-soft uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-balance">{title}</h1>
        {description && (
          <p className="mt-1 max-w-prose text-sm text-ink-soft">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}

export function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled,
  onClick,
  className = '',
}) {
  const variants = {
    primary: 'bg-sky-ink text-white hover:bg-sky-ink/90',
    secondary: 'border border-ink/15 bg-stage text-ink hover:bg-page',
    danger: 'border border-blush-ink/30 bg-blush-tile text-blush-ink hover:bg-blush-tile/70',
    ghost: 'text-ink-soft hover:bg-page',
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Field({ label, hint, children, htmlFor }) {
  return (
    <label className="flex flex-col gap-1.5" htmlFor={htmlFor}>
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="text-xs text-ink-soft">{hint}</span>}
    </label>
  )
}

const controlClass =
  'w-full rounded-lg border border-ink/15 bg-stage px-3 py-2 text-sm outline-none focus:border-sky-ink'

export function TextInput(props) {
  return <input {...props} className={controlClass} />
}

export function NumberInput(props) {
  return (
    <input
      type="number"
      inputMode="numeric"
      {...props}
      className={`${controlClass} tabular-nums`}
    />
  )
}

export function Select({ options, ...props }) {
  return (
    <select {...props} className={controlClass}>
      {options.map((option) =>
        typeof option === 'string' ? (
          <option key={option} value={option}>
            {option}
          </option>
        ) : (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ),
      )}
    </select>
  )
}

export function LevelSelect({ subject, ...props }) {
  const levels = subject === 'numeracy' ? NUMERACY_LEVELS : LITERACY_LEVELS
  return (
    <Select
      {...props}
      options={levels.map((level) => ({ value: level, label: levelLabel(level) }))}
    />
  )
}

/**
 * A level shown as a chip. The ramp encodes *distance from grade level*, which
 * is the thing a teacher scans a roster for — not a decorative accent.
 */
export function LevelChip({ level, subject = 'literacy', className = '' }) {
  const scale = subject === 'numeracy' ? NUMERACY_LEVELS : LITERACY_LEVELS
  const index = Math.max(0, scale.indexOf(level))
  const share = scale.length > 1 ? index / (scale.length - 1) : 0

  const tone =
    share < 0.25
      ? 'bg-blush-tile text-blush-ink'
      : share < 0.6
        ? 'bg-lemon-tile text-lemon-ink'
        : 'bg-mint-tile text-mint-ink'

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${tone} ${className}`}
    >
      {levelLabel(level)}
    </span>
  )
}

export function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-page text-ink-soft border-ink/10',
    ai: 'bg-lilac-tile text-lilac-ink border-lilac-ink/20',
    teacher: 'bg-sky-tile text-sky-ink border-sky-ink/20',
    warn: 'bg-lemon-tile text-lemon-ink border-lemon-ink/20',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div role="status" className="flex items-center gap-3 py-10 text-sm text-ink-soft">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-sky-ink" />
      {label}
    </div>
  )
}

export function ErrorNote({ error, onRetry }) {
  if (!error) return null
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 rounded-xl border border-blush-ink/25 bg-blush-tile/60 px-4 py-3 text-sm text-blush-ink"
    >
      <span className="font-semibold">{error.message}</span>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/20 px-6 py-12 text-center">
      <p className="font-semibold">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">{description}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
