import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTeacherApi } from '../api'
import { useAsync } from '../../shared/useAsync'
import DistributionChart from '../components/DistributionChart'
import {
  Button,
  Card,
  EmptyState,
  ErrorNote,
  Field,
  LevelChip,
  LevelSelect,
  Loading,
  NumberInput,
  PageHeader,
  TextInput,
} from '../components/ui'

const BLANK_STUDENT = {
  name: '',
  age: '',
  english_literacy_level: 'Beginner',
  swahili_literacy_level: 'Beginner',
  numeracy_level: 'Beginner',
}

export default function ClassPage() {
  const { classId } = useParams()
  const api = useTeacherApi()

  const classroom = useAsync(() => api.getClass(classId), [api, classId])
  const students = useAsync(() => api.listStudents(classId), [api, classId])
  const distribution = useAsync(() => api.getDistribution(classId), [api, classId])

  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(BLANK_STUDENT)
  const [saving, setSaving] = useState(false)
  const [addError, setAddError] = useState(null)

  const addStudent = async (event) => {
    event.preventDefault()
    setSaving(true)
    setAddError(null)
    try {
      const created = await api.addStudent(classId, {
        ...form,
        name: form.name.trim(),
        age: Number(form.age),
      })
      students.setData((list) => [...(list ?? []), created])
      distribution.reload().catch(() => {})
      setForm(BLANK_STUDENT)
      setAdding(false)
    } catch (err) {
      setAddError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Class"
        title={classroom.data?.name ?? 'Class'}
        description={
          classroom.data
            ? [classroom.data.school, classroom.data.grade && `Grade ${classroom.data.grade}`]
                .filter(Boolean)
                .join(' · ')
            : undefined
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setAdding((v) => !v)}>
              {adding ? 'Cancel' : 'Add student'}
            </Button>
            <Link to={`/teacher/classes/${classId}/grouping`}>
              <Button>Group by level</Button>
            </Link>
          </>
        }
      />

      <ErrorNote error={classroom.error} onRetry={classroom.reload} />

      {adding && (
        <Card className="mb-6">
          <form onSubmit={addStudent} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Field label="Name">
              <TextInput
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Age">
              <NumberInput
                required
                min="3"
                max="25"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </Field>
            <Field label="English" hint="Starting level — assess to confirm">
              <LevelSelect
                subject="literacy"
                value={form.english_literacy_level}
                onChange={(e) =>
                  setForm({ ...form, english_literacy_level: e.target.value })
                }
              />
            </Field>
            <Field label="Kiswahili">
              <LevelSelect
                subject="literacy"
                value={form.swahili_literacy_level}
                onChange={(e) =>
                  setForm({ ...form, swahili_literacy_level: e.target.value })
                }
              />
            </Field>
            <Field label="Numeracy">
              <LevelSelect
                subject="numeracy"
                value={form.numeracy_level}
                onChange={(e) => setForm({ ...form, numeracy_level: e.target.value })}
              />
            </Field>
            <div className="flex items-center gap-3 lg:col-span-5">
              <Button type="submit" disabled={saving || !form.name.trim() || !form.age}>
                {saving ? 'Adding…' : 'Add student'}
              </Button>
              {addError && <ErrorNote error={addError} />}
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-ink/10 px-5 py-4">
            <h2 className="text-sm font-bold">Roster</h2>
            <p className="mt-0.5 text-xs text-ink-soft">
              Levels shown are the ones in force — a teacher override replaces the
              engine&apos;s recommendation.
            </p>
          </div>

          {students.loading && <Loading label="Loading students…" />}
          <ErrorNote error={students.error} onRetry={students.reload} />

          {students.data?.length === 0 && (
            <EmptyState
              title="No students in this class"
              description="Add students before assessing or grouping them."
            />
          )}

          {students.data?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-page text-xs text-ink-soft">
                  <tr>
                    <th scope="col" className="px-5 py-2.5 font-semibold">Student</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Age</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">English</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Kiswahili</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Numeracy</th>
                    <th scope="col" className="px-5 py-2.5 font-semibold">Assessed</th>
                  </tr>
                </thead>
                <tbody>
                  {students.data.map((student) => (
                    <tr key={student.id} className="border-t border-ink/10">
                      <td className="px-5 py-3">
                        <Link
                          to={`/teacher/students/${student.id}`}
                          className="font-semibold text-sky-ink hover:underline"
                        >
                          {student.name}
                        </Link>
                      </td>
                      <td className="px-3 py-3 tabular-nums">{student.age}</td>
                      <td className="px-3 py-3">
                        <LevelChip level={student.english_literacy_level} />
                      </td>
                      <td className="px-3 py-3">
                        <LevelChip level={student.swahili_literacy_level} />
                      </td>
                      <td className="px-3 py-3">
                        <LevelChip level={student.numeracy_level} subject="numeracy" />
                      </td>
                      <td className="px-5 py-3 text-xs text-ink-soft">
                        {student.last_assessed_at
                          ? new Date(student.last_assessed_at).toLocaleDateString()
                          : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-bold">Where the class sits</h2>
          {distribution.loading && <Loading label="Calculating…" />}
          <ErrorNote error={distribution.error} onRetry={distribution.reload} />
          {distribution.data && (
            <div className="flex flex-col gap-7">
              <DistributionChart
                title="English literacy"
                counts={distribution.data.english}
                total={distribution.data.student_count}
              />
              <DistributionChart
                title="Kiswahili literacy"
                counts={distribution.data.swahili}
                total={distribution.data.student_count}
              />
              <DistributionChart
                title="Numeracy"
                counts={distribution.data.numeracy}
                total={distribution.data.student_count}
              />
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
