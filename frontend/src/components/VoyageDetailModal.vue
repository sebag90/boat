<template>
  <div v-if="entry" @click.self="$emit('close')" class="fixed inset-0 bg-marine-950/80 backdrop-blur-sm z-50 overflow-y-auto p-3 sm:p-6 flex items-start justify-center">
    <div class="bg-white rounded-2xl shadow-2xl border border-marine-100 max-w-3xl w-full slide-up overflow-hidden my-auto sm:my-8">
      
      <!-- HEADER -->
      <div class="bg-gradient-to-r from-marine-700 to-marine-900 px-6 py-4 text-white flex items-center justify-between flex-shrink-0">
        <div>
          <span class="text-[10px] uppercase font-bold tracking-widest text-sand-400 bg-white/10 px-2 py-0.5 rounded">
            LOGBOOK ENTRY
          </span>
          <h3 class="font-serif text-xl font-bold mt-1">
            {{ editMode ? 'Edit Voyage Log' : (entry.start || entry.goal ? `${entry.start || 'Start'} ➔ ${entry.goal || 'Goal'}` : 'Voyage Passage Details') }}
          </h3>
        </div>
        <button @click="$emit('close')" title="Close (Esc)" class="text-marine-300 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- BODY -->
      <div class="p-5 sm:p-8 space-y-6">

        <!-- READ-ONLY MODE -->
        <div v-if="!editMode" class="space-y-6">
          
          <!-- Key Meta Badges -->
          <div class="flex flex-wrap gap-2.5 items-center justify-between">
            <div class="flex flex-wrap gap-2 items-center">
              <span class="text-xs font-bold text-marine-800 bg-sand-100 border border-sand-200 px-3 py-1 rounded-full flex items-center">
                <svg class="w-3.5 h-3.5 mr-1.5 text-sand-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                {{ formatDate(entry.date) }}
              </span>
              <span class="text-xs font-bold text-marine-700 bg-marine-50 border border-marine-100 px-3 py-1 rounded-full flex items-center">
                <svg class="w-3.5 h-3.5 mr-1.5 text-marine-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6 0 3.375 3.375 0 016 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                {{ entry.crew ? entry.crew : 'Solo Voyage' }}
              </span>
            </div>

          <button @click="editMode = true"
            class="text-xs bg-marine-100 hover:bg-marine-200 text-marine-800 font-bold py-1.5 px-3.5 rounded-lg transition flex items-center space-x-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
            <span>{{ t('edit') }}</span>
          </button>
          </div>

          <!-- Port Route Banner -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-marine-50/70 p-4 rounded-xl border border-marine-100 text-sm">
            <div>
              <span class="text-xs text-marine-400 font-bold uppercase tracking-wider block">{{ t('start_port') }}</span>
              <span class="font-bold text-marine-900 text-base">{{ entry.start || '—' }}</span>
            </div>
            <div>
              <span class="text-xs text-marine-400 font-bold uppercase tracking-wider block">{{ t('goal_destination') }}</span>
              <span class="font-bold text-marine-900 text-base">{{ entry.goal || '—' }}</span>
            </div>
          </div>

          <!-- Notes section -->
          <div v-if="entry.description" class="space-y-1.5">
            <h4 class="text-xs font-bold text-marine-600 uppercase tracking-wider">Passage Notes &amp; Observations</h4>
            <div class="markdown-content bg-[#F8FAFC] border border-marine-100 p-4 rounded-xl text-sm text-marine-800 max-h-48 overflow-y-auto"
              v-html="renderMarkdown(entry.description)">
            </div>
          </div>

          <!-- WAYPOINTS & MAP TRACK SECTION -->
          <div class="space-y-4 border-t border-marine-100 pt-5">
            
            <div class="flex items-center justify-between flex-wrap gap-2">
              <h4 class="text-xs font-bold text-marine-700 uppercase tracking-wider flex items-center space-x-1.5">
                <svg class="w-4 h-4 text-marine-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                <span>GPS Route &amp; Waypoints</span>
              </h4>

              <div class="flex items-center space-x-2">
                <button type="button" @click="triggerTsvUpload" :disabled="importingTsv"
                  class="bg-marine-100 hover:bg-marine-200 text-marine-800 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow-sm transition active:scale-95 disabled:opacity-50">
                  <svg class="w-4 h-4 text-marine-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
                  <span>{{ importingTsv ? 'Importing...' : '📥 Import File (JSONL / TSV)' }}</span>
                </button>
                <input type="file" ref="tsvFileInput" accept=".jsonl,.json,.tsv,.csv,.txt" @change="handleTsvUpload" class="hidden" />

                <button type="button" @click="addGpsWaypoint" :disabled="capturingLocation"
                  class="bg-sand-500 hover:bg-sand-600 text-marine-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow-sm transition active:scale-95 disabled:opacity-50">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                  <span>{{ capturingLocation ? t('capturing_gps') : '📍 ' + t('capture_current_location') }}</span>
                </button>
              </div>
            </div>

            <!-- Auto-Tracker Box -->
            <div class="bg-marine-50/90 rounded-xl p-3 border border-marine-200 space-y-2">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center space-x-2">
                  <span class="text-xs font-bold text-marine-800 uppercase tracking-wider">
                    {{ t('auto_gps_logger') }}
                  </span>
                  <select v-model="autoTrackInterval" :disabled="isAutoTracking" class="text-xs border border-marine-200 rounded px-2 py-1 bg-white font-semibold text-marine-700">
                    <option :value="60">{{ t('every_1_min') }}</option>
                    <option :value="120">{{ t('every_2_mins') }}</option>
                    <option :value="300">{{ t('every_5_mins') }}</option>
                    <option :value="600">{{ t('every_10_mins') }}</option>
                  </select>
                </div>

                <button v-if="!isAutoTracking" type="button" @click="startAutoTracking"
                  class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow transition active:scale-95">
                  <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>▶ {{ t('start_auto_track') }}</span>
                </button>
                <button v-else type="button" @click="stopAutoTracking"
                  class="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow transition active:scale-95">
                  <span>⏹ {{ t('stop_auto_track') }}</span>
                </button>
              </div>

              <div v-if="isAutoTracking" class="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg flex items-center justify-between">
                <span class="flex items-center">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                  Auto-Tracking Active — Next point in {{ secondsToNextTrack }}s
                </span>
                <span v-if="lastTrackTime" class="text-[10px] text-emerald-600 font-normal">Last log: {{ formatDateTime(lastTrackTime.toISOString()) }}</span>
              </div>
            </div>

            <p v-if="locationError" class="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">{{ locationError }}</p>

            <!-- Voyage Distance / Speed Summary Banner -->
            <div v-if="entry.waypoints && entry.waypoints.length >= 2" class="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-marine-900 text-white p-3.5 rounded-xl text-center">
              <div>
                <p class="text-[10px] uppercase font-bold text-marine-300">{{ t('total_distance') }}</p>
                <p class="text-sm font-extrabold text-sand-400 mt-0.5">{{ summaryStats.totalDistanceNM.toFixed(2) }} NM</p>
                <p class="text-[10px] text-marine-400">({{ summaryStats.totalDistanceKm.toFixed(1) }} km)</p>
              </div>
              <div>
                <p class="text-[10px] uppercase font-bold text-marine-300">{{ t('avg_speed') }}</p>
                <p class="text-sm font-extrabold text-sand-400 mt-0.5">{{ summaryStats.avgSpeedKnots.toFixed(1) }} knots</p>
                <p class="text-[10px] text-marine-400">({{ summaryStats.avgSpeedKmh.toFixed(1) }} km/h)</p>
              </div>
              <div>
                <p class="text-[10px] uppercase font-bold text-marine-300">{{ t('passage_time') }}</p>
                <p class="text-sm font-extrabold text-sand-400 mt-0.5">{{ formatDuration(summaryStats.totalDurationMs) }}</p>
              </div>
              <div>
                <p class="text-[10px] uppercase font-bold text-marine-300">{{ t('waypoints_recorded') }}</p>
                <p class="text-sm font-extrabold text-sand-400 mt-0.5">{{ entry.waypoints.length }}</p>
              </div>
            </div>

            <!-- Map View (Only shown if waypoints exist) -->
            <div v-if="entry.waypoints && entry.waypoints.length > 0" class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-marine-700 uppercase tracking-wider flex items-center">
                  {{ t('route_map') }}
                </span>
                <a :href="getOpenStreetMapUrl(entry.waypoints)" target="_blank"
                  class="text-xs bg-marine-100 hover:bg-marine-200 text-marine-800 font-bold px-2.5 py-1 rounded-lg inline-flex items-center space-x-1">
                  <span>{{ t('open_map') }}</span>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                </a>
              </div>
              <WaypointsMap :waypoints="entry.waypoints" />
            </div>

            <!-- Waypoints Table -->
            <div v-if="entry.waypoints && entry.waypoints.length > 0" class="overflow-x-auto border border-marine-200 rounded-xl bg-white shadow-sm">
              <table class="w-full text-left text-xs">
                <thead class="bg-marine-100/70 text-marine-800 font-bold uppercase text-[10px] tracking-wider border-b border-marine-200">
                  <tr>
                    <th class="p-2.5">#</th>
                    <th class="p-2.5">Time</th>
                    <th class="p-2.5">Latitude, Longitude</th>
                    <th class="p-2.5">Leg Dist &amp; Speed</th>
                    <th class="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-marine-100">
                  <tr v-for="(wp, idx) in entry.waypoints" :key="wp.id || idx" class="hover:bg-marine-50/50">
                    <td class="p-2.5 font-bold text-marine-800">{{ idx + 1 }}</td>
                    <td class="p-2.5 text-marine-600">{{ formatDateTime(wp.timestamp) }}</td>
                    <td class="p-2.5 font-mono text-marine-800">{{ wp.latitude.toFixed(5) }}, {{ wp.longitude.toFixed(5) }}</td>
                    <td class="p-2.5">
                      <span v-if="idx > 0" class="font-semibold text-marine-700">
                        {{ calculateLegStats(entry.waypoints[idx-1], wp).distanceNM.toFixed(2) }} NM @ {{ calculateLegStats(entry.waypoints[idx-1], wp).speedKnots.toFixed(1) }} kt
                      </span>
                      <span v-else class="text-marine-400 italic">{{ t('departure_point') }}</span>
                    </td>
                    <td class="p-2.5 text-right">
                      <button type="button" @click="handleDeleteWaypoint(wp.id, idx)" class="text-red-600 hover:text-red-800 font-bold px-1 py-0.5 rounded">
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p v-else class="text-xs text-marine-500 italic bg-marine-50/50 p-4 rounded-xl border border-marine-100 text-center">
              {{ t('no_waypoints_sub') }}
            </p>

          </div>

          <!-- FOOTER ACTIONS -->
          <div class="border-t border-marine-100 pt-5 flex flex-col sm:flex-row sm:justify-between items-center gap-3">
            <button @click="handleDeleteVoyage"
              class="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2 px-4 rounded-lg border border-red-200 transition text-xs flex items-center justify-center space-x-1.5 active:scale-95">
              <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              <span>{{ t('delete_voyage') }}</span>
            </button>

            <button @click="$emit('close')"
              class="w-full sm:w-auto px-5 py-2 border border-marine-200 rounded-lg text-xs font-bold text-marine-700 hover:bg-marine-50 transition">
              {{ t('close') }}
            </button>
          </div>

        </div>

        <!-- EDIT MODE -->
        <form v-else @submit.prevent="handleSaveEdit" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1 min-w-0">
              <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">Date *</label>
              <input v-model="editForm.date" type="date" required class="w-full max-w-full min-w-0 box-border px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm bg-marine-50/20">
            </div>
            <div class="space-y-1 min-w-0">
              <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">Crew List</label>
              <input v-model="editForm.crew" type="text" class="w-full max-w-full min-w-0 box-border px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm bg-marine-50/20">
            </div>
            <div class="space-y-1 min-w-0">
              <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">Start Port</label>
              <input v-model="editForm.start" type="text" class="w-full max-w-full min-w-0 box-border px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm bg-marine-50/20">
            </div>
            <div class="space-y-1 min-w-0">
              <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">Goal Port</label>
              <input v-model="editForm.goal" type="text" class="w-full max-w-full min-w-0 box-border px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm bg-marine-50/20">
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">Voyage Notes (Markdown supported)</label>
            <textarea v-model="editForm.description" rows="5" class="w-full max-w-full min-w-0 box-border px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm bg-marine-50/20 font-sans"></textarea>
          </div>

          <div class="border-t border-marine-100 pt-4 flex space-x-3 justify-end">
            <button type="button" @click="editMode = false"
              class="px-4 py-2 border border-marine-200 rounded-lg text-xs font-bold text-marine-600 hover:bg-marine-50 transition">
              Cancel
            </button>
            <button type="submit"
              class="bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold py-2 px-5 rounded-lg shadow text-xs transition">
              Save Changes
            </button>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onUnmounted } from 'vue'
