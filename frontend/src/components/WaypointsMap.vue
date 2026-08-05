<template>
  <div class="relative w-full h-64 sm:h-80 rounded-xl border-2 border-marine-200 overflow-hidden shadow-inner bg-marine-50 group">
    <div ref="mapContainer" class="w-full h-full z-0"></div>

    <!-- Map Controls Overlay -->
    <div v-if="hasWaypoints" class="absolute top-3 right-3 z-[400] flex space-x-2">
      <button 
        @click="recenterMap"
        type="button"
        title="Recenter Route Track"
        class="bg-white/90 hover:bg-white text-marine-800 hover:text-marine-900 border border-marine-300 rounded-lg p-2 shadow-md transition flex items-center justify-center backdrop-blur-sm active:scale-95"
      >
        <svg class="w-4 h-4 text-marine-700" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6h16.5M9 3.75v16.5m6-16.5v16.5"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, nextTick, computed } from 'vue'
import L from 'leaflet'
import { calculateLegStats } from '../services/api'

const props = defineProps({
  waypoints: {
    type: Array,
    default: () => []
  }
})

const mapContainer = ref(null)
let mapInstance = null
let polylineCasingLayer = null
let polylineLayer = null
let markerLayers = []
let resizeObserver = null

const validWaypoints = computed(() => {
  return (props.waypoints || []).filter(w => w && !isNaN(w.latitude) && !isNaN(w.longitude))
})

const hasWaypoints = computed(() => validWaypoints.value.length > 0)

const createStartIcon = (label) => L.divIcon({
  className: 'custom-map-icon',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute -inset-1 bg-emerald-500/40 rounded-full animate-ping"></div>
      <div class="relative bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-lg border-2 border-white flex items-center space-x-1 whitespace-nowrap">
        <svg class="w-3 h-3 text-emerald-100" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
        <span>${label || 'START'}</span>
      </div>
    </div>
  `,
  iconSize: [60, 28],
  iconAnchor: [30, 14],
  popupAnchor: [0, -16]
})

const createEndIcon = (label) => L.divIcon({
  className: 'custom-map-icon',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-lg border-2 border-white flex items-center space-x-1 whitespace-nowrap">
        <svg class="w-3 h-3 text-red-100" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.924a5.25 5.25 0 013.943.438l.608.304a6.75 6.75 0 005.07.562l3.248-.812A1.125 1.125 0 0019.5 13.5v-8.4a1.125 1.125 0 00-1.406-1.092l-3.248.812a5.25 5.25 0 01-3.943-.438l-.608-.304a6.75 6.75 0 00-5.07-.562L3 4.5v10.5z"/></svg>
        <span>${label || 'END'}</span>
      </div>
    </div>
  `,
  iconSize: [55, 28],
  iconAnchor: [27, 14],
  popupAnchor: [0, -16]
})

