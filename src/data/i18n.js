/**
 * Bilingual copy for the student frontend.
 *
 * Swahili is the primary classroom language for the target deployment;
 * English is the second language of instruction. Every learner-visible
 * string must exist in both. Nothing here is a translation of teacher or
 * parent copy — this file is student-facing only.
 */

export const LANGUAGES = [
  { code: 'sw', label: 'Kiswahili', flag: '🇹🇿' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

const strings = {
  // sign in
  whoIsLearning: { en: 'Who is learning today?', sw: 'Nani anajifunza leo?' },
  tapYourPicture: { en: 'Tap your picture to begin', sw: 'Gusa picha yako uanze' },
  letsGo: { en: "Let's go!", sw: 'Twende!' },

  // home
  hello: { en: 'Hello', sw: 'Habari' },
  chooseActivity: { en: 'Choose what to learn', sw: 'Chagua unachotaka kujifunza' },
  yourLevel: { en: 'Your level', sw: 'Kiwango chako' },
  continueLearning: { en: 'Continue', sw: 'Endelea' },
  todaysGoal: { en: "Today's goal", sw: 'Lengo la leo' },
  starsToday: { en: 'stars today', sw: 'nyota leo' },

  // subjects
  literacy: { en: 'Reading', sw: 'Kusoma' },
  numeracy: { en: 'Numbers', sw: 'Hesabu' },
  stories: { en: 'Stories', sw: 'Hadithi' },
  writing: { en: 'Writing', sw: 'Kuandika' },
  rewards: { en: 'My stars', sw: 'Nyota zangu' },

  // activity chrome
  question: { en: 'Question', sw: 'Swali' },
  listenAgain: { en: 'Listen again', sw: 'Sikiliza tena' },
  back: { en: 'Back', sw: 'Rudi' },
  next: { en: 'Next', sw: 'Endelea' },
  finish: { en: 'Finish', sw: 'Maliza' },
  wellDone: { en: 'Well done!', sw: 'Umefanya vizuri!' },
  tryAgain: { en: 'Try again', sw: 'Jaribu tena' },
  guidingYou: { en: 'Alefa is guiding you', sw: 'Alefa anakuongoza' },

  // round summary
  roundComplete: { en: 'Round complete!', sw: 'Raundi imekamilika!' },
  youEarned: { en: 'You earned', sw: 'Umepata' },
  stars: { en: 'stars', sw: 'nyota' },
  keepGoing: { en: 'Keep going', sw: 'Endelea' },
  backHome: { en: 'Back home', sw: 'Rudi nyumbani' },

  // rewards
  collection: { en: 'Your collection', sw: 'Mkusanyiko wako' },
  locked: { en: 'Locked', sw: 'Imefungwa' },
  earnMoreStars: { en: 'Earn more stars to unlock', sw: 'Pata nyota zaidi ufungue' },
}

export function makeT(lang) {
  return (key) => {
    const entry = strings[key]
    if (!entry) return key
    return entry[lang] ?? entry.en
  }
}
