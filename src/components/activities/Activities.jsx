import { useRef, useState } from 'react'
import Art from '../ui/Art'
import { OptionTile } from '../ui/primitives'

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

export function promptText(item, lang) {
  if (!item) return ''
  if (item.type === 'STORY') return item.title[lang]
  return item.prompt?.[lang] ?? ''
}

function stateFor(chosen, value, correct) {
  if (chosen === null) return 'idle'
  if (value === correct) return 'correct'
  if (value === chosen) return 'wrong'
  return 'idle'
}

/* ------------------------------------------------------------------ */
/* individual activity renderers                                       */
/* ------------------------------------------------------------------ */

function ChoiceGrid({ options, correct, onAnswer, render, tone = 'lemon', columns }) {
  const [chosen, setChosen] = useState(null)
  const cols = columns ?? Math.min(options.length, 4)

  const pick = (value) => {
    if (chosen !== null) return
    setChosen(value)
    onAnswer(value === correct)
  }

  return (
    <div
      className="mx-auto grid w-full max-w-2xl gap-4"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const value = typeof opt === 'string' ? opt : opt.id
        return (
          <OptionTile
            key={value}
            tone={tone}
            state={stateFor(chosen, value, correct)}
            onClick={() => pick(value)}
          >
            {render(opt)}
          </OptionTile>
        )
      })}
    </div>
  )
}

function LetterSound({ item, onAnswer }) {
  return (
    <ChoiceGrid
      options={item.options}
      correct={item.correct}
      onAnswer={onAnswer}
      tone="sky"
      render={(o) => <span className="text-6xl font-extrabold lowercase">{o}</span>}
    />
  )
}

function WordPicture({ item, onAnswer }) {
  return (
    <ChoiceGrid
      options={item.options}
      correct={item.correct}
      onAnswer={onAnswer}
      tone="lemon"
      columns={3}
      render={(o) => (
        <div className="flex flex-col items-center gap-2">
          <Art name={o.art} className="h-20 w-20" />
        </div>
      )}
    />
  )
}

function Compare({ item, onAnswer }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl items-center justify-center gap-8">
      <ChoiceGrid
        options={item.options}
        correct={item.correct}
        onAnswer={onAnswer}
        tone="sky"
        columns={2}
        render={(o) => <span className="text-6xl font-extrabold tabular-nums">{o}</span>}
      />
    </div>
  )
}

function Counting({ item, onAnswer }) {
  return (
    <div className="w-full space-y-6">
      <div className="mx-auto flex max-w-xl flex-wrap justify-center gap-3 rounded-tile bg-page p-6">
        {Array.from({ length: item.count }).map((_, i) => (
          <Art key={i} name={item.art} className="h-16 w-16" />
        ))}
      </div>
      <ChoiceGrid
        options={item.options}
        correct={item.correct}
        onAnswer={onAnswer}
        tone="blush"
        render={(o) => <span className="text-5xl font-extrabold tabular-nums">{o}</span>}
      />
    </div>
  )
}

function SkipCount({ item, onAnswer }) {
  return (
    <div className="w-full space-y-6">
      <ol className="mx-auto flex max-w-xl justify-center overflow-hidden rounded-tile border-4 border-ink/10">
        {item.sequence.map((n, i) => (
          <li
            key={n}
            className={`flex-1 border-r border-ink/10 px-3 py-4 text-center text-2xl font-extrabold tabular-nums last:border-r-0 ${
              i === item.missingIndex ? 'bg-lemon-tile text-lemon-ink' : 'bg-stage'
            }`}
          >
            {i === item.missingIndex ? '?' : n}
          </li>
        ))}
      </ol>
      <ChoiceGrid
        options={item.options}
        correct={item.correct}
        onAnswer={onAnswer}
        tone="mint"
        render={(o) => <span className="text-5xl font-extrabold tabular-nums">{o}</span>}
      />
    </div>
  )
}

function Sum({ item, onAnswer }) {
  return (
    <div className="w-full space-y-6">
      <p className="text-center text-6xl font-extrabold tabular-nums sm:text-7xl">
        {item.a} <span className="text-ink-soft">{item.op}</span> {item.b}{' '}
        <span className="text-ink-soft">=</span>{' '}
        <span className="text-blush-ink">?</span>
      </p>
      <ChoiceGrid
        options={item.options}
        correct={item.correct}
        onAnswer={onAnswer}
        tone="blush"
        render={(o) => <span className="text-5xl font-extrabold tabular-nums">{o}</span>}
      />
    </div>
  )
}

function FillPhrase({ item, onAnswer }) {
  return (
    <div className="w-full space-y-8">
      <p className="text-center text-4xl font-extrabold">
        {item.before} <span className="text-ink-soft underline decoration-4">____</span>{' '}
        {item.after}
      </p>
      <ChoiceGrid
        options={item.options}
        correct={item.correct}
        onAnswer={onAnswer}
        tone="lilac"
        columns={2}
        render={(o) => <span className="text-4xl font-extrabold">{o}</span>}
      />
    </div>
  )
}

