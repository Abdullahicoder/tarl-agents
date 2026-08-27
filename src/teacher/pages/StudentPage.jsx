import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTeacherApi } from '../api'
import { useAsync } from '../../shared/useAsync'
import {
  Badge,
  Button,
  Card,
  ErrorNote,
  Field,
  LevelChip,
  LevelSelect,
  Loading,
  NumberInput,
  PageHeader,
} from '../components/ui'
import { levelLabel } from '../../shared/levels'

const BLANK_LANGUAGE = {
  letters_correct: 0,
  letters_total: 5,
  words_correct: 0,
  words_total: 5,
  paragraph_passed: false,
  story_passed: false,
}

const BLANK_RAW = {
  english: { ...BLANK_LANGUAGE },
  swahili: { ...BLANK_LANGUAGE },
  single_digit_correct: 0,
  single_digit_total: 5,
  double_digit_correct: 0,
  double_digit_total: 5,
  addition_passed: false,
  subtraction_passed: false,
  multiplication_passed: false,
  division_passed: false,
}

function Check({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#0b63a8]"
      />
      {label}
    </label>
  )
}

function LanguageInputs({ title, value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch })
  return (
    <div className="rounded-xl border border-ink/10 p-4">
      <h4 className="mb-3 text-sm font-bold">{title}</h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Letters correct" hint={`out of ${value.letters_total}`}>
          <NumberInput
            min="0"
            max={value.letters_total}
            value={value.letters_correct}
            onChange={(e) => set({ letters_correct: Number(e.target.value) })}
          />
        </Field>
        <Field label="Words correct" hint={`out of ${value.words_total}`}>
          <NumberInput
            min="0"
            max={value.words_total}
            value={value.words_correct}
            onChange={(e) => set({ words_correct: Number(e.target.value) })}
          />
        </Field>
      </div>
      <div className="mt-3 flex flex-wrap gap-5">
        <Check
          label="Read a paragraph"
          checked={value.paragraph_passed}
          onChange={(v) => set({ paragraph_passed: v })}
        />
        <Check
          label="Read a story"
          checked={value.story_passed}
          onChange={(v) => set({ story_passed: v })}
        />
      </div>
    </div>
  )
}

