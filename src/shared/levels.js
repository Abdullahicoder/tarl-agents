/**
 * Frontend mirror of the canonical TaRL taxonomy.
 *
 * The VALUES here are wire values — they must stay byte-identical to the enum
 * values in `shared/models/models.py`. Labels are display-only and may be
 * translated freely.
 */

export const LITERACY_LEVELS = ['Beginner', 'Letter', 'Word', 'Paragraph', 'Story']

export const NUMERACY_LEVELS = [
  'Beginner',
  '1-Digit Number',
  '2-Digit Number',
  'Addition',
  'Subtraction',
  'Multiplication',
  'Division',
]

export const LEVEL_LABELS = {
  Beginner: { en: 'Beginner', sw: 'Mwanzo' },
  Letter: { en: 'Letter', sw: 'Herufi' },
  Word: { en: 'Word', sw: 'Neno' },
  Paragraph: { en: 'Paragraph', sw: 'Aya' },
  Story: { en: 'Story', sw: 'Hadithi' },
  '1-Digit Number': { en: '1-digit', sw: 'Tarakimu moja' },
  '2-Digit Number': { en: '2-digit', sw: 'Tarakimu mbili' },
  Addition: { en: 'Addition', sw: 'Kujumlisha' },
  Subtraction: { en: 'Subtraction', sw: 'Kutoa' },
  Multiplication: { en: 'Multiplication', sw: 'Kuzidisha' },
  Division: { en: 'Division', sw: 'Kugawanya' },
}

export function levelLabel(level, lang = 'en') {
  return LEVEL_LABELS[level]?.[lang] ?? level
}

/** 0 = furthest behind. Used for ordering and for the ramp colour. */
export function literacyRank(level) {
  return Math.max(0, LITERACY_LEVELS.indexOf(level))
}

export function numeracyRank(level) {
  return Math.max(0, NUMERACY_LEVELS.indexOf(level))
}

export const SUBJECTS = [
  { value: 'english', label: 'English literacy', levels: LITERACY_LEVELS },
  { value: 'swahili', label: 'Kiswahili literacy', levels: LITERACY_LEVELS },
  { value: 'numeracy', label: 'Numeracy', levels: NUMERACY_LEVELS },
]
