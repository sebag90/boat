import { Map as MapIcon, Users } from 'lucide-react'
import { useI18n } from '../../i18n'
import { formatDate } from '../../lib/format'
import { geojsonIoUrl } from '../../lib/geojson'
import { validWaypoints, voyageStats } from '../../lib/nautical'
import type { Fix } from '../../lib/geolocation'
import type { LogEntry, Waypoint } from '../../lib/types'
import { Markdown } from '../Markdown'
import { PhotoGallery } from '../photos/PhotoGallery'
import { Badge } from '../ui'
import { GpsPanel } from './GpsPanel'
import { RouteBanner } from './RouteBanner'
import { TrackMap } from './TrackMap'
import { VoyageSummary } from './VoyageSummary'
import { WaypointTable } from './WaypointTable'

interface VoyageReadViewProps {
  entry: LogEntry
  onFix: (fix: Fix) => Promise<void>
  onImport: (file: File) => Promise<number>
  onDeleteWaypoint: (waypoint: Waypoint) => void
  deletingWaypoint: boolean
}

export function VoyageReadView({
  entry,
  onFix,
  onImport,
  onDeleteWaypoint,
  deletingWaypoint,
}: VoyageReadViewProps) {
  const { t } = useI18n()
  const waypoints = validWaypoints(entry.waypoints)
  const stats = voyageStats(waypoints)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Badge tone="ocean">{formatDate(entry.date)}</Badge>
        {entry.crew && (
          <Badge tone="neutral" icon={<Users className="size-3" />}>
            {entry.crew}
          </Badge>
        )}
      </div>

      <RouteBanner start={entry.start} goal={entry.goal} />

      <Markdown source={entry.description} />

      <GpsPanel onFix={onFix} onImport={onImport} />

      <VoyageSummary stats={stats} />

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[0.7rem] font-semibold tracking-[0.12em] text-brass-700 uppercase">
            {t('voyage.waypoints')} · {waypoints.length}
          </h3>
          <a
            href={geojsonIoUrl(waypoints)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy-950 px-2.5 py-1.5 text-xs font-semibold text-brass-300 transition-colors hover:bg-navy-800"
          >
            <MapIcon className="size-3.5" />
            {t('voyage.openMap')}
          </a>
        </div>

        <WaypointTable
          waypoints={waypoints}
          stats={stats}
          onDelete={onDeleteWaypoint}
          deleting={deletingWaypoint}
        />
      </section>

      <TrackMap waypoints={waypoints} />

      <PhotoGallery parent="logbook" parentId={entry.id} />
    </div>
  )
}
