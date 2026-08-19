import { MapPin, Route, Users } from 'lucide-react'
import { useI18n } from '../../i18n'
import { formatDate } from '../../lib/format'
import { validWaypoints, voyageStats } from '../../lib/nautical'
import type { LogEntry } from '../../lib/types'
import { excerptOf } from '../entries/EntryCard'

/** Voyage preview card: route, date, crew and logged distance. */
export function VoyageCard({ entry, onClick }: { entry: LogEntry; onClick: () => void }) {
  const { t } = useI18n()
  const waypoints = validWaypoints(entry.waypoints)
  const stats = voyageStats(waypoints)
  const route = [entry.start, entry.goal].filter(Boolean).join(' → ') || t('logbook.untitledRoute')

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full items-stretch gap-4 rounded-2xl bg-white p-4 text-left ring-1 ring-navy-200 shadow-sm transition-all duration-200 ease-sail hover:-translate-y-px hover:ring-2 hover:ring-brass-400 hover:shadow-chart"
      >
        <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-navy-950 px-2 py-2 text-white">
          <span className="font-display text-lg leading-none font-semibold">
            {formatDate(entry.date).slice(0, 2)}
          </span>
          <span className="mt-0.5 text-[0.6rem] tracking-[0.1em] text-brass-300 uppercase">
            {formatDate(entry.date).slice(3)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-navy-950">{route}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy-600">
            {entry.crew && (
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" />
                {entry.crew}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {waypoints.length} {t('voyage.waypoints')}
            </span>
            {stats.totalNm > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-ocean-100 px-1.5 py-0.5 font-semibold text-ocean-900">
                <Route className="size-3.5" />
                {stats.totalNm.toFixed(1)} NM
              </span>
            )}
          </div>
          {entry.description && (
            <p className="mt-1.5 truncate text-sm text-navy-600">{excerptOf(entry.description)}</p>
          )}
        </div>
      </button>
    </li>
  )
}
