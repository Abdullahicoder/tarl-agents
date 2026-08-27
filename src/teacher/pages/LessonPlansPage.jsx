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
        description="One plan per group, built from the TaRL curriculum for that group's level. The objectives and activities are fixed by the curriculum; only the tutor prompt is AI-facing."
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
            const plan = plans[group.group_name]
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

                {plan && (
                  <div className="mt-4 grid gap-5 border-t border-ink/10 pt-4 sm:grid-cols-2">
                    <div>
                      <h3 className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
                        Objectives
                      </h3>
                      <ul className="mt-2 list-disc pl-5 text-sm">
                        {plan.objectives.map((objective) => (
                          <li key={objective}>{objective}</li>
                        ))}
                      </ul>
                      <h3 className="mt-4 text-xs font-semibold tracking-wide text-ink-soft uppercase">
                        Skills
                      </h3>
                      <p className="mt-1 text-sm">{plan.skills.join(' · ')}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
                        Activities
                      </h3>
                      <ul className="mt-2 list-disc pl-5 text-sm">
                        {plan.activities.map((activity) => (
                          <li key={activity}>{activity}</li>
                        ))}
                      </ul>
                      <h3 className="mt-4 text-xs font-semibold tracking-wide text-ink-soft uppercase">
                        You will know they are ready when
                      </h3>
                      <p className="mt-1 text-sm">{plan.assessment_criteria}</p>
                    </div>
                    <details className="sm:col-span-2">
                      <summary className="cursor-pointer text-xs text-ink-soft">
                        Tutor prompt sent to the AI for this group
                      </summary>
                      <pre className="mt-2 overflow-x-auto rounded-lg bg-page p-3 text-xs whitespace-pre-wrap">
                        {plan.tutor_prompt}
                      </pre>
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
