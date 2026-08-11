<template>
  <div v-if="activePopup" @click.self="$emit('close')" class="fixed inset-0 bg-marine-950/85 backdrop-blur-sm z-50 overflow-y-auto p-3 sm:p-6 flex items-start justify-center">
    <div class="bg-white rounded-2xl shadow-2xl border border-marine-100 max-w-2xl w-full slide-up overflow-hidden my-auto sm:my-8">
      
      <!-- POPUP HEADER -->
      <div class="bg-gradient-to-r from-marine-700 to-marine-900 px-5 py-4 text-white flex items-center justify-between flex-shrink-0">
        <div>
          <span class="text-[10px] uppercase font-bold tracking-widest text-sand-400 bg-white/10 px-2 py-0.5 rounded">
            {{ activePopup.type }} ENTRY
          </span>
          <h3 class="font-serif text-lg font-bold mt-1">
            {{ activePopup.editMode ? t('modify_entry') : t('log_details') }}
          </h3>
        </div>
        <button @click="$emit('close')" title="Close (Esc)" class="text-marine-300 hover:text-white transition p-1">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- POPUP BODY -->
      <div class="p-5 sm:p-8 space-y-6">

        <!-- READ ONLY MODE VIEW (REVISION 4) -->
        <div v-if="!activePopup.editMode" class="space-y-6">
          
          <!-- Dynamic details per type -->
          <div class="space-y-3">
            <div class="flex flex-wrap gap-2.5 items-center">
              <!-- Show Date Badge -->
              <span v-if="activePopup.type === 'logbook' || activePopup.type === 'maintenance'"
                class="text-xs font-bold text-marine-700 bg-sand-100 border border-sand-200 px-3 py-1 rounded-full flex items-center">
                <svg class="w-3.5 h-3.5 mr-1 text-sand-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                {{ formatDate(activePopup.entry.date) }}
              </span>
              
              <!-- Documents Uploaded At Badge -->
              <span v-if="activePopup.type === 'documents'"
                class="text-xs font-bold text-marine-600 bg-marine-50 border border-marine-100 px-3 py-1 rounded-full flex items-center">
                <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {{ t('uploaded') }} {{ formatDateTime(activePopup.entry.uploaded_at) }}
              </span>

              <!-- Shopping Link Badge -->
              <a v-if="activePopup.type === 'shopping' && activePopup.entry.link"
                :href="activePopup.entry.link" target="_blank"
                class="text-xs font-bold text-marine-600 bg-marine-100 hover:bg-marine-200 border border-marine-200 px-3 py-1 rounded-full inline-flex items-center">
                <svg class="w-3.5 h-3.5 mr-1 text-marine-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                {{ t('purchase_link') }}
              </a>

              <!-- Todo / Shopping Status Badge -->
              <span v-if="activePopup.type === 'todo' || activePopup.type === 'shopping'"
                class="text-xs font-bold px-3 py-1 rounded-full border"
                :class="[activePopup.entry.done ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700']">
                {{ activePopup.entry.done ? t('completed') : t('pending_badge') }}
              </span>
            </div>

            <!-- Title -->
            <h2 class="font-serif text-2xl font-black text-marine-900 leading-tight">
              {{ activePopup.type === 'todo' ? activePopup.entry.text : (activePopup.type === 'shopping' ? activePopup.entry.name : activePopup.entry.title) }}
            </h2>

            <div v-if="activePopup.type === 'logbook'" class="grid grid-cols-2 gap-4 bg-marine-50/50 p-4 rounded-xl border border-marine-100 text-xs">
              <p><strong>Crew:</strong> {{ activePopup.entry.crew || 'No skipper logged' }}</p>
              <p><strong>Start:</strong> {{ activePopup.entry.start || 'Log origin unspecified' }}</p>
              <p><strong>Goal:</strong> {{ activePopup.entry.goal || 'Log destination unspecified' }}</p>
            </div>
          </div>

          <!-- Description parsed as Markdown -->
          <div class="space-y-1.5">
            <h4 class="text-xs font-bold text-marine-600 uppercase tracking-wider">{{ t('log_description') }}</h4>
            <div class="markdown-content bg-[#F8FAFC] border border-marine-100 p-5 rounded-xl min-h-[100px] overflow-y-auto max-h-64 text-sm text-marine-800"
              v-html="renderMarkdown(activePopup.type === 'todo' ? activePopup.entry.text : activePopup.entry.description)">
            </div>
          </div>

          <!-- WAYPOINTS & MAP ROUTE PREVIEW (REVISION 13) -->
          <div v-if="activePopup.type === 'logbook'" class="space-y-4 border-t border-marine-100 pt-4">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-marine-600 uppercase tracking-wider flex items-center space-x-1.5">
                <svg class="w-4 h-4 text-marine-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                <span>Voyage Waypoints &amp; Route</span>
              </h4>
              <div class="flex items-center space-x-2">
                <button type="button" @click="triggerTsvUpload" :disabled="importingTsv"
                  class="bg-marine-100 hover:bg-marine-200 text-marine-800 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow-sm transition active:scale-95 disabled:opacity-50">
                  <svg class="w-4 h-4 text-marine-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
                  <span>{{ importingTsv ? 'Importing...' : '📥 Import File (JSONL / TSV)' }}</span>
                </button>
                <input type="file" ref="tsvFileInput" accept=".jsonl,.json,.tsv,.csv,.txt" @change="handleTsvUpload" class="hidden" />

                <button type="button" @click="$emit('addWaypoint')" :disabled="capturingLocation"
                  class="bg-sand-500 hover:bg-sand-600 text-marine-900 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow-sm transition active:scale-95 disabled:opacity-50">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                  <span>{{ capturingLocation ? 'Locating...' : '📍 Add Single Point' }}</span>
                </button>
              </div>
            </div>

            <!-- Auto-Tracker Control Box -->
            <div class="bg-marine-50/90 rounded-xl p-3 border border-marine-200 space-y-2">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center space-x-1.5">
                  <span class="text-xs font-bold text-marine-800 uppercase tracking-wider flex items-center">
                    <svg class="w-4 h-4 mr-1 text-marine-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Auto-Tracker
                  </span>
                  <select v-model="autoTrackIntervalLocal" :disabled="isAutoTracking" class="text-xs border border-marine-200 rounded px-1.5 py-0.5 bg-white font-semibold text-marine-700">
                    <option :value="60">1 min</option>
                    <option :value="120">2 mins</option>
                    <option :value="300">5 mins</option>
                    <option :value="600">10 mins</option>
                  </select>
                </div>

                <button v-if="!isAutoTracking" type="button" @click="$emit('startAutoTracking')"
                  class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow transition active:scale-95">
                  <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>▶ Start Auto-Track</span>
                </button>
                <button v-else type="button" @click="$emit('stopAutoTracking')"
                  class="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow transition active:scale-95">
                  <span>⏹ Stop Auto-Track</span>
                </button>
              </div>

              <div v-if="isAutoTracking" class="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg flex items-center justify-between">
                <span class="flex items-center">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5 pulse-light"></span>
                  Active — Next point in {{ secondsToNextTrack }}s
                </span>
                <span v-if="lastTrackTime" class="text-[10px] text-emerald-600 font-normal">Last: {{ formatDateTime(lastTrackTime.toISOString()) }}</span>
              </div>
            </div>

            <p v-if="locationError" class="text-xs text-red-600 bg-red-50 p-2 rounded">{{ locationError }}</p>

            <div v-if="activePopup.entry.waypoints && activePopup.entry.waypoints.length > 0" class="space-y-4">
              <!-- Voyage Summary Banner -->
              <div v-if="activePopup.entry.waypoints.length >= 2" class="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-marine-900 text-white p-3 sm:p-4 rounded-xl shadow-inner text-center">
                <div>
                  <p class="text-[10px] uppercase font-bold text-marine-300">Total Distance</p>
                  <p class="text-sm font-extrabold text-sand-400 mt-0.5">{{ calculateVoyageSummary(activePopup.entry.waypoints).totalDistanceNM.toFixed(2) }} NM</p>
                  <p class="text-[10px] text-marine-400">({{ calculateVoyageSummary(activePopup.entry.waypoints).totalDistanceKm.toFixed(1) }} km)</p>
                </div>
                <div>
                  <p class="text-[10px] uppercase font-bold text-marine-300">Avg Speed</p>
                  <p class="text-sm font-extrabold text-sand-400 mt-0.5">{{ calculateVoyageSummary(activePopup.entry.waypoints).avgSpeedKnots.toFixed(1) }} knots</p>
                  <p class="text-[10px] text-marine-400">({{ calculateVoyageSummary(activePopup.entry.waypoints).avgSpeedKmh.toFixed(1) }} km/h)</p>
                </div>
                <div>
                  <p class="text-[10px] uppercase font-bold text-marine-300">Passage Duration</p>
                  <p class="text-sm font-extrabold text-sand-400 mt-0.5">{{ formatDuration(calculateVoyageSummary(activePopup.entry.waypoints).totalDurationMs) }}</p>
                </div>
                <div>
                  <p class="text-[10px] uppercase font-bold text-marine-300">Waypoints</p>
                  <p class="text-sm font-extrabold text-sand-400 mt-0.5">{{ activePopup.entry.waypoints.length }} Recorded</p>
                </div>
              </div>

              <!-- Waypoints Table -->
              <div class="overflow-x-auto border border-marine-200 rounded-xl bg-white shadow-sm">
                <table class="w-full text-left text-xs">
                  <thead class="bg-marine-100/70 text-marine-800 font-bold uppercase text-[10px] tracking-wider border-b border-marine-200">
                    <tr>
                      <th class="p-2.5">#</th>
                      <th class="p-2.5">Timestamp</th>
                      <th class="p-2.5">Coords (Lat, Lon)</th>
                      <th class="p-2.5">Leg Dist &amp; Speed</th>
                      <th class="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-marine-100">
                    <tr v-for="(wp, idx) in activePopup.entry.waypoints" :key="wp.id || idx" class="hover:bg-marine-50/50">
                      <td class="p-2.5 font-bold text-marine-800">{{ idx + 1 }}</td>
                      <td class="p-2.5 text-marine-600">{{ formatDateTime(wp.timestamp) }}</td>
                      <td class="p-2.5 font-mono text-marine-800">{{ wp.latitude.toFixed(5) }}, {{ wp.longitude.toFixed(5) }}</td>
                      <td class="p-2.5">
                        <span v-if="idx > 0" class="font-semibold text-marine-700">
                          {{ calculateLegStats(activePopup.entry.waypoints[idx-1], wp).distanceNM.toFixed(2) }} NM @ {{ calculateLegStats(activePopup.entry.waypoints[idx-1], wp).speedKnots.toFixed(1) }} kt
                        </span>
                        <span v-else class="text-marine-400 italic">Start</span>
                      </td>
                      <td class="p-2.5 text-right">
                        <button type="button" @click="$emit('deleteWaypoint', wp.id, idx)" class="text-red-500 hover:text-red-700 font-bold">
                          Delete
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Map Component -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-marine-700 uppercase tracking-wider flex items-center">
                    <svg class="w-4 h-4 mr-1 text-marine-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.812a1.875 1.875 0 00-1.006 0L3.622 5.816C3.24 6.007 3 6.396 3 6.822v11.858c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/></svg>
                    Voyage Route Track
                  </span>
                  <a v-if="activePopup.entry.waypoints && activePopup.entry.waypoints.length > 0"
                    :href="getOpenStreetMapUrl(activePopup.entry.waypoints)" target="_blank"
                    class="text-xs bg-marine-100 hover:bg-marine-200 text-marine-800 font-bold px-3 py-1 rounded-lg inline-flex items-center space-x-1">
                    <span>{{ t('open_map') }}</span>
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                  </a>
                </div>
                <WaypointsMap :waypoints="activePopup.entry.waypoints" />
              </div>
            </div>
            <div v-else class="text-xs text-marine-400 italic bg-marine-50/50 p-4 rounded-xl border border-marine-100">
              No waypoints recorded for this voyage. Click "Add Waypoint with Current Location" above to capture location points and view route preview.
            </div>
          </div>

          <!-- ATTACHMENTS (PDF READER & CLICCABLE FILE FOR MOBILE) -->
          <div v-if="hasAttachment(activePopup.entry, activePopup.type)" class="space-y-3.5 border-t border-marine-100 pt-5">
            <h4 class="text-xs font-bold text-marine-600 uppercase tracking-wider">Ship's Document Lock</h4>
            
            <div class="bg-marine-50 rounded-xl p-4 border border-marine-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="flex items-center space-x-3 min-w-0">
                <div class="w-10 h-10 bg-white border rounded-lg flex items-center justify-center flex-shrink-0 text-marine-600 shadow-sm">
                  <svg class="w-5 h-5 text-sand-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-bold text-marine-800 truncate">{{ getAttachmentName(activePopup.entry, activePopup.type) }}</p>
                  <p class="text-[10px] text-marine-400 font-mono tracking-tight mt-0.5 truncate">Attachment File</p>
                </div>
              </div>

              <a :href="getAttachmentUrlWithAuth(currentBoat.id, activePopup.entry, activePopup.type)" target="_blank"
                class="bg-white hover:bg-marine-100 border border-marine-200 hover:border-marine-300 text-marine-800 font-bold py-2 px-4 rounded-lg text-xs shadow-sm hover:shadow transition flex items-center justify-center space-x-1.5 flex-shrink-0">
                <svg class="w-4 h-4 text-sand-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                <span>{{ t('open_attachment') }}</span>
              </a>
            </div>

            <!-- PDF Viewer -->
            <div v-if="isPdfAttachment(activePopup.entry, activePopup.type)" class="border-2 border-marine-200 rounded-xl overflow-hidden bg-marine-950 mt-4 shadow-inner">
              <div class="bg-marine-800 text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold">
                <span class="flex items-center">
                  <span class="w-2 h-2 bg-emerald-500 rounded-full mr-2 pulse-light"></span>
                  INLINE MOBI-PDF CO-NAVIGATOR
                </span>
                <span class="text-marine-300">Document Reader</span>
              </div>
              <iframe :src="getAttachmentUrlWithAuth(currentBoat.id, activePopup.entry, activePopup.type)" class="w-full h-96 border-none" loading="lazy"></iframe>
            </div>

            <!-- Image Viewer -->
            <div v-else-if="isImageAttachment(activePopup.entry, activePopup.type)" class="border border-marine-100 rounded-xl overflow-hidden bg-marine-50 max-h-72 flex justify-center items-center shadow-inner">
              <img :src="getAttachmentUrlWithAuth(currentBoat.id, activePopup.entry, activePopup.type)" alt="Attachment Preview" class="max-h-64 object-contain">
            </div>
          </div>

          <!-- CONTROL BUTTONS: MODIFY & DECOMMISSION -->
          <div class="border-t border-marine-100 pt-5 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
            <button @click="$emit('deleteEntry')"
              class="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2.5 px-5 rounded-lg border border-red-200 hover:border-red-300 transition text-sm flex items-center justify-center space-x-1.5 active:scale-95">
              <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              <span>{{ t('delete') }}</span>
            </button>
            
            <div class="w-full sm:w-auto flex space-x-3 justify-end">
              <button @click="$emit('close')"
                class="flex-1 sm:flex-none px-5 py-2.5 border border-marine-200 rounded-lg text-sm font-semibold text-marine-600 hover:bg-marine-50 transition">
                {{ t('close') }}
              </button>
              <button @click="activePopup.editMode = true"
                class="flex-1 sm:flex-none bg-gradient-to-r from-marine-600 to-marine-800 hover:from-marine-700 hover:to-marine-900 text-white font-bold py-2.5 px-6 rounded-lg shadow transition text-sm flex items-center justify-center space-x-1.5">
                <svg class="w-4 h-4 text-sand-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                <span>{{ t('edit') }}</span>
              </button>
            </div>
          </div>

        </div>

        <!-- EDITING MODE VIEW -->
        <form v-else @submit.prevent="$emit('saveEdit', editForm)" class="space-y-5 px-1 sm:px-2">
          
          <!-- Logbook Edit -->
          <div v-if="activePopup.type === 'logbook'" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Trip Date</label>
                <input v-model="editForm.date" type="date" required class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Crew List</label>
                <input v-model="editForm.crew" type="text" class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Start Port</label>
                <input v-model="editForm.start" type="text" class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Goal Port</label>
                <input v-model="editForm.goal" type="text" class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
              </div>
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Cruise Notes (Markdown)</label>
              <textarea v-model="editForm.description" rows="5" class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm font-mono text-xs focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20"></textarea>
            </div>
          </div>

          <!-- Documents Edit -->
          <div v-if="activePopup.type === 'documents'" class="space-y-4">
            <div class="space-y-1">
              <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">{{ t('doc_title') }}</label>
              <input v-model="editForm.title" type="text" required class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">{{ t('upload_attachments') }}</label>
              <FileUploadDropzone
                :multiple="false"
                @change="$emit('fileChange', $event)"
                :hint="t('replace_doc_hint')"
              />
              <p class="text-[10px] text-marine-400 font-mono italic mt-1" v-if="activePopup.entry.filename">Currently: {{ activePopup.entry.filename }}</p>
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Notes (Markdown)</label>
              <textarea v-model="editForm.description" rows="5" class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm font-mono text-xs focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20"></textarea>
            </div>
          </div>

          <!-- Maintenance Edit -->
          <div v-if="activePopup.type === 'maintenance'" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Service Task</label>
                <input v-model="editForm.title" type="text" required class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Service Date</label>
                <input v-model="editForm.date" type="date" required class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
              </div>
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">{{ t('receipt_attachment') }}</label>
              <FileUploadDropzone
                :multiple="false"
                @change="$emit('fileChange', $event)"
                :hint="t('replace_receipt_hint')"
              />
              <p class="text-[10px] text-marine-400 font-mono italic mt-1" v-if="activePopup.entry.receipt_filename">Currently: {{ activePopup.entry.receipt_filename }}</p>
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Maintenance Notes (Markdown)</label>
              <textarea v-model="editForm.description" rows="5" class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm font-mono text-xs focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20"></textarea>
            </div>
          </div>

          <!-- Todo Edit -->
          <div v-if="activePopup.type === 'todo'" class="space-y-4">
            <div class="space-y-1">
              <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">{{ t('task_description') }}</label>
              <textarea v-model="editForm.text" rows="3" required class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm font-mono text-xs focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20"></textarea>
            </div>
            <div class="flex items-center space-x-3 bg-marine-50 p-3 rounded-lg border border-marine-100">
              <input v-model="editForm.done" type="checkbox" id="editTodoDone" class="w-5 h-5 rounded border-marine-300 text-marine-600 focus:ring-marine-500">
              <label for="editTodoDone" class="text-xs font-bold text-marine-700 uppercase tracking-wide cursor-pointer">{{ t('mark_completed') }}</label>
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">{{ t('upload_attachments') }}</label>
              <FileUploadDropzone
                :multiple="false"
                @change="$emit('fileChange', $event)"
                :hint="t('replace_attachment_hint')"
              />
              <p class="text-[10px] text-marine-400 font-mono italic mt-1" v-if="activePopup.entry.file_filename">Currently: {{ activePopup.entry.file_filename }}</p>
            </div>
          </div>

          <!-- Shopping Edit -->
          <div v-if="activePopup.type === 'shopping'" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">{{ t('item_name') }}</label>
                <input v-model="editForm.name" type="text" required class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">{{ t('shop_web_link') }}</label>
                <input v-model="editForm.link" type="url" class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm font-mono text-xs focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
              </div>
            </div>
            <div class="flex items-center space-x-3 bg-marine-50 p-3 rounded-lg border border-marine-100">
              <input v-model="editForm.done" type="checkbox" id="editShopDone" class="w-5 h-5 rounded border-marine-300 text-marine-600 focus:ring-marine-500">
              <label for="editShopDone" class="text-xs font-bold text-marine-700 uppercase tracking-wide cursor-pointer">{{ t('mark_purchased') }}</label>
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">{{ t('upload_attachments') }}</label>
              <FileUploadDropzone
                :multiple="false"
                @change="$emit('fileChange', $event)"
                :hint="t('replace_attachment_hint')"
              />
              <p class="text-[10px] text-marine-400 font-mono italic mt-1" v-if="activePopup.entry.file_filename">Currently: {{ activePopup.entry.file_filename }}</p>
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">{{ t('item_description') }}</label>
              <textarea v-model="editForm.description" rows="3" class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm font-mono text-xs focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20"></textarea>
            </div>
          </div>

          <!-- Buttons -->
          <div class="border-t border-marine-100 pt-5 flex space-x-3 justify-end">
            <button type="button" @click="activePopup.editMode = false"
              class="px-5 py-2.5 border border-marine-200 rounded-lg text-sm font-semibold text-marine-600 hover:bg-marine-50 transition">
              {{ t('cancel') }}
            </button>
            <button type="submit"
              class="bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold py-2.5 px-6 rounded-lg shadow transition text-sm flex items-center space-x-1.5">
              <svg class="w-4 h-4 text-emerald-100" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              <span>{{ t('save_changes') }}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import FileUploadDropzone from './FileUploadDropzone.vue'
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
  hasAttachment,
  getAttachmentName,
  getAttachmentUrlWithAuth,
  importWaypoints
} from '../services/api'

