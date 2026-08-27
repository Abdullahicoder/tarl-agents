/**
 * MOCK CURRICULUM — visual-development data only.
 *
 * This module is deliberately isolated so that `src/data/api.js` can be
 * pointed at the real Cloud Run / Firestore backend without touching any
 * presentational component. Do not import it directly from a component;
 * always go through `api.js`.
 *
 * Level keys are the CANONICAL WIRE VALUES from `src/shared/levels.js`, which
 * mirrors `shared/models/models.py`. They are not a second taxonomy.
 */

import {
  LITERACY_LEVELS,
  NUMERACY_LEVELS,
  LEVEL_LABELS,
} from '../shared/levels'

export { LITERACY_LEVELS, NUMERACY_LEVELS, LEVEL_LABELS }

/* ------------------------------------------------------------------ */
/* Literacy item banks, keyed by TaRL level                            */
/* ------------------------------------------------------------------ */

const literacyBank = {
  Beginner: [
    {
      type: 'LETTER_SOUND',
      prompt: { en: 'Tap the letter that says "m"', sw: 'Gusa herufi inayosema "m"' },
      say: { en: 'm', sw: 'm' },
      options: ['m', 'a', 's'],
      correct: 'm',
    },
    {
      type: 'LETTER_SOUND',
      prompt: { en: 'Tap the letter that says "a"', sw: 'Gusa herufi inayosema "a"' },
      say: { en: 'a', sw: 'a' },
      options: ['t', 'a', 'k'],
      correct: 'a',
    },
  ],
  Letter: [
    {
      type: 'LETTER_SOUND',
      prompt: { en: 'Find the letter K', sw: 'Tafuta herufi K' },
      say: { en: 'K', sw: 'K' },
      options: ['k', 'b', 'd', 'p'],
      correct: 'k',
    },
    {
      type: 'BUILD_WORD',
      prompt: { en: 'Build the word "mti"', sw: 'Tunga neno "mti"' },
      say: { en: 'mti — tree', sw: 'mti' },
      word: 'mti',
      pool: ['m', 't', 'i', 'a', 'k'],
    },
    {
      type: 'TRACE',
      prompt: { en: "Trace the letter 'a'", sw: "Fuatilia herufi 'a'" },
      glyph: 'a',
    },
  ],
  Word: [
    {
      type: 'WORD_PICTURE',
      prompt: { en: 'Which picture is "kuku"?', sw: 'Picha gani ni "kuku"?' },
      say: { en: 'kuku — chicken', sw: 'kuku' },
      options: [
        { id: 'chicken', art: 'chicken', label: 'kuku' },
        { id: 'tree', art: 'tree', label: 'mti' },
        { id: 'cup', art: 'cup', label: 'chai' },
      ],
      correct: 'chicken',
    },
    {
      type: 'BUILD_WORD',
      prompt: { en: 'Build the word "chai"', sw: 'Tunga neno "chai"' },
      say: { en: 'chai — tea', sw: 'chai' },
      word: 'chai',
      pool: ['c', 'h', 'a', 'i', 'u', 'k'],
    },
    {
      type: 'WORD_PICTURE',
      prompt: { en: 'Which picture is "mti"?', sw: 'Picha gani ni "mti"?' },
      say: { en: 'mti — tree', sw: 'mti' },
      options: [
        { id: 'cup', art: 'cup', label: 'chai' },
        { id: 'tree', art: 'tree', label: 'mti' },
        { id: 'chicken', art: 'chicken', label: 'kuku' },
      ],
      correct: 'tree',
    },
  ],
  Paragraph: [
    {
      type: 'FILL_PHRASE',
      prompt: { en: 'Complete the phrase', sw: 'Kamilisha sentensi' },
      before: 'Bata na',
      after: 'wanacheza.',
      options: ['kuku', 'kima'],
      correct: 'kuku',
    },
  ],
  Story: [
    {
      type: 'STORY',
      title: { en: 'The Wise Tortoise', sw: 'Kobe Mwerevu' },
      body: {
        en: 'Long ago the forest pool dried up. Every animal was thirsty. A small tortoise walked slowly to the hill and found new water under a flat stone. She called all the animals, and nobody went thirsty again.',
        sw: 'Hapo zamani za kale dimbwi la msituni lilikauka. Kila mnyama alikuwa na kiu. Kobe mdogo alitembea taratibu hadi kilimani na akapata maji mapya chini ya jiwe bapa. Aliwaita wanyama wote, na hakuna aliyekuwa na kiu tena.',
      },
      question: {
        en: 'Who found the water?',
        sw: 'Nani alipata maji?',
      },
      options: {
        en: ['The tortoise', 'The chicken', 'The duck'],
        sw: ['Kobe', 'Kuku', 'Bata'],
      },
      correctIndex: 0,
    },
  ],
}

