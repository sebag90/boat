import { Trash2 } from 'lucide-react'
import { useI18n } from '../../i18n'
import { formatCoordinate, formatDateTime } from '../../lib/format'
import type { VoyageStats } from '../../lib/nautical'
import type { Waypoint } from '../../lib/types'
import { IconButton } from '../ui'

interface WaypointTableProps {
  waypoints: Waypoint[]
  stats: VoyageStats
  onDelete: (waypoint: Waypoint) => void
  deleting?: boolean
}

/** Waypoint list with per-row leg distance/speed and delete action (spec §3.3.7). */
export function WaypointTable({ waypoints, stats, onDelete, deleting }: WaypointTableProps) {
  const { t } = useI18n()
  if (waypoints.length === 0) {
    return <p className="text-sm font-medium text-navy-500 italic">{t('voyage.noWaypoints')}</p>
  }

  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-navy-300">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="bg-navy-950 text-[0.65rem] tracking-[0.1em] text-brass-300 uppercase">
            <Th className="w-10">{t('voyage.table.index')}</Th>
            <Th>{t('voyage.table.time')}</Th>
            <Th>{t('voyage.table.position')}</Th>
            <Th className="text-right">{t('voyage.table.leg')}</Th>
            <Th className="text-right">{t('voyage.table.speed')}</Th>
            <Th className="w-12" />
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-200 bg-white">
          {waypoints.map((waypoint, index) => {
            const leg = stats.legs[index]
            return (
              <tr key={waypoint.id} className="hover:bg-brass-50">
                <td className="px-3 py-2 font-semibold text-navy-500">{index + 1}</td>
                <td className="px-3 py-2 whitespace-nowrap text-navy-800">
                  {formatDateTime(waypoint.timestamp)}
                  {waypoint.name && (
                    <span className="block text-xs text-navy-500">{waypoint.name}</span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-xs whitespace-nowrap text-ocean-800">
                  {formatCoordinate(Number(waypoint.latitude))},{' '}
                  {formatCoordinate(Number(waypoint.longitude))}
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap text-navy-800">
                  {leg ? (
                    <>
                      <span className="font-semibold">{leg.distanceNm.toFixed(2)} NM</span>
                      <span className="block text-xs text-navy-500">
                        {leg.distanceKm.toFixed(2)} km
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-foam-700">{t('voyage.table.startLeg')}</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap text-navy-800">
                  {leg ? (
                    <>
                      <span className="font-semibold">{leg.speedKnots.toFixed(1)} kn</span>
                      <span className="block text-xs text-navy-500">
                        {leg.speedKmh.toFixed(1)} km/h
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-navy-400">—</span>
                  )}
                </td>
                <td className="px-1 py-1">
                  <IconButton
                    label={t('voyage.deleteWaypoint')}
                    tone="danger"
                    disabled={deleting}
                    icon={<Trash2 className="size-4" />}
                    onClick={() => onDelete(waypoint)}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2 text-left font-semibold ${className ?? ''}`}>{children}</th>
}
