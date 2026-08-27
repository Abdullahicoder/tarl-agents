/**
 * Teacher API surface.
 *
 * Production:
 *   Uses authenticated FastAPI endpoints.
 *
 * Demo:
 *   Uses isolated local sample data and never sends the fake demo identity
 *   to the backend.
 */

import { useMemo } from 'react'
import { createApiClient } from '../shared/apiClient'
import { useAuth } from '../shared/auth'
import { DEMO_MODE } from '../shared/demoMode'
import { DEMO_CLASS, DEMO_STUDENTS, DEMO_ASSESSMENTS, DEMO_GROUPING, DEMO_LESSON_PLAN, getDemoDistribution, getDemoStudent } from './demoData'

function demoResult(data) {
  return Promise.resolve(data)
}

function createDemoTeacherApi() {
  return {
    listClasses: () =>
      demoResult([DEMO_CLASS]),

    createClass: (body) =>
      demoResult({
        ...DEMO_CLASS,
        ...body,
        id: `demo-class-${Date.now()}`,
      }),

    getClass: (classId) =>
      demoResult({
        ...DEMO_CLASS,
        id: classId,
      }),

    listStudents: () =>
      demoResult(DEMO_STUDENTS),

    addStudent: (_classId, body) =>
      demoResult({
        id: `demo-student-${Date.now()}`,
        name: body.name,
        age: body.age,
        literacy_level: body.literacy_level ?? 'Beginner',
        numeracy_level: body.numeracy_level ?? 'Beginner',
      }),

    getStudent: (studentId) =>
      demoResult(getDemoStudent(studentId)),

    listAssessments: (studentId) =>
      demoResult(DEMO_ASSESSMENTS[studentId] ?? []),

    recommendLevels: (studentId) => {
      const student = getDemoStudent(studentId)

      return demoResult({
        student_id: studentId,
        recommended_literacy_level:
          student?.literacy_level ?? 'Beginner',
        recommended_numeracy_level:
          student?.numeracy_level ?? 'Beginner',
        feedback_english:
          'This is a demo assessment recommendation. Review the student evidence before making a final decision.',
        feedback_swahili:
          'Hili ni pendekezo la tathmini la majaribio. Kagua ushahidi wa mwanafunzi kabla ya kufanya uamuzi wa mwisho.',
      })
    },

    recordAssessment: (studentId, decision) =>
      demoResult({
        ...decision,
        id: `demo-assessment-${Date.now()}`,
        student_id: studentId,
        teacher_overridden: true,
        demo: true,
      }),

    getDistribution: () =>
      demoResult(getDemoDistribution()),

    generateGrouping: () =>
      demoResult(DEMO_GROUPING),

    getGrouping: () =>
      demoResult(DEMO_GROUPING),

    saveGrouping: (_classId, body) =>
      demoResult({
        ...DEMO_GROUPING,
        ...body,
        edited_by_teacher: true,
        demo: true,
      }),

    buildLessonPlan: () =>
      demoResult({
        ...DEMO_LESSON_PLAN,
        demo: true,
      }),
  }
}

export function createTeacherApi(request) {
  return {
    // classes
    listClasses: () => request('/teacher/classes'),
    createClass: (body) =>
      request('/teacher/classes', { method: 'POST', body }),
    getClass: (classId) =>
      request(`/teacher/classes/${classId}`),

    // students
    listStudents: (classId) =>
      request(`/teacher/classes/${classId}/students`),
    addStudent: (classId, body) =>
      request(`/teacher/classes/${classId}/students`, {
        method: 'POST',
        body,
      }),
    getStudent: (studentId) =>
      request(`/teacher/students/${studentId}`),
    listAssessments: (studentId) =>
      request(`/teacher/students/${studentId}/assessments`),

    // assessment
    recommendLevels: (studentId, raw) =>
      request(`/teacher/students/${studentId}/assessments/recommend`, {
        method: 'POST',
        body: raw,
      }),

    recordAssessment: (studentId, decision) =>
      request(`/teacher/students/${studentId}/assessments`, {
        method: 'POST',
        body: decision,
      }),

    // classroom
    getDistribution: (classId) =>
      request(`/teacher/classes/${classId}/distribution`),

    // grouping
    generateGrouping: (classId, subject) =>
      request(`/teacher/classes/${classId}/grouping/generate`, {
        method: 'POST',
        query: { subject },
      }),

    getGrouping: (classId, subject) =>
      request(`/teacher/classes/${classId}/grouping`, {
        query: { subject },
      }),

    saveGrouping: (classId, body) =>
      request(`/teacher/classes/${classId}/grouping`, {
        method: 'PUT',
        body,
      }),

    // lesson plan
    buildLessonPlan: (classId, body) =>
      request(`/teacher/classes/${classId}/lesson-plan`, {
        method: 'POST',
        body,
      }),
  }
}

export function useTeacherApi() {
  const { getToken } = useAuth()

  return useMemo(() => {
    if (DEMO_MODE) {
      return createDemoTeacherApi()
    }

    return createTeacherApi(createApiClient(getToken))
  }, [getToken])
}