/* ------------------------------------------------------------------ */
/* Numeracy item banks, keyed by TaRL level                            */
/* ------------------------------------------------------------------ */

const numeracyBank = {
  Beginner: [
    {
      type: 'COUNT',
      prompt: { en: 'How many oranges?', sw: 'Machungwa mangapi?' },
      count: 3,
      art: 'orange',
      options: ['2', '3', '5'],
      correct: '3',
    },
    {
      type: 'COUNT',
      prompt: { en: 'How many frogs?', sw: 'Vyura wangapi?' },
      count: 5,
      art: 'frog',
      options: ['4', '5', '6'],
      correct: '5',
    },
  ],
  '1-Digit Number': [
    {
      type: 'COMPARE',
      prompt: { en: 'Which number is bigger?', sw: 'Namba gani ni kubwa?' },
      options: ['7', '4'],
      correct: '7',
    },
    {
      type: 'COUNT',
      prompt: { en: 'How many balls?', sw: 'Mipira mingapi?' },
      count: 6,
      art: 'ball',
      options: ['5', '6', '8'],
      correct: '6',
    },
  ],
  '2-Digit Number': [
    {
      type: 'COMPARE',
      prompt: { en: 'Which number is bigger?', sw: 'Namba gani ni kubwa?' },
      options: ['17', '12'],
      correct: '17',
    },
    {
      type: 'SKIP_COUNT',
      prompt: { en: 'Count in 5s — what comes next?', sw: 'Hesabu kwa 5 — inayofuata ni ipi?' },
      sequence: [5, 10, 15, 20, 25],
      missingIndex: 4,
      options: ['24', '25', '30'],
      correct: '25',
    },
  ],
  Addition: [
    {
      type: 'SUM',
      prompt: { en: 'Work it out', sw: 'Hesabu' },
      a: 8,
      b: 6,
      op: '+',
      options: ['12', '14', '16'],
      correct: '14',
    },
  ],
  Subtraction: [
    {
      type: 'SUM',
      prompt: { en: 'Work it out', sw: 'Hesabu' },
      a: 15,
      b: 4,
      op: '−',
      options: ['9', '11', '19'],
      correct: '11',
    },
  ],
  Multiplication: [
    {
      type: 'SUM',
      prompt: { en: 'Work it out', sw: 'Hesabu' },
      a: 6,
      b: 4,
      op: '×',
      options: ['20', '24', '26'],
      correct: '24',
    },
  ],
  Division: [
    {
      type: 'SUM',
      prompt: { en: 'Work it out', sw: 'Hesabu' },
      a: 24,
      b: 6,
      op: '÷',
      options: ['3', '4', '6'],
      correct: '4',
    },
  ],
}

/** Nearest non-empty bank at or below the learner's level. */
function pickBank(bank, order, level) {
  let index = order.indexOf(level)
  if (index < 0) index = 0
  for (let i = index; i >= 0; i -= 1) {
    const items = bank[order[i]]
    if (items?.length) return items
  }
  return bank[order[0]] ?? []
}

export function literacyItemsFor(level) {
  return pickBank(literacyBank, LITERACY_LEVELS, level)
}

export function numeracyItemsFor(level) {
  return pickBank(numeracyBank, NUMERACY_LEVELS, level)
}

export function storyItems() {
  return literacyBank.Story
}

export function writingItems() {
  return [
    { type: 'TRACE', prompt: { en: "Trace the letter 'g'", sw: "Fuatilia herufi 'g'" }, glyph: 'g' },
    { type: 'TRACE', prompt: { en: "Trace the letter 'a'", sw: "Fuatilia herufi 'a'" }, glyph: 'a' },
    { type: 'TRACE', prompt: { en: 'Trace the number 3', sw: 'Fuatilia namba 3' }, glyph: '3' },
    { type: 'TRACE', prompt: { en: 'Trace the number 5', sw: 'Fuatilia namba 5' }, glyph: '5' },
  ]
}

export const REWARD_COLLECTION = [
  { id: 'seed', art: 'seed', cost: 0, name: { en: 'Seed', sw: 'Mbegu' } },
  { id: 'sprout', art: 'sprout', cost: 5, name: { en: 'Sprout', sw: 'Chipukizi' } },
  { id: 'tree', art: 'tree', cost: 12, name: { en: 'Tree', sw: 'Mti' } },
  { id: 'chicken', art: 'chicken', cost: 20, name: { en: 'Chicken', sw: 'Kuku' } },
  { id: 'cup', art: 'cup', cost: 30, name: { en: 'Chai', sw: 'Chai' } },
  { id: 'star', art: 'star', cost: 45, name: { en: 'Gold star', sw: 'Nyota ya dhahabu' } },
]