import WaypointsMap from './WaypointsMap.vue'
import { t } from '../services/i18n'
import {
  formatDate,
  formatDateTime,
  renderMarkdown,
  calculateVoyageSummary,
  calculateLegStats,
  formatDuration,
  getOpenStreetMapUrl,
  importWaypoints,
  request
} from '../services/api'

const props = defineProps({
  entry: Object,
  boatId: [Number, String]
})

const emit = defineEmits(['close', 'updateVoyage', 'deleteVoyage'])

const editMode = ref(false)
const capturingLocation = ref(false)
const locationError = ref('')
const isAutoTracking = ref(false)
const autoTrackInterval = ref(60)
const secondsToNextTrack = ref(60)
const countdownTimer = ref(null)
const wakeLockObj = ref(null)
const lastTrackTime = ref(null)
const tsvFileInput = ref(null)
const importingTsv = ref(false)

const triggerTsvUpload = () => {
  if (tsvFileInput.value) tsvFileInput.value.click()
}

const handleTsvUpload = async (e) => {
  const file = e.target.files[0]
  if (!file || !props.entry) return
  try {
    importingTsv.value = true
    const newWps = await importWaypoints(props.entry.id, file)
    if (newWps && props.entry.waypoints) {
      props.entry.waypoints.push(...newWps)
    }
    emit('updateVoyage')
  } catch (err) {
    alert('Failed to import file: ' + err.message)
  } finally {
    importingTsv.value = false
    if (tsvFileInput.value) tsvFileInput.value.value = ''
  }
}

