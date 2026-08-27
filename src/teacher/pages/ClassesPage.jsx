import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTeacherApi } from '../api'
import { useAsync } from '../../shared/useAsync'
import {
  Button,
  Card,
  EmptyState,
  ErrorNote,
  Field,
  Loading,
  NumberInput,
  PageHeader,
  TextInput,
} from '../components/ui'

export default function ClassesPage() {
  const api = useTeacherApi()
  const { data, error, loading, reload, setData } = useAsync(() => api.listClasses(), [api])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', school: '', grade: '' })
  const [submitError, setSubmitError] = useState(null)
  const [saving, setSaving] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setSubmitError(null)
    try {
      const created = await api.createClass({
        name: form.name.trim(),
        school: form.school.trim() || null,
        grade: form.grade ? Number(form.grade) : null,
      })
      setData((classes) => [...(classes ?? []), created])
      setForm({ name: '', school: '', grade: '' })
      setCreating(false)
    } catch (err) {
      setSubmitError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Teacher"
        title="Your classes"
        description="Only classes you are assigned to appear here. The server checks this on every request."
        actions={
          <Button onClick={() => setCreating((v) => !v)}>
            {creating ? 'Cancel' : 'New class'}
          </Button>
        }
      />

      {creating && (
        <Card className="mb-6">
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-3">
            <Field label="Class name">
              <TextInput
                required
                value={form.name}
                placeholder="Grade 3 — Kiawara Primary"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="School">
              <TextInput
                value={form.school}
                onChange={(e) => setForm({ ...form, school: e.target.value })}
              />
            </Field>
            <Field label="Grade">
              <NumberInput
                min="1"
                max="12"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-3 flex items-center gap-3">
              <Button type="submit" disabled={saving || !form.name.trim()}>
                {saving ? 'Creating…' : 'Create class'}
              </Button>
              {submitError && <ErrorNote error={submitError} />}
            </div>
          </form>
        </Card>
      )}

      {loading && <Loading label="Loading your classes…" />}
      <ErrorNote error={error} onRetry={reload} />

      {data && data.length === 0 && (
        <EmptyState
          title="No classes yet"
          description="Create a class, then add the students you assess."
          action={<Button onClick={() => setCreating(true)}>New class</Button>}
        />
      )}

      {data && data.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((classroom) => (
            <li key={classroom.id}>
              <Link
                to={`/teacher/classes/${classroom.id}`}
                className="block h-full rounded-2xl border border-ink/10 bg-stage p-5 transition hover:border-sky-ink/40"
              >
                <p className="text-base font-bold">{classroom.name}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  {[classroom.school, classroom.grade && `Grade ${classroom.grade}`]
                    .filter(Boolean)
                    .join(' · ') || 'No school set'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
