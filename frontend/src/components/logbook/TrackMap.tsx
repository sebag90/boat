import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Crosshair } from 'lucide-react'
import { useI18n } from '../../i18n'
import { DEFAULT_CENTER, validWaypoints } from '../../lib/nautical'
import type { Waypoint } from '../../lib/types'
import { tileLayer, trackLines, waypointMarker } from './mapLayers'

/** Leaflet route map. Lives inside a modal, so sizes are invalidated on resize. */
export function TrackMap({ waypoints }: { waypoints: Waypoint[] }) {
  const { t } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const fitRef = useRef<() => void>(() => {})

  // Create the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true })
    tileLayer().addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(containerRef.current)
    const raf = window.requestAnimationFrame(() => map.invalidateSize())

    return () => {
      window.cancelAnimationFrame(raf)
      observer.disconnect()
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [])

  // Redraw the track whenever waypoints change.
  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return

    layer.clearLayers()
    const points = validWaypoints(waypoints)
    const latLngs = points.map(
      (wp) => [Number(wp.latitude), Number(wp.longitude)] as L.LatLngTuple,
    )
    const labels = {
      start: t('logbook.start'),
      end: t('logbook.goal'),
      waypoint: t('voyage.waypoints'),
      leg: t('voyage.table.leg'),
      speed: t('voyage.table.speed'),
    }

    if (latLngs.length >= 2) for (const line of trackLines(latLngs)) line.addTo(layer)
    points.forEach((wp, index) => waypointMarker(wp, index, points, labels).addTo(layer))

    fitRef.current = () => {
      if (latLngs.length > 1) map.fitBounds(L.latLngBounds(latLngs), { padding: [35, 35] })
      else if (latLngs.length === 1) map.setView(latLngs[0], 12)
      else map.setView(DEFAULT_CENTER, 9)
    }
    fitRef.current()
    map.invalidateSize()
  }, [waypoints, t])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-outline-variant/30 shadow-xs">
      <div ref={containerRef} className="h-[340px] w-full sm:h-[420px]" />
      <button
        type="button"
        onClick={() => fitRef.current()}
        title={t('voyage.recenter')}
        aria-label={t('voyage.recenter')}
        className="map-recenter absolute top-3 right-3 z-[400]"
      >
        <Crosshair className="size-4" />
      </button>
    </div>
  )
}
