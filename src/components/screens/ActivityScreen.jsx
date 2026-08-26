import { useEffect, useMemo, useState } from 'react'
import ActivityRenderer, { promptText } from '../activities/Activities'
import { FeedbackOverlay, Panel, ProgressBar } from '../ui/primitives'
import Art from '../ui/Art'

const SUBJECT_TONE = {
  LITERACY: 'mint',
  NUMERACY: 'blush',
  STORIES: 'lemon',
  WRITING: 'lilac',
}

export default function ActivityScreen({ subject, items, lang, t, speak, onAnswer, onExit }) {
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [earned, setEarned] = useState(0)
  const [complete, setComplete] = useState(false)
  const [keySalt, setKeySalt] = useState(0)

  const keyed = useMemo(
    () => items.map((item, i) => ({ ...item, __key: `${subject}-${i}` })),
    [items, subject],
  )
  const item = keyed[index]
  const spoken = item ? promptText(item, lang) : ''

  // Keyed on the item's identity, not its object reference: recording an
  // answer produces a fresh session object upstream, which would otherwise
  // re-fire this effect and cut off the feedback audio mid-word.
  useEffect(() => {
    if (spoken) speak(spoken)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.__key, lang])

  const handleAnswer = (correct) => {
    setFeedback(correct ? 'correct' : 'wrong')
    onAnswer({ subject, correct })
    if (correct) setEarned((n) => n + 1)
    speak(correct ? t('wellDone') : t('tryAgain'))

    setTimeout(() => {
      setFeedback(null)
      if (correct) {
        if (index + 1 >= keyed.length) setComplete(true)
        else setIndex((i) => i + 1)
      } else {
        // re-present the same item with a fresh renderer instance
        setKeySalt((s) => s + 1)
      }
    }, 1250)
  }

  if (complete) {
    return (
      <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <Panel className="stage-grain text-center">
          <Art name="star" className="mx-auto h-24 w-24 animate-pop-in" />
          <h2 className="mt-4 text-4xl font-extrabold">{t('roundComplete')}</h2>
          <p className="mt-2 text-xl text-ink-soft">
            {t('youEarned')} {earned} {t('stars')} ⭐
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                setIndex(0)
                setEarned(0)
                setComplete(false)
              }}
              className="press rounded-full bg-mint-ink px-8 py-4 text-lg font-extrabold text-white shadow-tile"
            >
              {t('keepGoing')}
            </button>
            <button
              type="button"
              onClick={onExit}
              className="press rounded-full border-2 border-ink/10 bg-stage px-8 py-4 text-lg font-extrabold text-ink-soft"
            >
              {t('backHome')}
            </button>
          </div>
        </Panel>
      </div>
    )
  }

  if (!item) return null

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-extrabold whitespace-nowrap text-ink-soft">
          {t('question')} {index + 1}/{keyed.length}
        </span>
        <ProgressBar value={index} total={keyed.length} tone="sky" />
      </div>

      <Panel className="relative flex min-h-[60vh] flex-col items-center justify-between gap-8">
        <FeedbackOverlay
          kind={feedback}
          correctText={t('wellDone')}
          retryText={t('tryAgain')}
        />

        <h2 className="text-center text-2xl font-extrabold text-balance sm:text-3xl">
          {promptText(item, lang)}
        </h2>

        <div className="flex w-full flex-1 items-center">
          <ActivityRenderer
            key={`${item.__key}-${keySalt}`}
            item={item}
            lang={lang}
            onAnswer={handleAnswer}
          />
        </div>

        <div
          className={`flex items-center gap-3 self-start rounded-full px-4 py-2 ${
            SUBJECT_TONE[subject] === 'mint' ? 'bg-mint-tile' : 'bg-lilac-tile'
          }`}
        >
          <span className="text-2xl" aria-hidden="true">
            👩🏾‍🏫
          </span>
          <span className="text-sm font-extrabold">{t('guidingYou')}</span>
        </div>
      </Panel>
    </div>
  )
}
