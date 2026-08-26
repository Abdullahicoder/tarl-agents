import { useCallback, useRef } from 'react'

const VOICE_LOCALE = { sw: 'sw-TZ', en: 'en-GB' }

/**
 * Browser speech synthesis wrapper.
 *
 * Audio is central to a TaRL learner who cannot yet read instructions, so
 * every prompt is spoken. Swahili voices are not installed on every device;
 * we fall back to the default voice rather than failing silently.
 *
 * Replaced/augmented later by: pre-rendered audio from `shared/audio_engine`
 * cached for offline use.
 */
export function useSpeech(lang) {
  const lastRef = useRef('')

  const speak = useCallback(
    (text) => {
      if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return
      lastRef.current = text
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = VOICE_LOCALE[lang] ?? 'en-GB'
      utterance.rate = 0.85
      utterance.pitch = 1.05
      const match = window.speechSynthesis
        .getVoices()
        .find((v) => v.lang?.toLowerCase().startsWith(lang))
      if (match) utterance.voice = match
      window.speechSynthesis.speak(utterance)
    },
    [lang],
  )

  const repeat = useCallback(() => speak(lastRef.current), [speak])

  return { speak, repeat }
}
