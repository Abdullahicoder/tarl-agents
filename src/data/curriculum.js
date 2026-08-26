/**
 * MOCK CURRICULUM — visual-development data only.
 *
 * This module is deliberately isolated so that `src/data/api.js` can be
 * pointed at the real Cloud Run / Firestore backend without touching any
 * presentational component. Do not import it directly from a component;
 * always go through `api.js`.
 *
 * Level taxonomies mirror the deterministic engine in `shared/level_engine`.
 */

export const LITERACY_LEVELS = ['BEGINNER', 'LETTER', 'WORD', 'PARAGRAPH', 'STORY']

export const NUMERACY_LEVELS = [
  'BEGINNER',
  'ONE_DIGIT',
  'TWO_DIGIT',
  'ADDITION',
  'SUBTRACTION',
  'MULTIPLICATION',
  'DIVISION',
]

export const LEVEL_LABELS = {
  BEGINNER: { en: 'Beginner', sw: 'Mwanzo' },
  LETTER: { en: 'Letters', sw: 'Herufi' },
  WORD: { en: 'Words', sw: 'Maneno' },
  PARAGRAPH: { en: 'Paragraphs', sw: 'Aya' },
  STORY: { en: 'Stories', sw: 'Hadithi' },
  ONE_DIGIT: { en: '1-digit numbers', sw: 'Tarakimu moja' },
  TWO_DIGIT: { en: '2-digit numbers', sw: 'Tarakimu mbili' },
  ADDITION: { en: 'Addition', sw: 'Kujumlisha' },
  SUBTRACTION: { en: 'Subtraction', sw: 'Kutoa' },
  MULTIPLICATION: { en: 'Multiplication', sw: 'Kuzidisha' },
  DIVISION: { en: 'Division', sw: 'Kugawanya' },
}

/* ------------------------------------------------------------------ */
/* Literacy item banks, keyed by TaRL level                            */
/* ------------------------------------------------------------------ */

