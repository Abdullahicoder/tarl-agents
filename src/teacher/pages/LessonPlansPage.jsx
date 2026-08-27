import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTeacherApi } from '../api'
import { useAsync } from '../../shared/useAsync'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorNote,
  Field,
  LevelSelect,
  Loading,
  PageHeader,
  Select,
} from '../components/ui'
import { SUBJECTS, levelLabel } from '../../shared/levels'

export default function LessonPlansPage() {
  const { classId } = useParams()
  const api = useTeacherApi()

  const [subject, setSubject] = useState('numeracy')
  const grouping = useAsync(() => api.getGrouping(classId, subject), [api, classId, subject])

  const [plans, setPlans] = useState({})
  const [busyGroup, setBusyGroup] = useState(null)
  const [actionError, setActionError] = useState(null)

  const subjectLevels = subject === 'numeracy' ? 'numeracy' : 'literacy'

  const focusOf = (group) =>
    (subject === 'numeracy' ? group.focus_numeracy : group.focus_literacy) ?? 'Beginner'

  const build = async (group, level) => {
    setBusyGroup(group.group_name)
    setActionError(null)
    try {
      const plan = await api.buildLessonPlan(classId, {
        subject,
        target_level: level,
        group_name: group.group_name,
      })
      setPlans((current) => ({ ...current, [group.group_name]: plan }))
    } catch (err) {
      setActionError(err)
    } finally {
      setBusyGroup(null)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Class"
        title="Lesson plans"
        description="The verified level and its curriculum are fixed by the TaRL rules. The lesson itself is an AI recommendation built from your class's assessment evidence — review it before you teach it."
      />

      <div className="mb-6 w-56">
        <Field label="Subject">
          <Select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            options={SUBJECTS.map((s) => ({ value: s.value, label: s.label }))}
          />
        </Field>
      </div>

      {grouping.loading && <Loading label="Loading groups…" />}
      <ErrorNote error={grouping.error} onRetry={grouping.reload} />
      <ErrorNote error={actionError} />

      {grouping.data === null && !grouping.loading && (
        <EmptyState
          title="No saved grouping for this subject"
          description="Save a grouping first — plans are built per group."
        />
      )}

      {grouping.data && (
        <div className="flex flex-col gap-4">
          {grouping.data.groups.map((group) => {
            const response = plans[group.group_name]
            const level = focusOf(group)
            return (
              <Card key={group.group_name}>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-base font-bold">{group.group_name}</h2>
                  <Badge tone="neutral">
                    {group.student_ids.length} students · {levelLabel(level)}
                  </Badge>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-44">
                      <LevelSelect
                        subject={subjectLevels}
                        aria-label={`Target level for ${group.group_name}`}
                        value={level}
                        onChange={(e) => build(group, e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={() => build(group, level)}
                      disabled={busyGroup === group.group_name}
                    >
                      {busyGroup === group.group_name ? 'Building…' : 'Build plan'}
                    </Button>
                  </div>
                </div>

                {response && (
                  <div className="mt-4 border-t border-ink/10 pt-4">
                    {/* Deterministic facts and an AI recommendation must not
                        look alike. A teacher who reads a suggestion as an
                        assigned level is the failure this page exists to
                        prevent. */}
                    <div className="mb-5 rounded-xl border border-ink/10 bg-page p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="neutral">Verified TaRL level</Badge>
                        <span className="text-sm font-bold">
                          {levelLabel(response.verified_level)}
                        </span>
                        <span className="text-xs text-ink-soft">
                          set by assessment, not by AI
                        </span>
                      </div>
                      <div className="mt-3 grid gap-4 sm:grid-cols-2">
                        <div>
                          <h4 className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
                            Curriculum scope
                          </h4>
                          <ul className="mt-1.5 list-disc pl-5 text-sm">
                            {response.curriculum_objectives.map((o) => (
                              <li key={o}>{o}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
                            How this level was diagnosed
                          </h4>
                          <p className="mt-1.5 text-sm">
                            {response.curriculum_assessment_criteria}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge tone="ai">AI recommendation</Badge>
                      <span className="text-xs text-ink-soft">
                        from {response.generated_from_student_ids.length} learners
                        {' · '}
                        {response.evidence_count} assessment records
                      </span>
                    </div>

                    <h3 className="text-lg font-bold">{response.plan.title}</h3>
                    <p className="text-xs text-ink-soft">
                      {response.plan.duration_minutes} minutes
                    </p>

                    <div className="mt-4 grid gap-5 sm:grid-cols-2">
                      <div>
                        <h4 className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
                          Objectives
                        </h4>
                        <ul className="mt-2 list-disc pl-5 text-sm">
                          {response.plan.objectives.map((o) => (
                            <li key={o}>{o}</li>
                          ))}
                        </ul>

                        <h4 className="mt-4 text-xs font-semibold tracking-wide text-ink-soft uppercase">
                          Skills
                        </h4>
                        <p className="mt-1 text-sm">{response.plan.skills.join(' · ')}</p>

                        <h4 className="mt-4 text-xs font-semibold tracking-wide text-ink-soft uppercase">
                          Activities
                        </h4>
                        <ul className="mt-2 list-disc pl-5 text-sm">
                          {response.plan.activities.map((a) => (
                            <li key={a}>{a}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        {response.plan.differentiation.length > 0 && (
                          <>
                            <h4 className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
                              Differentiation
                            </h4>
                            <ul className="mt-2 list-disc pl-5 text-sm">
                              {response.plan.differentiation.map((d) => (
                                <li key={d}>{d}</li>
                              ))}
                            </ul>
                          </>
                        )}

                        {response.plan.teacher_prompts.length > 0 && (
                          <>
                            <h4 className="mt-4 text-xs font-semibold tracking-wide text-ink-soft uppercase">
                              What to say
                            </h4>
                            <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                              {response.plan.teacher_prompts.map((p) => (
                                <li key={p} className="italic">“{p}”</li>
                              ))}
                            </ul>
                          </>
                        )}

                        <h4 className="mt-4 text-xs font-semibold tracking-wide text-ink-soft uppercase">
                          End-of-lesson check
                        </h4>
                        <p className="mt-1 text-sm">{response.plan.assessment_criteria}</p>
                      </div>
                    </div>

                    <details className="mt-4">
                      <summary className="cursor-pointer text-xs text-ink-soft">
                        Why the AI suggested this
                      </summary>
                      <p className="mt-2 rounded-lg bg-page p-3 text-sm">
                        {response.plan.rationale}
                      </p>
                    </details>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
