import { Images, MapPin, Route, Users } from 'lucide-react'
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
        className="group flex w-full items-stretch gap-4 rounded-card border border-navy-200 bg-white p-4 text-left transition-shadow duration-200 hover:shadow-chart"
      >
        <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded bg-tint-strong px-2 py-2 text-navy-950">
          <span className="text-headline-md leading-none">
            {formatDate(entry.date).slice(0, 2)}
          </span>
          <span className="mt-1 label-mono text-navy-600">{formatDate(entry.date).slice(3)}</span>
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
            {entry.photo_count > 0 && (
              <span className="inline-flex items-center gap-1">
                <Images className="size-3.5" />
                {entry.photo_count} {t('photos.title')}
              </span>
            )}
            {stats.totalNm > 0 && (
              <span className="inline-flex items-center gap-1 rounded-chip bg-tint px-2 py-0.5 font-mono text-[0.7rem] font-medium text-navy-900">
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