const literacyBank = {
  sw: {
    BEGINNER: [
      {
        type: 'LETTER_SOUND',
        prompt: { en: 'Tap the letter that says "mmm"', sw: 'Gusa herufi inayosema "mmm"' },
        say: { en: 'mmm', sw: 'mmm' },
        options: ['m', 'a', 's'],
        correct: 'm',
      },
      {
        type: 'LETTER_SOUND',
        prompt: { en: 'Tap the letter that says "aaa"', sw: 'Gusa herufi inayosema "aaa"' },
        say: { en: 'aaa', sw: 'aaa' },
        options: ['t', 'a', 'k'],
        correct: 'a',
      },
    ],

    LETTER: [
      {
        type: 'LETTER_SOUND',
        prompt: { en: 'Find the letter K', sw: 'Tafuta herufi K' },
        say: { en: 'K', sw: 'K' },
        options: ['k', 'b', 'd', 'p'],
        correct: 'k',
      },
      {
        type: 'BUILD_WORD',
        prompt: { en: 'Build the word "chai"', sw: 'Tunga neno "chai"' },
        say: { en: 'chai', sw: 'chai' },
        word: { en: 'chai', sw: 'chai' },
        pool: {
          en: ['c', 'h', 'a', 'i', 'u'],
          sw: ['c', 'h', 'a', 'i', 'u'],
        },
      },
      {
        type: 'TRACE',
        prompt: { en: "Trace the letter 'a'", sw: "Fuatilia herufi 'a'" },
        glyph: 'a',
      },
    ],

    WORD: [
      {
        type: 'WORD_PICTURE',
        prompt: { en: 'Which picture is "kuku"?', sw: 'Picha gani ni "kuku"?' },
        say: { en: 'kuku', sw: 'kuku' },
        options: [
          { id: 'chicken', art: 'chicken', label: { en: 'chicken', sw: 'kuku' } },
          { id: 'tree', art: 'tree', label: { en: 'tree', sw: 'mti' } },
          { id: 'cup', art: 'cup', label: { en: 'tea', sw: 'chai' } },
        ],
        correct: 'chicken',
      },
      {
        type: 'BUILD_WORD',
        prompt: { en: 'Build the word "chai"', sw: 'Tunga neno "chai"' },
        say: { en: 'chai', sw: 'chai' },
        word: { en: 'chai', sw: 'chai' },
        pool: {
          en: ['c', 'h', 'a', 'i', 'u'],
          sw: ['c', 'h', 'a', 'i', 'u'],
        },
      },
      {
        type: 'WORD_PICTURE',
        prompt: { en: 'Which picture is "mti"?', sw: 'Picha gani ni "mti"?' },
        say: { en: 'mti', sw: 'mti' },
        options: [
          { id: 'cup', art: 'cup', label: { en: 'tea', sw: 'chai' } },
          { id: 'tree', art: 'tree', label: { en: 'tree', sw: 'mti' } },
          { id: 'chicken', art: 'chicken', label: { en: 'chicken', sw: 'kuku' } },
        ],
        correct: 'tree',
      },
    ],

    PARAGRAPH: [
      {
        type: 'FILL_PHRASE',
        prompt: { en: 'Complete the phrase', sw: 'Kamilisha sentensi' },
        before: 'Bata na',
        after: 'wanacheza.',
        options: ['kuku', 'kima'],
        correct: 'kuku',
      },
    ],

    STORY: [
      {
        type: 'STORY',
        title: { en: 'Kobe Mwerevu', sw: 'Kobe Mwerevu' },
        body: {
          en: 'Hapo zamani za kale dimbwi la msituni lilikauka. Kila mnyama alikuwa na kiu. Kobe mdogo alipata maji mapya chini ya jiwe na akawaita wanyama wote.',
          sw: 'Hapo zamani za kale dimbwi la msituni lilikauka. Kila mnyama alikuwa na kiu. Kobe mdogo alipata maji mapya chini ya jiwe na akawaita wanyama wote.',
        },
        question: {
          en: 'Nani alipata maji?',
          sw: 'Nani alipata maji?',
        },
        options: {
          en: ['Kobe', 'Kuku', 'Bata'],
          sw: ['Kobe', 'Kuku', 'Bata'],
        },
        correctIndex: 0,
      },
    ],
  },

  en: {
    BEGINNER: [
      {
        type: 'LETTER_SOUND',
        prompt: { en: 'Tap the letter that says "mmm"', sw: 'Gusa herufi inayosema "mmm"' },
        say: { en: 'mmm', sw: 'mmm' },
        options: ['m', 'a', 's'],
        correct: 'm',
      },
      {
        type: 'LETTER_SOUND',
        prompt: { en: 'Tap the letter that says "aaa"', sw: 'Gusa herufi inayosema "aaa"' },
        say: { en: 'aaa', sw: 'aaa' },
        options: ['t', 'a', 'k'],
        correct: 'a',
      },
    ],

    LETTER: [
      {
        type: 'LETTER_SOUND',
        prompt: { en: 'Find the letter K', sw: 'Tafuta herufi K' },
        say: { en: 'K', sw: 'K' },
        options: ['k', 'b', 'd', 'p'],
        correct: 'k',
      },
      {
        type: 'BUILD_WORD',
        prompt: { en: 'Build the word "tea"', sw: 'Tunga neno "chai"' },
        say: { en: 'tea', sw: 'chai' },
        word: { en: 'tea', sw: 'chai' },
        pool: {
          en: ['t', 'e', 'a', 'i', 'o'],
          sw: ['c', 'h', 'a', 'i', 'u'],
        },
      },
      {
        type: 'TRACE',
        prompt: { en: "Trace the letter 'a'", sw: "Fuatilia herufi 'a'" },
        glyph: 'a',
      },
    ],

    WORD: [
      {
        type: 'WORD_PICTURE',
        prompt: { en: 'Which picture is "chicken"?', sw: 'Picha gani ni "kuku"?' },
        say: { en: 'chicken', sw: 'kuku' },
        options: [
          { id: 'chicken', art: 'chicken', label: { en: 'chicken', sw: 'kuku' } },
          { id: 'tree', art: 'tree', label: { en: 'tree', sw: 'mti' } },
          { id: 'cup', art: 'cup', label: { en: 'tea', sw: 'chai' } },
        ],
        correct: 'chicken',
      },
      {
        type: 'BUILD_WORD',
        prompt: { en: 'Build the word "tea"', sw: 'Tunga neno "chai"' },
        say: { en: 'tea', sw: 'chai' },
        word: { en: 'tea', sw: 'chai' },
        pool: {
          en: ['t', 'e', 'a', 'i', 'o'],
          sw: ['c', 'h', 'a', 'i', 'u'],
        },
      },
      {
        type: 'WORD_PICTURE',
        prompt: { en: 'Which picture is "tree"?', sw: 'Picha gani ni "mti"?' },
        say: { en: 'tree', sw: 'mti' },
        options: [
          { id: 'cup', art: 'cup', label: { en: 'tea', sw: 'chai' } },
          { id: 'tree', art: 'tree', label: { en: 'tree', sw: 'mti' } },
          { id: 'chicken', art: 'chicken', label: { en: 'chicken', sw: 'kuku' } },
        ],
        correct: 'tree',
      },
    ],

    PARAGRAPH: [
      {
        type: 'FILL_PHRASE',
        prompt: { en: 'Complete the sentence', sw: 'Kamilisha sentensi' },
        before: 'The duck and',
        after: 'are playing.',
        options: ['chicken', 'monkey'],
        correct: 'chicken',
      },
    ],

    STORY: [
      {
        type: 'STORY',
        title: { en: 'The Wise Tortoise', sw: 'Kobe Mwerevu' },
        body: {
          en: 'Long ago the forest pool dried up. Every animal was thirsty. A small tortoise found new water under a flat stone and called all the animals.',
          sw: 'Hapo zamani za kale dimbwi la msituni lilikauka. Kila mnyama alikuwa na kiu. Kobe mdogo alipata maji mapya chini ya jiwe na akawaita wanyama wote.',
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
  },
}


/* ------------------------------------------------------------------ */
/* Numeracy item banks, keyed by TaRL level                            */
/* ------------------------------------------------------------------ */

const numeracyBank = {
  BEGINNER: [
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
  ONE_DIGIT: [
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
  TWO_DIGIT: [
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
  ADDITION: [
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
  SUBTRACTION: [
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
  MULTIPLICATION: [
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
  DIVISION: [
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

export function literacyItemsFor(level, lang = 'sw') {
  const bank = literacyBank[lang] ?? literacyBank.sw
  return pickBank(bank, LITERACY_LEVELS, level)
}

export function numeracyItemsFor(level, lang = 'sw') {
  return pickBank(numeracyBank, NUMERACY_LEVELS, level)
}

export function storyItems(lang = 'sw') {
  const bank = literacyBank[lang] ?? literacyBank.sw
  return bank.STORY ?? literacyBank.sw.STORY
}

export function writingItems(lang = 'sw') {
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
