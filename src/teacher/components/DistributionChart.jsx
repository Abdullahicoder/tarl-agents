import { levelLabel } from '../../shared/levels'

/**
 * Where a class sits across the TaRL scale, per subject.
 *
 * Form: horizontal bars on an *ordered* categorical axis. The axis is the TaRL
 * progression itself, so the shape of the chart is the answer a teacher wants —
 * a left-heavy chart means most of the class is behind grade level.
 *
 * One series, so no legend: the panel title names it. Colour is a single-hue
 * sequential ramp keyed to position on the scale, never a rainbow and never a
 * status palette — "Beginner" is not an error state, it is a starting point.
 */

const RAMP = [
  'rgb(11 99 168 / 0.28)',
  'rgb(11 99 168 / 0.42)',
  'rgb(11 99 168 / 0.56)',
  'rgb(11 99 168 / 0.70)',
  'rgb(11 99 168 / 0.84)',
  'rgb(11 99 168 / 0.92)',
  'rgb(11 99 168 / 1)',
]

function shade(index, total) {
  if (total <= 1) return RAMP[RAMP.length - 1]
  const position = index / (total - 1)
  return RAMP[Math.round(position * (RAMP.length - 1))]
}

export default function DistributionChart({ title, counts, total }) {
  const max = Math.max(1, ...counts.map((c) => c.count))
  const placed = counts.reduce((sum, c) => sum + c.count, 0)

  return (
    <figure className="m-0">
      <figcaption className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-bold">{title}</h3>
        <span className="text-xs text-ink-soft tabular-nums">
          {placed} of {total} students
        </span>
      </figcaption>

      <ul className="flex flex-col gap-2">
        {counts.map((entry, index) => {
          const share = total > 0 ? Math.round((entry.count / total) * 100) : 0
          return (
            <li key={entry.level} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3">
              <span className="truncate text-xs font-semibold text-ink-soft">
                {levelLabel(entry.level)}
              </span>
              <span
                className="relative block h-5 rounded-[4px] bg-ink/5"
                title={`${levelLabel(entry.level)}: ${entry.count} students (${share}%)`}
              >
                <span
                  className="absolute inset-y-0 left-0 rounded-[4px] transition-[width] duration-500"
                  style={{
                    width: `${(entry.count / max) * 100}%`,
                    background: shade(index, counts.length),
                  }}
                />
              </span>
              <span className="text-right text-xs font-bold tabular-nums">
                {entry.count}
              </span>
            </li>
          )
        })}
      </ul>

      {/* Identity is never colour-alone: the same numbers are readable as text. */}
      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-ink-soft">View as table</summary>
        <table className="mt-2 w-full text-left text-xs">
          <thead>
            <tr className="text-ink-soft">
              <th scope="col" className="py-1 font-semibold">Level</th>
              <th scope="col" className="py-1 text-right font-semibold">Students</th>
              <th scope="col" className="py-1 text-right font-semibold">Share</th>
            </tr>
          </thead>
          <tbody>
            {counts.map((entry) => (
              <tr key={entry.level} className="border-t border-ink/10">
                <td className="py-1">{levelLabel(entry.level)}</td>
                <td className="py-1 text-right tabular-nums">{entry.count}</td>
                <td className="py-1 text-right tabular-nums">
                  {total > 0 ? Math.round((entry.count / total) * 100) : 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
