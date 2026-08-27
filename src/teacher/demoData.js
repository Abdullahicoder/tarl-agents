export const DEMO_CLASS = {
  id: 'demo-class-4a',
  name: 'Class 4A',
  grade: 4,
  studentCount: 32,
  teacherId: 'demo-teacher',
}

const LITERACY_LEVELS = [
  'Beginner',
  'Letter',
  'Word',
  'Paragraph',
  'Story',
]

const NUMERACY_LEVELS = [
  'Beginner',
  '1-Digit Number',
  '2-Digit Number',
  'Addition',
  'Subtraction',
]

export const DEMO_STUDENTS = [
  {
    id: 'student-amina',
    name: 'Amina Hassan',
    age: 9,
    literacy_level: 'Word',
    numeracy_level: 'Addition',
  },
  {
    id: 'student-brian',
    name: 'Brian Otieno',
    age: 8,
    literacy_level: 'Letter',
    numeracy_level: '1-Digit Number',
  },
  {
    id: 'student-neema',
    name: 'Neema Ali',
    age: 10,
    literacy_level: 'Paragraph',
    numeracy_level: 'Subtraction',
  },
  {
    id: 'student-yusuf',
    name: 'Yusuf Omar',
    age: 9,
    literacy_level: 'Word',
    numeracy_level: '2-Digit Number',
  },
  {
    id: 'student-fatuma',
    name: 'Fatuma Noor',
    age: 9,
    literacy_level: 'Letter',
    numeracy_level: 'Addition',
  },
  {
    id: 'student-hamisi',
    name: 'Hamisi Juma',
    age: 10,
    literacy_level: 'Story',
    numeracy_level: 'Subtraction',
  },
  {
    id: 'student-aisha',
    name: 'Aisha Said',
    age: 8,
    literacy_level: 'Beginner',
    numeracy_level: 'Beginner',
  },
  {
    id: 'student-daniel',
    name: 'Daniel Mwangi',
    age: 9,
    literacy_level: 'Word',
    numeracy_level: 'Addition',
  },
  {
    id: 'student-zawadi',
    name: 'Zawadi Mussa',
    age: 10,
    literacy_level: 'Paragraph',
    numeracy_level: '2-Digit Number',
  },
  {
    id: 'student-samuel',
    name: 'Samuel Kariuki',
    age: 9,
    literacy_level: 'Letter',
    numeracy_level: '1-Digit Number',
  },
  {
    id: 'student-hawa',
    name: 'Hawa Abdullahi',
    age: 8,
    literacy_level: 'Word',
    numeracy_level: 'Addition',
  },
  {
    id: 'student-musa',
    name: 'Musa Said',
    age: 10,
    literacy_level: 'Paragraph',
    numeracy_level: 'Subtraction',
  },
]

export const DEMO_ASSESSMENTS = {
  'student-amina': [
    {
      id: 'assessment-amina-1',
      student_id: 'student-amina',
      created_at: '2026-08-26T09:00:00Z',
      observation:
        'Amina identifies most letters and reads common words but hesitates with unfamiliar words.',
      recommended_literacy_level: 'Word',
      recommended_numeracy_level: 'Addition',
      feedback_english:
        'Amina is progressing well with common words. Continue word reading and simple sentence practice.',
      feedback_swahili:
        'Amina anaendelea vizuri katika kusoma maneno ya kawaida. Endelea na mazoezi ya maneno na sentensi rahisi.',
      teacher_note: 'Continue word blending practice.',
      teacher_overridden: false,
    },
  ],
}

export const DEMO_GROUPING = {
  id: 'grouping-demo-4a',
  class_id: DEMO_CLASS.id,
  status: 'recommended',
  edited_by_teacher: false,
  teacher_summary:
    'Students are grouped according to current literacy and numeracy levels so the teacher can target instruction more effectively.',
  groups: [
    {
      id: 'group-a',
      group_name: 'Group A',
      focus_area: 'Letter recognition',
      recommended_activity: 'Letter recognition and phonics games.',
      student_ids: [
        'student-brian',
        'student-fatuma',
        'student-samuel',
      ],
    },
    {
      id: 'group-b',
      group_name: 'Group B',
      focus_area: 'Word reading',
      recommended_activity: 'Common-word reading and blending practice.',
      student_ids: [
        'student-amina',
        'student-yusuf',
        'student-daniel',
        'student-hawa',
      ],
    },
    {
      id: 'group-c',
      group_name: 'Group C',
      focus_area: 'Paragraph reading',
      recommended_activity: 'Fluent passage reading and vocabulary building.',
      student_ids: [
        'student-neema',
        'student-zawadi',
        'student-musa',
      ],
    },
    {
      id: 'group-d',
      group_name: 'Group D',
      focus_area: 'Story reading',
      recommended_activity: 'Story reading and comprehension.',
      student_ids: ['student-hamisi'],
    },
    {
      id: 'group-e',
      group_name: 'Foundation',
      focus_area: 'Letter recognition and phonics',
      recommended_activity: 'Letter sounds and foundational literacy activities.',
      student_ids: ['student-aisha'],
    },
  ],
}

export const DEMO_LESSON_PLAN = {
  class_id: 'c1',
  subject: 'numeracy',
  target_level: 'Beginner',
  group_name: 'Counting & number sense',
  objectives: [
    'Count and compare quantities of real objects up to 20.',
    'Match a spoken number to a written digit.',
  ],
  skills: [
    'One-to-one correspondence',
    'Number recognition',
  ],
  activities: [
    'Count bottle tops into groups of five.',
    'Match quantities of objects to written digits.',
    'Play number-line hopscotch drawn in the yard.',
  ],
  assessment_criteria:
    'Counts 20 objects accurately and names each digit shown.',
  tutor_prompt:
    'Create a practical 45-minute numeracy lesson for a TaRL Beginner group. Focus on counting concrete objects, quantity comparison, and connecting quantities to written digits. Differentiate support for learners who are still working with concrete objects.',
  duration_minutes: 45,
}

export function getDemoDistribution(students = DEMO_STUDENTS) {
  return {
    class_id: DEMO_CLASS.id,
    student_count: students.length,
    english: LITERACY_LEVELS.map((level) => ({
      level,
      count: students.filter(
        (student) => student.english_literacy_level === level,
      ).length,
    })),
    swahili: LITERACY_LEVELS.map((level) => ({
      level,
      count: students.filter(
        (student) => student.swahili_literacy_level === level,
      ).length,
    })),
    numeracy: [
      'Beginner',
      '1-Digit Number',
      '2-Digit Number',
      'Addition',
      'Subtraction',
      'Multiplication',
      'Division',
    ].map((level) => ({
      level,
      count: students.filter(
        (student) => student.numeracy_level === level,
      ).length,
    })),
  }
}

export function getDemoStudent(studentId) {
  return DEMO_STUDENTS.find((student) => student.id === studentId) ?? null
}
