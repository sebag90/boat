import L from 'leaflet'
import { formatCoordinate, formatDateTime } from '../../lib/format'
import { legBetween } from '../../lib/nautical'
import type { Waypoint } from '../../lib/types'

const CASING_STYLE: L.PolylineOptions = { color: '#07162A', weight: 6, opacity: 0.35 }
const TRACK_STYLE: L.PolylineOptions = {
  color: '#0284c7',
  weight: 3.5,
  opacity: 0.95,
  dashArray: '8, 6',
}

export function tileLayer(): L.TileLayer {
  return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap',
  })
}

/** Dark casing under a dashed nautical track line (spec §3.3.5). */
export function trackLines(points: L.LatLngExpression[]): L.Polyline[] {
  return [L.polyline(points, CASING_STYLE), L.polyline(points, TRACK_STYLE)]
}

interface MarkerLabels {
  start: string
  end: string
  waypoint: string
  leg: string
  speed: string
}

export function waypointMarker(
  waypoint: Waypoint,
  index: number,
  waypoints: Waypoint[],
  labels: MarkerLabels,
): L.Marker {
  const solo = waypoints.length === 1
  const isStart = index === 0 && !solo
  const isEnd = index === waypoints.length - 1 && !solo

  const variant = solo ? 'solo' : isStart ? 'start' : isEnd ? 'end' : 'mid'
  const text = solo ? '' : isStart ? 'START' : isEnd ? 'END' : String(index + 1)
  const size: L.PointExpression = variant === 'start' || variant === 'end' ? [46, 22] : [22, 22]

  const icon = L.divIcon({
    className: 'wp-marker',
    html: `<div class="wp-badge wp-badge--${variant}">${text}</div>`,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
  })

  const marker = L.marker([Number(waypoint.latitude), Number(waypoint.longitude)], { icon })
  marker.bindPopup(popupHtml(waypoint, index, waypoints, labels))
  return marker
}

function popupHtml(
  waypoint: Waypoint,
  index: number,
  waypoints: Waypoint[],
  labels: MarkerLabels,
): string {
  const solo = waypoints.length === 1
  const role =
    !solo && index === 0
      ? labels.start
      : !solo && index === waypoints.length - 1
        ? labels.end
        : `${labels.waypoint} ${index + 1}`

  const leg = index > 0 ? legBetween(waypoints[index - 1], waypoint) : null

  return `
    <div style="min-width:190px">
      <div style="font-weight:700;color:#07162A">${escapeHtml(role)}</div>
      ${waypoint.name ? `<div style="color:#3b5c83">${escapeHtml(waypoint.name)}</div>` : ''}
      <div style="color:#5c7ba1;margin-top:4px">${escapeHtml(formatDateTime(waypoint.timestamp))}</div>
      <div style="font-family:ui-monospace,monospace;color:#1d3352;margin-top:2px">
        ${formatCoordinate(Number(waypoint.latitude))}, ${formatCoordinate(Number(waypoint.longitude))}
      </div>
      ${
        leg
          ? `<div style="margin-top:6px;border-top:1px solid #e2e9f1;padding-top:6px;color:#1d3352">
               <div>${escapeHtml(labels.leg)}: <b>${leg.distanceNm.toFixed(2)} NM</b> (${leg.distanceKm.toFixed(2)} km)</div>
               <div>${escapeHtml(labels.speed)}: <b>${leg.speedKnots.toFixed(1)} kn</b> (${leg.speedKmh.toFixed(1)} km/h)</div>
             </div>`
          : ''
      }
    </div>`
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char,
  )
}