const editForm = reactive({
  date: '',
  crew: '',
  start: '',
  goal: '',
  description: ''
})

watch(() => props.entry, (newVal) => {
  if (newVal) {
    editForm.date = newVal.date || ''
    editForm.crew = newVal.crew || ''
    editForm.start = newVal.start || ''
    editForm.goal = newVal.goal || ''
    editForm.description = newVal.description || ''
  }
}, { immediate: true })

const summaryStats = computed(() => {
  return calculateVoyageSummary(props.entry?.waypoints || [])
})

// GPS WAYPOINT ACTIONS
const addGpsWaypoint = async () => {
  if (!navigator.geolocation) {
    locationError.value = 'Geolocation is not supported by your browser.'
    return
  }
  capturingLocation.value = true
  locationError.value = ''

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      capturingLocation.value = false
      try {
        const res = await request(`/api/logbook/${props.entry.id}/waypoints`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            timestamp: new Date().toISOString()
          })
        })
        const newWp = await res.json()
        const updatedWaypoints = [...(props.entry.waypoints || []), newWp]
        emit('updateVoyage', { ...props.entry, waypoints: updatedWaypoints })
      } catch (e) {
        locationError.value = e.message
      }
    },
    (err) => {
      capturingLocation.value = false
      locationError.value = `GPS Error: ${err.message}`
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  )
}

