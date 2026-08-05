<template>
  <div ref="mapContainer" class="w-full h-64 sm:h-80 rounded-xl border-2 border-marine-200 overflow-hidden shadow-inner bg-marine-50 relative"></div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue'
import L from 'leaflet'

const props = defineProps({
  waypoints: {
    type: Array,
    default: () => []
  }
})

const mapContainer = ref(null)
let mapInstance = null
let polylineLayer = null
let markerLayers = []

const initMap = () => {
  if (!mapContainer.value) return
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }

  const validWaypoints = (props.waypoints || []).filter(w => w && !isNaN(w.latitude) && !isNaN(w.longitude))

  if (validWaypoints.length === 0) {
    mapInstance = L.map(mapContainer.value).setView([43.7384, 7.4246], 9) // Monaco default
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapInstance)
  } else {
    const latLons = validWaypoints.map(w => [w.latitude, w.longitude])
    mapInstance = L.map(mapContainer.value).setView(latLons[0], 11)
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapInstance)

    // Polyline connecting route
    polylineLayer = L.polyline(latLons, {
      color: '#0284c7',
      weight: 4,
      opacity: 0.9,
      dashArray: '6, 8'
    }).addTo(mapInstance)

    // Waypoint Markers
    markerLayers = validWaypoints.map((wp, idx) => {
      const marker = L.marker([wp.latitude, wp.longitude]).addTo(mapInstance)
      const dateText = wp.timestamp ? new Date(wp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
      marker.bindPopup(`<b>Waypoint #${idx + 1}</b>${wp.name ? `<br>${wp.name}` : ''}<br>Lat: ${wp.latitude.toFixed(5)}<br>Lon: ${wp.longitude.toFixed(5)}<br>Time: ${dateText}`)
      return marker
    })

    if (latLons.length > 1) {
      mapInstance.fitBounds(L.latLngBounds(latLons).pad(0.15))
    }
  }

  setTimeout(() => {
    if (mapInstance) {
      mapInstance.invalidateSize()
    }
  }, 200)
}

onMounted(() => {
  nextTick(() => {
    initMap()
  })
})

watch(() => props.waypoints, () => {
  nextTick(() => {
    initMap()
  })
}, { deep: true })

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>
