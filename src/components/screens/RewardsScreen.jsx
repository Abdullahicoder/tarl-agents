import Art from '../ui/Art'
import { Panel, ProgressBar } from '../ui/primitives'
import { REWARD_COLLECTION } from '../../data/curriculum'

export default function RewardsScreen({ stars, lang, t }) {
  const next = REWARD_COLLECTION.find((r) => r.cost > stars)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-4 sm:p-6">
      <Panel className="stage-grain text-center">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{t('rewards')}</h1>
        <p className="mt-2 text-5xl font-extrabold tabular-nums text-lemon-ink">
          {stars} ⭐
        </p>
        {next && (
          <div className="mx-auto mt-6 max-w-sm">
            <p className="mb-2 text-sm font-bold text-ink-soft">
              {t('earnMoreStars')} — {next.name[lang]} ({next.cost})
            </p>
            <ProgressBar value={stars} total={next.cost} tone="lemon" />
          </div>
        )}
      </Panel>

      <Panel>
        <h2 className="mb-4 text-xl font-extrabold">{t('collection')}</h2>
        <ul className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {REWARD_COLLECTION.map((reward) => {
            const unlocked = stars >= reward.cost
            return (
              <li
                key={reward.id}
                className={`flex flex-col items-center gap-2 rounded-tile border-4 p-3 ${
                  unlocked
                    ? 'border-lemon-ink/20 bg-lemon-tile/60'
                    : 'border-dashed border-ink/15 bg-page'
                }`}
              >
                <div className={unlocked ? '' : 'opacity-25 grayscale'}>
                  <Art name={reward.art} className="h-14 w-14" />
                </div>
                <span className="text-center text-xs font-extrabold">
                  {unlocked ? reward.name[lang] : `🔒 ${reward.cost}`}
                </span>
              </li>
            )
          })}
        </ul>
      </Panel>
    </div>
  )
}