const createIntermediateIcon = (number) => L.divIcon({
  className: 'custom-map-icon',
  html: `
    <div class="w-6 h-6 rounded-full bg-marine-800 text-white font-bold text-[11px] border-2 border-white shadow-md flex items-center justify-center">
      ${number}
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
})

const createSingleIcon = () => L.divIcon({
  className: 'custom-map-icon',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute -inset-1.5 bg-sky-400/50 rounded-full animate-pulse"></div>
      <div class="relative w-7 h-7 bg-marine-700 text-white rounded-full border-2 border-white shadow-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-sky-300" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6"/></svg>
      </div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
})

const formatWpPopup = (wp, idx, totalCount, prevWp) => {
  const isStart = idx === 0 && totalCount > 1
  const isEnd = idx === totalCount - 1 && totalCount > 1
  
  let headerTitle = `Waypoint #${idx + 1}`
  let headerBadge = 'WAYPOINT'
  let headerBgClass = 'bg-marine-800'

  if (isStart) {
    headerTitle = 'Departure Point'
    headerBadge = 'START'
    headerBgClass = 'bg-emerald-700'
  } else if (isEnd) {
    headerTitle = 'Arrival Point'
    headerBadge = 'END'
    headerBgClass = 'bg-red-700'
  } else if (totalCount === 1) {
    headerTitle = 'Recorded Position'
    headerBadge = 'GPS FIX'
    headerBgClass = 'bg-sky-800'
  }

  const timeStr = wp.timestamp 
    ? new Date(wp.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'No timestamp'

  let legInfo = ''
  if (prevWp) {
    const stats = calculateLegStats(prevWp, wp)
    legInfo = `
      <div class="mt-2 pt-2 border-t border-marine-100 flex items-center justify-between text-[11px]">
        <span class="text-marine-500 font-medium">Leg Distance:</span>
        <span class="font-bold text-marine-900">${stats.distanceNM.toFixed(2)} NM (${stats.speedKnots.toFixed(1)} kt)</span>
      </div>
    `
  }

  return `
    <div class="min-w-[210px] text-marine-900">
      <div class="${headerBgClass} text-white px-3 py-1.5 flex items-center justify-between text-xs font-bold">
        <span>${headerTitle}</span>
        <span class="bg-white/20 text-[10px] uppercase px-1.5 py-0.5 rounded">${headerBadge}</span>
      </div>
      <div class="p-3 space-y-1.5">
        ${wp.name ? `<p class="font-bold text-marine-900 text-xs">${wp.name}</p>` : ''}
        <div class="flex justify-between text-xs">
          <span class="text-marine-500">Timestamp:</span>
          <span class="font-semibold text-marine-800">${timeStr}</span>
        </div>
        <div class="flex justify-between text-xs font-mono">
          <span class="text-marine-500 font-sans">Coordinates:</span>
          <span class="font-semibold text-marine-900">${wp.latitude.toFixed(5)}°, ${wp.longitude.toFixed(5)}°</span>
        </div>
        ${legInfo}
      </div>
    </div>
  `
}

const recenterMap = () => {
  if (!mapInstance) return
  const pts = validWaypoints.value.map(w => [w.latitude, w.longitude])
  if (pts.length === 0) return
  if (pts.length === 1) {
    mapInstance.setView(pts[0], 12, { animate: true })
  } else {
    mapInstance.fitBounds(L.latLngBounds(pts), { padding: [35, 35], animate: true })
  }
}

const clearLayers = () => {
  if (polylineCasingLayer && mapInstance) {
    mapInstance.removeLayer(polylineCasingLayer)
    polylineCasingLayer = null
  }
  if (polylineLayer && mapInstance) {
    mapInstance.removeLayer(polylineLayer)
    polylineLayer = null
  }
  markerLayers.forEach(m => {
    if (mapInstance) mapInstance.removeLayer(m)
  })
  markerLayers = []
}

const initMap = () => {
  if (!mapContainer.value) return

  const waypoints = validWaypoints.value

  if (!mapInstance) {
    mapInstance = L.map(mapContainer.value, {
      zoomControl: true,
      attributionControl: true
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapInstance)
  }

  clearLayers()

  if (waypoints.length === 0) {
    mapInstance.setView([43.7384, 7.4246], 9) // Monaco default
  } else {
    const latLons = waypoints.map(w => [w.latitude, w.longitude])

    if (latLons.length > 1) {
      // Polyline casing layer (dark outline for high contrast)
      polylineCasingLayer = L.polyline(latLons, {
        color: '#07162A',
        weight: 6,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstance)

      // Main polyline (vibrant nautical track)
      polylineLayer = L.polyline(latLons, {
        color: '#0284c7',
        weight: 3.5,
        opacity: 0.95,
        dashArray: '8, 6',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstance)
    }

    // Markers
    const count = waypoints.length
    markerLayers = waypoints.map((wp, idx) => {
      let icon
      if (count === 1) {
        icon = createSingleIcon()
      } else if (idx === 0) {
        icon = createStartIcon('START')
      } else if (idx === count - 1) {
        icon = createEndIcon('END')
      } else {
        icon = createIntermediateIcon(idx + 1)
      }

      const prevWp = idx > 0 ? waypoints[idx - 1] : null
      const popupHtml = formatWpPopup(wp, idx, count, prevWp)

      const marker = L.marker([wp.latitude, wp.longitude], { icon }).addTo(mapInstance)
      marker.bindPopup(popupHtml, { maxWidth: 260 })
      return marker
    })

    recenterMap()
  }

  // Double trigger size invalidation for smooth rendering inside modals
  setTimeout(() => {
    if (mapInstance) {
      mapInstance.invalidateSize()
    }
  }, 100)
  setTimeout(() => {
    if (mapInstance) {
      mapInstance.invalidateSize()
    }
  }, 350)
}

onMounted(() => {
  nextTick(() => {
    initMap()

    if (mapContainer.value && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstance) {
          mapInstance.invalidateSize()
        }
      })
      resizeObserver.observe(mapContainer.value)
    }
  })
})

watch(() => props.waypoints, () => {
  nextTick(() => {
    initMap()
  })
}, { deep: true })

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<style>
/* Leaflet custom map icon wrapper to clear default Leaflet icon background */
.custom-map-icon {
  background: transparent !important;
  border: none !important;
}
</style>