function BuildWord({ item, onAnswer }) {
  const target = item.word.split('')
  const [slots, setSlots] = useState([])
  const done = slots.length === target.length

  const tap = (letter) => {
    if (done) return
    const next = [...slots, letter]
    setSlots(next)
    if (next.length === target.length) {
      onAnswer(next.join('') === item.word)
    }
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex justify-center gap-3">
        {target.map((_, i) => (
          <div
            key={i}
            className={`grid h-20 w-16 place-items-center rounded-2xl border-4 text-4xl font-extrabold ${
              slots[i]
                ? 'border-mint-ink/30 bg-mint-tile text-mint-ink'
                : 'border-dashed border-ink/20 bg-page'
            }`}
          >
            {slots[i] ?? ''}
          </div>
        ))}
      </div>

      <div className="mx-auto grid max-w-xl grid-cols-5 gap-3">
        {item.pool.map((letter, i) => (
          <OptionTile key={`${letter}-${i}`} tone="sky" onClick={() => tap(letter)}>
            <span className="text-4xl font-extrabold lowercase">{letter}</span>
          </OptionTile>
        ))}
      </div>

      {slots.length > 0 && !done && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setSlots([])}
            className="press rounded-full border-2 border-ink/10 bg-stage px-6 py-2 font-extrabold text-ink-soft"
          >
            ↺
          </button>
        </div>
      )}
    </div>
  )
}

/** Finger/stylus tracing over a ghost glyph. Coverage is scored loosely. */
function Trace({ item, onAnswer }) {
  const svgRef = useRef(null)
  const [strokes, setStrokes] = useState([])
  const drawing = useRef(false)

  const point = (event) => {
    const rect = svgRef.current.getBoundingClientRect()
    return [
      ((event.clientX - rect.left) / rect.width) * 100,
      ((event.clientY - rect.top) / rect.height) * 100,
    ]
  }

  const start = (e) => {
    drawing.current = true
    setStrokes((s) => [...s, [point(e)]])
  }
  const move = (e) => {
    if (!drawing.current) return
    setStrokes((s) => {
      const next = [...s]
      next[next.length - 1] = [...next[next.length - 1], point(e)]
      return next
    })
  }
  const end = () => {
    drawing.current = false
  }

  const marks = strokes.reduce((n, s) => n + s.length, 0)

  return (
    <div className="w-full space-y-5">
      <div className="mx-auto max-w-md rounded-tile border-8 border-[#5d4037] bg-[#243027] p-4 shadow-tile">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="aspect-square w-full touch-none"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        >
          <line x1="0" y1="30" x2="100" y2="30" stroke="#ffffff22" strokeWidth="0.6" />
          <line
            x1="0"
            y1="72"
            x2="100"
            y2="72"
            stroke="#ff8a8a55"
            strokeWidth="0.8"
            strokeDasharray="3 2"
          />
          <text
            x="50"
            y="76"
            textAnchor="middle"
            fontSize="72"
            fontWeight="800"
            fill="#ffffff28"
            fontFamily="Nunito, system-ui, sans-serif"
          >
            {item.glyph}
          </text>
          {strokes.map((stroke, i) => (
            <polyline
              key={i}
              points={stroke.map(([x, y]) => `${x},${y}`).join(' ')}
              fill="none"
              stroke="#FFD54F"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      </div>

      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => setStrokes([])}
          className="press rounded-full border-2 border-ink/10 bg-stage px-6 py-3 font-extrabold text-ink-soft"
        >
          ↺
        </button>
        <button
          type="button"
          disabled={marks < 12}
          onClick={() => onAnswer(true)}
          className="press rounded-full bg-mint-ink px-8 py-3 text-lg font-extrabold text-white shadow-tile disabled:opacity-40"
        >
          ✓
        </button>
      </div>
    </div>
  )
}

function Story({ item, lang, onAnswer }) {
  const [reading, setReading] = useState(true)

  if (reading) {
    return (
      <div className="w-full space-y-6">
        <div className="mx-auto max-w-2xl rounded-tile bg-lemon-tile/60 p-6 sm:p-8">
          <p className="text-xl leading-relaxed font-semibold text-ink sm:text-2xl">
            {item.body[lang]}
          </p>
        </div>
        <div className="text-center">
          <button
            type="button"
            onClick={() => setReading(false)}
            className="press rounded-full bg-sky-ink px-10 py-4 text-xl font-extrabold text-white shadow-tile"
          >
            →
          </button>
        </div>
      </div>
    )
  }

  const options = item.options[lang]
  return (
    <div className="w-full space-y-6">
      <p className="text-center text-3xl font-extrabold">{item.question[lang]}</p>
      <ChoiceGrid
        options={options}
        correct={options[item.correctIndex]}
        onAnswer={onAnswer}
        tone="lemon"
        columns={1}
        render={(o) => <span className="text-2xl font-extrabold">{o}</span>}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */

const RENDERERS = {
  LETTER_SOUND: LetterSound,
  WORD_PICTURE: WordPicture,
  BUILD_WORD: BuildWord,
  FILL_PHRASE: FillPhrase,
  TRACE: Trace,
  STORY: Story,
  COUNT: Counting,
  COMPARE: Compare,
  SKIP_COUNT: SkipCount,
  SUM: Sum,
}

export default function ActivityRenderer({ item, lang, onAnswer }) {
  const Renderer = RENDERERS[item?.type]
  if (!Renderer) return null
  return <Renderer key={item.__key} item={item} lang={lang} onAnswer={onAnswer} />
}
