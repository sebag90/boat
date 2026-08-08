<template>
  <div class="space-y-6">
    
    <!-- Top Bar with Stats & Primary Action -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-marine-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center space-x-2">
          <h3 class="font-serif text-2xl font-extrabold text-marine-900">{{ t('logbook_title') }}</h3>
          <span class="text-xs bg-marine-100 text-marine-800 font-bold px-2.5 py-0.5 rounded-full border border-marine-200">
            {{ logEntries.length }}
          </span>
        </div>
        <p class="text-xs text-marine-500">{{ t('logbook_subtitle') }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Total Nautical Miles Summary Pill -->
        <div v-if="totalNauticalMiles > 0" class="bg-sand-100/80 border border-sand-300/60 px-4 py-2 rounded-xl text-left hidden sm:block">
          <span class="text-[10px] uppercase font-bold text-sand-800 tracking-wider block">{{ t('total_distance_logged') }}</span>
          <span class="text-sm font-extrabold text-marine-900">{{ totalNauticalMiles.toFixed(1) }} NM</span>
        </div>

        <button @click="$emit('openCreateModal')"
          class="w-full sm:w-auto bg-gradient-to-r from-marine-600 to-marine-800 hover:from-marine-700 hover:to-marine-900 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition flex items-center justify-center space-x-2 text-sm">
          <svg class="w-5 h-5 text-sand-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          <span>{{ t('record_new_voyage') }}</span>
        </button>
      </div>
    </div>

    <!-- Search / Filter Bar -->
    <div v-if="logEntries.length > 0" class="flex flex-col sm:flex-row items-center justify-between gap-3 bg-marine-50/50 p-3 rounded-xl border border-marine-100">
      <div class="relative w-full sm:w-80">
        <input v-model="searchQuery" type="text" placeholder="Search ports, crew, notes..."
          class="w-full pl-9 pr-3 py-2 border border-marine-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-marine-500 transition">
        <svg class="w-4 h-4 text-marine-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
      </div>
      <div class="text-xs text-marine-500 font-medium">
        Showing {{ filteredEntries.length }} of {{ logEntries.length }} entries
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="logEntries.length === 0" class="text-center py-16 bg-white rounded-2xl border border-dashed border-marine-200 p-8 space-y-4">
      <div class="w-16 h-16 bg-marine-50 text-marine-600 rounded-full flex items-center justify-center mx-auto border border-marine-100">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
      </div>
      <div>
        <h4 class="text-marine-900 font-bold text-lg">{{ t('no_voyages_recorded') }}</h4>
        <p class="text-marine-500 font-medium text-xs mt-1 max-w-sm mx-auto">
          {{ t('no_voyages_sub') }}
        </p>
      </div>
      <button @click="$emit('openCreateModal')"
        class="inline-flex items-center space-x-2 bg-marine-700 hover:bg-marine-800 text-white font-bold py-2.5 px-5 rounded-xl shadow text-xs transition">
        <svg class="w-4 h-4 text-sand-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        <span>{{ t('record_first_voyage') }}</span>
      </button>
    </div>

    <!-- Voyages Grid (Ordered Newest First - Requirement 6) -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="entry in filteredEntries" :key="entry.id"
        @click="$emit('openVoyageDetail', entry)"
        class="bg-white hover:bg-marine-50/40 p-5 rounded-2xl border border-marine-100 hover:border-marine-300 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group">
        
        <div class="space-y-3">
          <!-- Top Row Badges: Date (DD-MM-YYYY) & Crew -->
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="text-xs font-bold text-marine-800 bg-sand-100 border border-sand-200 px-3 py-1 rounded-full flex items-center">
              <svg class="w-3.5 h-3.5 mr-1.5 text-sand-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
              {{ formatDate(entry.date) }}
            </span>
            <span class="text-[11px] font-bold text-marine-500 bg-marine-50 px-2.5 py-0.5 rounded-md border border-marine-100">
              {{ entry.crew ? `Crew: ${entry.crew}` : 'Solo Voyage' }}
            </span>
          </div>

          <!-- Passage Route Title -->
          <h4 class="font-serif text-lg font-bold text-marine-900 group-hover:text-marine-700 transition flex items-center space-x-2">
            <span>{{ entry.start || 'Start' }}</span>
            <span class="text-marine-400">➔</span>
            <span>{{ entry.goal || 'Destination' }}</span>
          </h4>

          <!-- Notes Snippet -->
          <p v-if="entry.description" class="text-xs text-marine-600 line-clamp-2 italic font-sans">
            "{{ entry.description }}"
          </p>
        </div>

        <!-- Footer Info: Waypoints & Distance -->
        <div class="pt-3 border-t border-marine-100/60 flex items-center justify-between text-xs">
          <div class="flex items-center space-x-2">
            <span v-if="entry.waypoints && entry.waypoints.length > 0" class="text-[11px] font-bold text-marine-800 bg-marine-50 border border-marine-200 rounded-md px-2.5 py-1 flex items-center space-x-1">
              <span>📍 {{ entry.waypoints.length }} {{ entry.waypoints.length === 1 ? 'pt' : 'pts' }}</span>
              <span v-if="getDistance(entry) > 0" class="text-marine-600 font-semibold ml-1">
                ({{ getDistance(entry).toFixed(1) }} NM)
              </span>
            </span>
            <span v-else class="text-[11px] text-marine-400 italic">No GPS waypoints</span>
          </div>

          <span class="text-marine-600 font-bold flex items-center space-x-1 group-hover:translate-x-1 transition duration-150 text-xs">
            <span>View Log</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
          </span>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { t } from '../services/i18n'
import { formatDate, calculateVoyageSummary } from '../services/api'

const props = defineProps({
  logEntries: {
    type: Array,
    default: () => []
  }
})

defineEmits(['openCreateModal', 'openVoyageDetail'])

const searchQuery = ref('')

// Sort entries descending by date (newest first - Requirement 6)
const sortedEntries = computed(() => {
  return [...props.logEntries].sort((a, b) => new Date(b.date) - new Date(a.date))
})

const filteredEntries = computed(() => {
  if (!searchQuery.value) return sortedEntries.value
  const q = searchQuery.value.toLowerCase().trim()
  return sortedEntries.value.filter(e =>
    (e.start && e.start.toLowerCase().includes(q)) ||
    (e.goal && e.goal.toLowerCase().includes(q)) ||
    (e.crew && e.crew.toLowerCase().includes(q)) ||
    (e.description && e.description.toLowerCase().includes(q)) ||
    (e.date && formatDate(e.date).includes(q))
  )
})

const totalNauticalMiles = computed(() => {
  return props.logEntries.reduce((acc, entry) => {
    if (entry.waypoints && entry.waypoints.length >= 2) {
      return acc + calculateVoyageSummary(entry.waypoints).totalDistanceNM
    }
    return acc
  }, 0)
})

const getDistance = (entry) => {
  if (!entry.waypoints || entry.waypoints.length < 2) return 0
  return calculateVoyageSummary(entry.waypoints).totalDistanceNM
}
</script>
