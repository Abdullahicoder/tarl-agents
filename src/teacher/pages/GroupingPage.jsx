import { useEffect, useMemo, useState } from 'react'
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
  LevelChip,
  LevelSelect,
  Loading,
  PageHeader,
  Select,
  TextInput,
} from '../components/ui'
import { SUBJECTS } from '../../shared/levels'

const UNASSIGNED = '__unassigned__'

export default function GroupingPage() {
  const { classId } = useParams()
  const api = useTeacherApi()

  const [subject, setSubject] = useState('numeracy')
  const students = useAsync(() => api.listStudents(classId), [api, classId])
  const saved = useAsync(() => api.getGrouping(classId, subject), [api, classId, subject])

  const [groups, setGroups] = useState(null)
  const [summary, setSummary] = useState('')
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)
  const [actionError, setActionError] = useState(null)

  // Adopt the saved plan when one exists; a generated plan replaces it in state
  // only, never on the server, until the teacher saves.
  useEffect(() => {
    if (saved.data) {
      setGroups(saved.data.groups)
      setSummary(saved.data.teacher_summary ?? '')
      setDirty(false)
    }
  }, [saved.data])

  const byId = useMemo(
    () => Object.fromEntries((students.data ?? []).map((s) => [s.id, s])),
    [students.data],
  )

  const placed = new Set((groups ?? []).flatMap((g) => g.student_ids))
  const unassigned = (students.data ?? []).filter((s) => !placed.has(s.id))

  const subjectLevels = subject === 'numeracy' ? 'numeracy' : 'literacy'

  const levelOf = (student) =>
    subject === 'numeracy'
      ? student.numeracy_level
      : subject === 'english'
        ? student.english_literacy_level
        : student.swahili_literacy_level

  const generate = async () => {
    setBusy(true)
    setActionError(null)
    setStatus(null)
    try {
      const plan = await api.generateGrouping(classId, subject)
      setGroups(plan.groups)
      setSummary(plan.teacher_summary ?? '')
      setDirty(true)
      setStatus('Recommendation ready — review it before saving.')
    } catch (err) {
      setActionError(err)
    } finally {
      setBusy(false)
    }
  }

  const save = async () => {
    setBusy(true)
    setActionError(null)
    try {
      await api.saveGrouping(classId, { subject, groups, teacher_summary: summary })
      setDirty(false)
      setStatus('Grouping saved.')
      saved.reload().catch(() => {})
    } catch (err) {
      setActionError(err)
    } finally {
      setBusy(false)
    }
  }

  const move = (studentId, toIndex) => {
    setGroups((current) => {
      const next = current.map((g) => ({
        ...g,
        student_ids: g.student_ids.filter((id) => id !== studentId),
      }))
      if (toIndex !== UNASSIGNED) next[Number(toIndex)].student_ids.push(studentId)
      return next
    })
    setDirty(true)
  }

  const patchGroup = (index, patch) => {
    setGroups((current) => current.map((g, i) => (i === index ? { ...g, ...patch } : g)))
    setDirty(true)
  }

  const addGroup = () => {
    setGroups((current) => [
      ...(current ?? []),
      {
        group_name: `Group ${(current?.length ?? 0) + 1}`,
        student_ids: [],
        focus_literacy: null,
        focus_numeracy: null,
        rationale: null,
      },
    ])
    setDirty(true)
  }

  const removeGroup = (index) => {
    setGroups((current) => current.filter((_, i) => i !== index))
    setDirty(true)
  }

  const groupOptions = [
    ...(groups ?? []).map((g, i) => ({ value: String(i), label: g.group_name })),
    { value: UNASSIGNED, label: 'Unassigned' },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Class"
        title="Group by instructional level"
        description="Gemini proposes groups from each student's current level. Nothing is saved until you save it — and you can change any group first."
        actions={
          <>
            <Button variant="secondary" onClick={generate} disabled={busy}>
              {busy ? 'Working…' : groups ? 'Regenerate' : 'Generate with AI'}
            </Button>
            <Button onClick={save} disabled={busy || !groups || !dirty}>
              Save grouping
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="w-56">
          <Field label="Subject">
            <Select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              options={SUBJECTS.map((s) => ({ value: s.value, label: s.label }))}
            />
          </Field>
        </div>
        {saved.data && !dirty && (
          <Badge tone={saved.data.edited_by_teacher ? 'teacher' : 'ai'}>
            {saved.data.edited_by_teacher ? 'Saved by teacher' : 'AI generated'} ·{' '}
            {new Date(saved.data.generated_at).toLocaleDateString()}
          </Badge>
        )}
        {dirty && <Badge tone="warn">Unsaved changes</Badge>}
      </div>

      {status && (
        <p role="status" className="mb-4 text-sm font-semibold text-mint-ink">
          {status}
        </p>
      )}
      <ErrorNote error={actionError} />
      {students.loading && <Loading label="Loading students…" />}
      <ErrorNote error={students.error} onRetry={students.reload} />

      {!groups && !students.loading && (
        <EmptyState
          title="No grouping yet"
          description="Generate a recommendation, then move any student who is in the wrong group."
          action={
            <Button onClick={generate} disabled={busy}>
              Generate with AI
            </Button>
          }
        />
      )}

      {groups && (
        <>
          {summary && (
            <Card className="mb-6 border-lilac-ink/20 bg-lilac-tile/40">
              <div className="flex items-start gap-3">
                <Badge tone="ai">AI summary</Badge>
                <p className="text-sm">{summary}</p>
              </div>
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {groups.map((group, index) => (
              <Card key={index}>
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex-1">
                    <TextInput
                      value={group.group_name}
                      aria-label={`Name of group ${index + 1}`}
                      onChange={(e) => patchGroup(index, { group_name: e.target.value })}
                    />
                  </div>
                  <Button variant="ghost" onClick={() => removeGroup(index)}>
                    Remove
                  </Button>
                </div>

                <div className="mb-3">
                  <Field label="Teaching focus">
                    <LevelSelect
                      subject={subjectLevels}
                      value={
                        (subject === 'numeracy'
                          ? group.focus_numeracy
                          : group.focus_literacy) ?? 'Beginner'
                      }
                      onChange={(e) =>
                        patchGroup(
                          index,
                          subject === 'numeracy'
                            ? { focus_numeracy: e.target.value }
                            : { focus_literacy: e.target.value },
                        )
                      }
                    />
                  </Field>
                </div>

                {group.rationale && (
                  <p className="mb-3 text-xs text-ink-soft italic">{group.rationale}</p>
                )}

                <ul className="flex flex-col">
                  {group.student_ids.map((id) => {
                    const student = byId[id]
                    if (!student) return null
                    return (
                      <li
                        key={id}
                        className="flex items-center gap-3 border-t border-ink/10 py-2"
                      >
                        <span className="flex-1 text-sm font-semibold">{student.name}</span>
                        <LevelChip level={levelOf(student)} subject={subjectLevels} />
                        <div className="w-36">
                          <Select
                            aria-label={`Move ${student.name}`}
                            value={String(index)}
                            onChange={(e) => move(id, e.target.value)}
                            options={groupOptions}
                          />
                        </div>
                      </li>
                    )
                  })}
                  {group.student_ids.length === 0 && (
                    <li className="py-3 text-sm text-ink-soft">No students in this group.</li>
                  )}
                </ul>
              </Card>
            ))}
          </div>

          <div className="mt-4 flex justify-start">
            <Button variant="secondary" onClick={addGroup}>
              Add a group
            </Button>
          </div>

          {unassigned.length > 0 && (
            <Card className="mt-6 border-lemon-ink/25 bg-lemon-tile/30">
              <h2 className="mb-2 text-sm font-bold">
                Not in any group ({unassigned.length})
              </h2>
              <ul className="flex flex-col">
                {unassigned.map((student) => (
                  <li
                    key={student.id}
                    className="flex items-center gap-3 border-t border-ink/10 py-2"
                  >
                    <span className="flex-1 text-sm font-semibold">{student.name}</span>
                    <LevelChip level={levelOf(student)} subject={subjectLevels} />
                    <div className="w-36">
                      <Select
                        aria-label={`Place ${student.name}`}
                        value={UNASSIGNED}
                        onChange={(e) => move(student.id, e.target.value)}
                        options={groupOptions}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </>
  )
}
