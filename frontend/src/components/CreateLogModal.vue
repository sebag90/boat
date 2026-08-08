<template>
  <div v-if="show" @click.self="handleClose" class="fixed inset-0 bg-marine-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
    <div class="bg-white rounded-2xl shadow-2xl border border-marine-100 max-w-lg w-full slide-up overflow-hidden my-auto">
      
      <!-- Modal Header -->
      <div class="bg-gradient-to-r from-marine-700 to-marine-900 px-6 py-4 text-white flex items-center justify-between">
        <h3 class="font-serif text-lg font-bold flex items-center space-x-2">
          <svg class="w-5 h-5 text-sand-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
          <span>{{ t('voyage_passage') }}</span>
        </h3>
        <button @click="handleClose" class="text-marine-300 hover:text-white transition p-1">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Date Field -->
          <div class="space-y-1 min-w-0">
            <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">{{ t('date_of_passage') }} *</label>
            <input v-model="form.date" type="date" required
              class="w-full max-w-full min-w-0 box-border px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
          </div>

          <!-- Crew Field -->
          <div class="space-y-1 min-w-0">
            <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">{{ t('crew_members') }}</label>
            <input v-model="form.crew" type="text" placeholder="e.g. Skipper & Mate"
              class="w-full max-w-full min-w-0 box-border px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
          </div>

          <!-- Start Port -->
          <div class="space-y-1 min-w-0">
            <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">{{ t('start_port') }}</label>
            <input v-model="form.start" type="text" placeholder="e.g. Monaco Port Hercules"
              class="w-full max-w-full min-w-0 box-border px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
          </div>

          <!-- Goal Port -->
          <div class="space-y-1 min-w-0">
            <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">{{ t('goal_destination') }}</label>
            <input v-model="form.goal" type="text" placeholder="e.g. Calvi, Corsica"
              class="w-full max-w-full min-w-0 box-border px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-1">
          <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">{{ t('voyage_notes') }}</label>
          <textarea v-model="form.description" rows="3" placeholder="Weather, sea state, engine hours, sails used..."
            class="w-full max-w-full min-w-0 box-border px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20 font-sans"></textarea>
        </div>

        <!-- Option to record starting waypoint -->
        <div class="bg-marine-50/80 p-3.5 rounded-xl border border-marine-200 flex items-center justify-between gap-3">
          <div class="text-xs text-marine-700">
            <span class="font-bold block text-marine-900">📍 {{ t('initial_gps_waypoint') }}</span>
            <span class="text-[11px] text-marine-500">{{ t('capture_gps_sub') }}</span>
          </div>
          <button type="button" @click="captureGps" :disabled="capturing"
            class="text-xs bg-sand-500 hover:bg-sand-600 text-marine-950 font-bold px-3 py-1.5 rounded-lg border border-sand-600 shadow-sm transition active:scale-95 disabled:opacity-50 flex items-center space-x-1 flex-shrink-0">
            <span>{{ capturing ? t('locating') : (initialGps ? '✓ ' + t('location_captured') : '📍 ' + t('get_gps_location')) }}</span>
          </button>
        </div>

        <p v-if="gpsError" class="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">{{ gpsError }}</p>

        <!-- Form Buttons -->
        <div class="pt-3 flex space-x-3 justify-end border-t border-marine-100">
          <button type="button" @click="handleClose"
            class="px-4 py-2.5 border border-marine-200 rounded-lg hover:bg-marine-50 text-sm font-semibold text-marine-600 transition">
            Cancel
          </button>
          <button type="submit" :disabled="submitting"
            class="bg-gradient-to-r from-marine-600 to-marine-800 hover:from-marine-700 hover:to-marine-900 text-white font-bold py-2.5 px-6 rounded-lg shadow transition text-sm flex items-center space-x-2 disabled:opacity-50">
            <span>{{ submitting ? 'Saving...' : 'Save Voyage' }}</span>
            <svg class="w-4 h-4 text-sand-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { t } from '../services/i18n'
import { getTodayDateString } from '../services/api'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'submit'])

const submitting = ref(false)
const capturing = ref(false)
const gpsError = ref('')
const initialGps = ref(null)

const form = reactive({
  date: getTodayDateString(),
  crew: '',
  start: '',
  goal: '',
  description: ''
})

watch(() => props.show, (val) => {
  if (val) {
    form.date = getTodayDateString()
    form.crew = ''
    form.start = ''
    form.goal = ''
    form.description = ''
    initialGps.value = null
    gpsError.value = ''
    submitting.value = false
  }
})

const captureGps = () => {
  if (!navigator.geolocation) {
    gpsError.value = 'Geolocation is not supported by your browser.'
    return
  }
  capturing.value = true
  gpsError.value = ''

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      capturing.value = false
      initialGps.value = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        timestamp: new Date().toISOString(),
        name: form.start ? `Start: ${form.start}` : 'Start Waypoint'
      }
    },
    (err) => {
      capturing.value = false
      gpsError.value = `GPS Error: ${err.message}`
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  )
}

const handleClose = () => {
  emit('close')
}

const handleSubmit = () => {
  submitting.value = true
  const waypoints = initialGps.value ? [initialGps.value] : []
  emit('submit', {
    date: form.date,
    crew: form.crew,
    start: form.start,
    goal: form.goal,
    description: form.description,
    waypoints
  })
}
</script>
