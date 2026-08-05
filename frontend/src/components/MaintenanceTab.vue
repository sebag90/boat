<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    <!-- Add Entry Panel -->
    <div class="lg:col-span-5 bg-white rounded-2xl shadow-md border border-marine-100 overflow-hidden">
      <div class="bg-gradient-to-r from-marine-600 to-marine-700 px-6 py-4 text-white flex items-center justify-between">
        <h3 class="font-bold text-base flex items-center space-x-2">
          <svg class="w-5 h-5 text-sand-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          <span>Log Maintenance Job</span>
        </h3>
        <span class="text-xs uppercase bg-white/15 px-2 py-0.5 rounded font-bold tracking-widest text-marine-100">MAINT-ADD</span>
      </div>
      <form @submit.prevent="$emit('submitMaintenance')" class="p-6 space-y-4">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Service Title</label>
          <input v-model="newMaint.title" type="text" required placeholder="e.g. Engine Oil &amp; Filter Change"
            class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
        </div>
        <div class="space-y-1">
          <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Service Date</label>
          <input v-model="newMaint.date" type="date" required
            class="block w-full px-3 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
        </div>
        <div class="space-y-1">
          <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Receipt / Invoice Attachment (PDF / Image)</label>
          <input type="file" @change="$emit('handleMaintFileChange', $event)" ref="fileInput"
            class="block w-full px-3 py-2 border border-marine-200 rounded-lg text-xs bg-marine-50/20">
        </div>
        <div class="space-y-1">
          <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Job Description &amp; Parts Used (Markdown allowed)</label>
          <textarea v-model="newMaint.description" rows="4" placeholder="Replaced impellers, changed oil filters, tested engine at 2500 RPM..."
            class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20 font-mono"></textarea>
        </div>
        <button type="submit"
          class="w-full bg-gradient-to-r from-marine-600 to-marine-800 hover:from-marine-700 hover:to-marine-900 text-white font-bold py-3 px-4 rounded-xl shadow hover:shadow-md active:scale-[0.99] transition duration-150 flex items-center justify-center space-x-2">
          <svg class="w-4 h-4 text-sand-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
          <span>Log Service Job</span>
        </button>
      </form>
    </div>

    <!-- Divider -->
    <div class="lg:hidden h-1 bg-gradient-to-r from-transparent via-marine-200 to-transparent my-2"></div>

    <!-- List Panel -->
    <div class="lg:col-span-7 space-y-4">
      <div class="flex items-center justify-between border-b-2 border-marine-100 pb-2">
        <h3 class="font-serif text-xl font-bold text-marine-700">Service &amp; Maintenance History</h3>
        <span class="text-xs bg-marine-100 text-marine-600 font-bold px-2.5 py-1 rounded-full">{{ maintenanceRecords.length }} Records</span>
      </div>

      <div v-if="maintenanceRecords.length === 0" class="text-center py-12 bg-white rounded-2xl border border-dashed border-marine-200 p-8">
        <svg class="w-12 h-12 text-marine-300 mx-auto" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A1.5 1.5 0 0019.5 18.75l-5.83-5.83M11.42 15.17l2.42-2.42M11.42 15.17L6 10.25M13.84 12.75l2.42-2.42m0 0l-5.83-5.83A1.5 1.5 0 008.25 6.75l5.83 5.83z"/></svg>
        <p class="text-marine-400 font-medium mt-3 text-sm">No maintenance logged yet. Keep your vessel shipshape!</p>
      </div>

      <div v-else class="space-y-4 max-h-[35rem] overflow-y-auto pr-1">
        <div v-for="record in maintenanceRecords" :key="record.id"
          @click="$emit('openPopup', 'maintenance', record)"
          class="bg-white hover:bg-marine-50/30 p-5 rounded-xl border border-marine-100 hover:border-marine-300 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3 group">
          
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-marine-700 bg-sand-100 border border-sand-200 px-3 py-1 rounded-full flex items-center">
                <svg class="w-3.5 h-3.5 mr-1 text-sand-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                {{ formatDate(record.date) }}
              </span>
              <span v-if="record.receipt_filename" class="text-[10px] font-mono text-sand-700 bg-sand-50 border border-sand-100 px-2 py-0.5 rounded truncate max-w-[12rem]">
                🧾 {{ record.receipt_filename }}
              </span>
            </div>

            <h4 class="font-serif text-lg font-bold text-marine-800 pt-1 group-hover:text-marine-600 transition">
              {{ record.title }}
            </h4>
          </div>

          <div class="pt-2 border-t border-marine-50 flex items-center justify-between text-xs">
            <span class="text-marine-400 italic">Click to view receipt &amp; notes</span>
            <span class="text-marine-500 font-bold flex items-center group-hover:translate-x-1 transition duration-150">
              Open Record &rarr;
            </span>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatDate } from '../services/api'

defineProps({
  newMaint: Object,
  maintenanceRecords: Array
})

defineEmits(['submitMaintenance', 'handleMaintFileChange', 'openPopup'])
</script>