const props = defineProps({
  activePopup: Object,
  currentBoat: Object,
  capturingLocation: Boolean,
  locationError: String,
  isAutoTracking: Boolean,
  autoTrackInterval: Number,
  secondsToNextTrack: Number,
  lastTrackTime: Object
})

const emit = defineEmits([
  'close', 'addWaypoint', 'deleteWaypoint', 'startAutoTracking', 'stopAutoTracking',
  'updateAutoTrackInterval', 'deleteEntry', 'saveEdit', 'fileChange', 'refreshEntry'
])

const editForm = ref({})
const autoTrackIntervalLocal = ref(props.autoTrackInterval || 60)
const tsvFileInput = ref(null)
const importingTsv = ref(false)

const triggerTsvUpload = () => {
  if (tsvFileInput.value) tsvFileInput.value.click()
}

const handleTsvUpload = async (e) => {
  const file = e.target.files[0]
  if (!file || !props.activePopup || !props.activePopup.entry) return
  try {
    importingTsv.value = true
    
    // Parse on client-side first for immediate UI update & unsaved entries
    const text = await file.text()
    const lines = text.split('\n').map(l => l.trim()).filter(l => l)
    const importedWps = []

    for (const line of lines) {
      let lat = null, lon = null, ts = new Date().toISOString(), name = null
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          const data = JSON.parse(line)
          lat = parseFloat(data.latitude ?? data.lat)
          lon = parseFloat(data.longitude ?? data.lon ?? data.lng)
          name = data.name || null
          if (data.timestamp || data.time) {
            ts = new Date(data.timestamp || data.time).toISOString()
          }
        } catch (err) { continue }
      } else {
        if (line.toLowerCase().includes('latitude') || line.toLowerCase().includes('lat')) continue
        const parts = line.includes('\t') ? line.split('\t') : line.split(',')
        const cleanParts = parts.map(p => p.trim()).filter(p => p)
        if (cleanParts.length < 2) continue
        lat = parseFloat(cleanParts[0])
        lon = parseFloat(cleanParts[1])
        if (isNaN(lat) || isNaN(lon)) continue
        if (cleanParts.length >= 3) {
          try { ts = new Date(cleanParts[2]).toISOString() } catch (err) {}
        }
      }

      if (lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)) {
        importedWps.push({ latitude: lat, longitude: lon, timestamp: ts, name })
      }
    }

    if (!props.activePopup.entry.waypoints) props.activePopup.entry.waypoints = []

    if (props.activePopup.entry.id) {
      try {
        const newWps = await importWaypoints(props.activePopup.entry.id, file)
        if (newWps && newWps.length > 0) {
          props.activePopup.entry.waypoints.push(...newWps)
        } else {
          props.activePopup.entry.waypoints.push(...importedWps)
        }
      } catch (err) {
        props.activePopup.entry.waypoints.push(...importedWps)
      }
    } else {
      props.activePopup.entry.waypoints.push(...importedWps)
    }
    emit('refreshEntry')
  } catch (err) {
    alert('Failed to import file: ' + err.message)
  } finally {
    importingTsv.value = false
    if (tsvFileInput.value) tsvFileInput.value.value = ''
  }
}

watch(() => props.activePopup, (popup) => {
  if (popup && popup.entry) {
    editForm.value = JSON.parse(JSON.stringify(popup.entry))
  }
}, { immediate: true, deep: true })

watch(autoTrackIntervalLocal, (val) => {
  emit('updateAutoTrackInterval', val)
})

const isPdfAttachment = (entry, type) => {
  const name = getAttachmentName(entry, type).toLowerCase()
  return name.endsWith('.pdf')
}

const isImageAttachment = (entry, type) => {
  const name = getAttachmentName(entry, type).toLowerCase()
  return name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.gif') || name.endsWith('.webp')
}
</script>
