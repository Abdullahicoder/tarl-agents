import { IconButton, StarBadge } from '../ui/primitives'
import { Avatar } from '../ui/Art'
import { LANGUAGES } from '../../data/i18n'

export default function HeaderBar({
  student,
  stars,
  lang,
  onLanguageChange,
  onRepeatAudio,
  onBack,
  title,
}) {
  const other = LANGUAGES.find((l) => l.code !== lang)

  return (
    <header className="flex items-center gap-3 px-4 pt-4 sm:px-6">
      {onBack ? (
        <IconButton label="Back" tone="lilac" onClick={onBack}>
          <span aria-hidden="true">←</span>
        </IconButton>
      ) : (
        student && (
          <div className="flex items-center gap-3 rounded-full border-2 border-ink/5 bg-stage py-1.5 pr-5 pl-1.5 shadow-tile">
            <Avatar id={student.avatar} className="h-11 w-11" />
            <span className="text-lg font-extrabold">{student.name}</span>
          </div>
        )
      )}

      {title && (
        <h1 className="truncate text-xl font-extrabold sm:text-2xl">{title}</h1>
      )}

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <StarBadge count={stars} />
        <IconButton
          label={`Switch to ${other?.label}`}
          tone="mint"
          onClick={() => onLanguageChange(other.code)}
        >
          <span className="text-sm font-extrabold uppercase">{other?.code}</span>
        </IconButton>
        {onRepeatAudio && (
          <IconButton label="Listen again" tone="sky" onClick={onRepeatAudio}>
            <span aria-hidden="true">🔊</span>
          </IconButton>
        )}
      </div>
    </header>
  )
}