const handleDeleteWaypoint = async (wpId, idx) => {
  if (wpId) {
    try {
      await request(`/api/waypoints/${wpId}`, { method: 'DELETE' })
      const updatedWaypoints = [...props.entry.waypoints]
      updatedWaypoints.splice(idx, 1)
      emit('updateVoyage', { ...props.entry, waypoints: updatedWaypoints })
    } catch (e) {
      alert(`Could not delete waypoint: ${e.message}`)
    }
  }
}

// AUTO-TRACKING
const requestWakeLock = async () => {
  if ('wakeLock' in navigator) {
    try {
      wakeLockObj.value = await navigator.wakeLock.request('screen')
    } catch (err) { }
  }
}

const releaseWakeLock = () => {
  if (wakeLockObj.value) {
    wakeLockObj.value.release().then(() => { wakeLockObj.value = null }).catch(() => {})
  }
}

const startAutoTracking = () => {
  if (isAutoTracking.value) return
  isAutoTracking.value = true
  requestWakeLock()
  secondsToNextTrack.value = autoTrackInterval.value

  addGpsWaypoint()
  lastTrackTime.value = new Date()

  countdownTimer.value = setInterval(() => {
    if (secondsToNextTrack.value > 1) {
      secondsToNextTrack.value--
    } else {
      secondsToNextTrack.value = autoTrackInterval.value
      addGpsWaypoint()
      lastTrackTime.value = new Date()
    }
  }, 1000)
}

const stopAutoTracking = () => {
  isAutoTracking.value = false
  releaseWakeLock()
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}

// SAVE & DELETE VOYAGE
const handleSaveEdit = async () => {
  try {
    const res = await request(`/api/logbook/${props.entry.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: editForm.date,
        crew: editForm.crew,
        start: editForm.start,
        goal: editForm.goal,
        description: editForm.description,
        waypoints: props.entry.waypoints || []
      })
    })
    const updated = await res.json()
    emit('updateVoyage', updated)
    editMode.value = false
  } catch (e) {
    alert(`Could not save changes: ${e.message}`)
  }
}

const handleDeleteVoyage = async () => {
  if (!confirm('Are you sure you want to permanently delete this voyage record?')) return
  try {
    await request(`/api/logbook/${props.entry.id}`, { method: 'DELETE' })
    if (isAutoTracking.value) stopAutoTracking()
    emit('deleteVoyage', props.entry.id)
    emit('close')
  } catch (e) {
    alert(`Could not delete voyage: ${e.message}`)
  }
}

onUnmounted(() => {
  stopAutoTracking()
})
</script>
