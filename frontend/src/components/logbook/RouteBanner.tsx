import { Anchor, MoveRight, Navigation } from 'lucide-react'
import { useI18n } from '../../i18n'

/** Departure ⇒ destination banner. */
export function RouteBanner({ start, goal }: { start: string; goal: string }) {
  const { t } = useI18n()
  if (!start && !goal) return null

  return (
    <section className="flex flex-wrap items-center gap-3 rounded-2xl bg-brass-100 px-4 py-3.5 ring-1 ring-brass-400">
      <Endpoint
        icon={<Anchor className="size-3.5" />}
        label={t('logbook.start')}
        value={start || '—'}
      />
      <MoveRight className="size-5 shrink-0 text-brass-600" />
      <Endpoint
        icon={<Navigation className="size-3.5" />}
        label={t('logbook.goal')}
        value={goal || '—'}
      />
    </section>
  )
}

function Endpoint({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.12em] text-brass-800 uppercase">
        {icon}
        {label}
      </p>
      <p className="font-display truncate text-lg font-semibold text-navy-950">{value}</p>
    </div>
  )
}