/** Recommendation vs decision, side by side. Any difference is an override. */
function DecisionRow({ label, subject, recommended, value, onChange }) {
  const changed = recommended !== value
  return (
    <div className="grid items-center gap-3 border-t border-ink/10 py-3 sm:grid-cols-[10rem_1fr_1fr]">
      <span className="text-sm font-semibold">{label}</span>
      <div className="flex items-center gap-2">
        <Badge tone="ai">Engine</Badge>
        <LevelChip level={recommended} subject={subject} />
      </div>
      <div className="flex items-center gap-2">
        <Badge tone={changed ? 'teacher' : 'neutral'}>
          {changed ? 'Your override' : 'Accepted'}
        </Badge>
        <LevelSelect
          subject={subject}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

export default function StudentPage() {
  const { studentId } = useParams()
  const api = useTeacherApi()

  const student = useAsync(() => api.getStudent(studentId), [api, studentId])
  const history = useAsync(() => api.listAssessments(studentId), [api, studentId])

  const [raw, setRaw] = useState(BLANK_RAW)
  const [recommendation, setRecommendation] = useState(null)
  const [decision, setDecision] = useState(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState(null)

  const runEngine = async () => {
    setBusy(true)
    setActionError(null)
    try {
      const result = await api.recommendLevels(studentId, raw)
      setRecommendation(result)
      setDecision({
        final_english_level: result.recommended_english_level,
        final_swahili_level: result.recommended_swahili_level,
        final_numeracy_level: result.recommended_numeracy_level,
      })
    } catch (err) {
      setActionError(err)
    } finally {
      setBusy(false)
    }
  }

  const commit = async () => {
    setBusy(true)
    setActionError(null)
    try {
      await api.recordAssessment(studentId, {
        raw,
        ...decision,
        teacher_note: note.trim() || null,
      })
      setRecommendation(null)
      setDecision(null)
      setNote('')
      setRaw(BLANK_RAW)
      await Promise.all([student.reload(), history.reload()])
    } catch (err) {
      setActionError(err)
    } finally {
      setBusy(false)
    }
  }

  const overriding =
    recommendation &&
    decision &&
    (recommendation.recommended_english_level !== decision.final_english_level ||
      recommendation.recommended_swahili_level !== decision.final_swahili_level ||
      recommendation.recommended_numeracy_level !== decision.final_numeracy_level)

  return (
    <>
      <PageHeader
        eyebrow="Student"
        title={student.data?.name ?? 'Student'}
        description={student.data ? `Age ${student.data.age}` : undefined}
      />

      {student.loading && <Loading label="Loading student…" />}
      <ErrorNote error={student.error} onRetry={student.reload} />

      {student.data && (
        <Card className="mb-6">
          <h2 className="mb-3 text-sm font-bold">Levels in force</h2>
          <dl className="grid gap-4 sm:grid-cols-3">
            {[
              ['English literacy', student.data.english_literacy_level, 'literacy'],
              ['Kiswahili literacy', student.data.swahili_literacy_level, 'literacy'],
              ['Numeracy', student.data.numeracy_level, 'numeracy'],
            ].map(([label, level, subject]) => (
              <div key={label}>
                <dt className="text-xs text-ink-soft">{label}</dt>
                <dd className="mt-1">
                  <LevelChip level={level} subject={subject} />
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      )}

      <Card className="mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold">Record an assessment</h2>
            <p className="mt-0.5 text-xs text-ink-soft">
              Enter what you observed. The engine applies the TaRL rules; you decide
              the level that is recorded.
            </p>
          </div>
          <Button onClick={runEngine} disabled={busy}>
            {busy && !recommendation ? 'Evaluating…' : 'Evaluate'}
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <LanguageInputs
            title="English"
            value={raw.english}
            onChange={(english) => setRaw({ ...raw, english })}
          />
          <LanguageInputs
            title="Kiswahili"
            value={raw.swahili}
            onChange={(swahili) => setRaw({ ...raw, swahili })}
          />
        </div>

        <div className="mt-4 rounded-xl border border-ink/10 p-4">
          <h4 className="mb-3 text-sm font-bold">Numeracy</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="1-digit correct" hint="out of 5">
              <NumberInput
                min="0"
                max="5"
                value={raw.single_digit_correct}
                onChange={(e) =>
                  setRaw({ ...raw, single_digit_correct: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="2-digit correct" hint="out of 5">
              <NumberInput
                min="0"
                max="5"
                value={raw.double_digit_correct}
                onChange={(e) =>
                  setRaw({ ...raw, double_digit_correct: Number(e.target.value) })
                }
              />
            </Field>
          </div>
          <div className="mt-3 flex flex-wrap gap-5">
            {[
              ['addition_passed', 'Addition'],
              ['subtraction_passed', 'Subtraction'],
              ['multiplication_passed', 'Multiplication'],
              ['division_passed', 'Division'],
            ].map(([key, label]) => (
              <Check
                key={key}
                label={label}
                checked={raw[key]}
                onChange={(v) => setRaw({ ...raw, [key]: v })}
              />
            ))}
          </div>
        </div>
      </Card>

      {recommendation && decision && (
        <Card className="mb-6 border-sky-ink/25">
          <h2 className="text-sm font-bold">Review the recommendation</h2>
          <p className="mt-0.5 mb-2 text-xs text-ink-soft">
            {recommendation.teacher_action_item}
          </p>

          <DecisionRow
            label="English literacy"
            subject="literacy"
            recommended={recommendation.recommended_english_level}
            value={decision.final_english_level}
            onChange={(v) => setDecision({ ...decision, final_english_level: v })}
          />
          <DecisionRow
            label="Kiswahili literacy"
            subject="literacy"
            recommended={recommendation.recommended_swahili_level}
            value={decision.final_swahili_level}
            onChange={(v) => setDecision({ ...decision, final_swahili_level: v })}
          />
          <DecisionRow
            label="Numeracy"
            subject="numeracy"
            recommended={recommendation.recommended_numeracy_level}
            value={decision.final_numeracy_level}
            onChange={(v) => setDecision({ ...decision, final_numeracy_level: v })}
          />

          <div className="mt-4">
            <Field
              label={overriding ? 'Why are you overriding?' : 'Note (optional)'}
              hint={
                overriding
                  ? 'Recorded with the assessment so the next teacher sees your reasoning.'
                  : undefined
              }
            >
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="She read the paragraph confidently in class this morning."
                className="w-full rounded-lg border border-ink/15 bg-stage px-3 py-2 text-sm outline-none focus:border-sky-ink"
              />
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={commit} disabled={busy}>
              {busy ? 'Saving…' : overriding ? 'Save my decision' : 'Accept and save'}
            </Button>
            <Button variant="ghost" onClick={() => setRecommendation(null)}>
              Discard
            </Button>
          </div>
        </Card>
      )}

      <ErrorNote error={actionError} />

      <Card>
        <h2 className="mb-3 text-sm font-bold">Assessment history</h2>
        {history.loading && <Loading label="Loading history…" />}
        <ErrorNote error={history.error} onRetry={history.reload} />
        {history.data?.length === 0 && (
          <p className="py-6 text-sm text-ink-soft">No assessments recorded yet.</p>
        )}
        <ul className="flex flex-col">
          {(history.data ?? []).map((record) => {
            const changed =
              record.recommended_english_level !== record.final_english_level ||
              record.recommended_swahili_level !== record.final_swahili_level ||
              record.recommended_numeracy_level !== record.final_numeracy_level
            return (
              <li key={record.assessment_id} className="border-t border-ink/10 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">
                    {new Date(record.assessed_at).toLocaleString()}
                  </span>
                  <Badge tone={changed ? 'teacher' : 'ai'}>
                    {changed ? 'Teacher override' : 'Engine accepted'}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-ink-soft">
                  English {levelLabel(record.final_english_level)} · Kiswahili{' '}
                  {levelLabel(record.final_swahili_level)} · Numeracy{' '}
                  {levelLabel(record.final_numeracy_level)}
                  {changed && (
                    <>
                      {' '}
                      <span className="text-ink/50">
                        (engine said {levelLabel(record.recommended_english_level)} /{' '}
                        {levelLabel(record.recommended_swahili_level)} /{' '}
                        {levelLabel(record.recommended_numeracy_level)})
                      </span>
                    </>
                  )}
                </p>
                {record.teacher_note && (
                  <p className="mt-1 text-sm italic">“{record.teacher_note}”</p>
                )}
              </li>
            )
          })}
        </ul>
      </Card>
    </>
  )
}
