<template>
  <div class="space-y-6">
    
    <!-- Top Bar Header & Action -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-marine-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center space-x-2">
          <h3 class="font-serif text-2xl font-extrabold text-marine-900">Service &amp; Maintenance History</h3>
          <span class="text-xs bg-marine-100 text-marine-800 font-bold px-2.5 py-0.5 rounded-full border border-marine-200">
            {{ maintenanceRecords.length }} {{ maintenanceRecords.length === 1 ? 'Record' : 'Records' }}
          </span>
        </div>
        <p class="text-xs text-marine-500">Track oil changes, impeller replacements, repairs, and service receipts</p>
      </div>

      <button @click="showCreateModal = true"
        class="w-full sm:w-auto bg-gradient-to-r from-marine-600 to-marine-800 hover:from-marine-700 hover:to-marine-900 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition flex items-center justify-center space-x-2 text-sm flex-shrink-0">
        <svg class="w-5 h-5 text-sand-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        <span>Log Maintenance Job</span>
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="maintenanceRecords.length === 0" class="text-center py-16 bg-white rounded-2xl border border-dashed border-marine-200 p-8 space-y-4">
      <div class="w-16 h-16 bg-marine-50 text-marine-600 rounded-full flex items-center justify-center mx-auto border border-marine-100">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A1.5 1.5 0 0019.5 18.75l-5.83-5.83M11.42 15.17l2.42-2.42M11.42 15.17L6 10.25M13.84 12.75l2.42-2.42m0 0l-5.83-5.83A1.5 1.5 0 008.25 6.75l5.83 5.83z"/></svg>
      </div>
      <div>
        <h4 class="text-marine-900 font-bold text-lg">No Maintenance Logged Yet</h4>
        <p class="text-marine-500 font-medium text-xs mt-1 max-w-sm mx-auto">
          Keep your vessel shipshape! Record engine services, gear replacements, and store invoice receipts.
        </p>
      </div>
      <button @click="showCreateModal = true"
        class="inline-flex items-center space-x-2 bg-marine-700 hover:bg-marine-800 text-white font-bold py-2.5 px-5 rounded-xl shadow text-xs transition">
        <svg class="w-4 h-4 text-sand-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        <span>Log First Service Job</span>
      </button>
    </div>

    <!-- Maintenance Records Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="record in maintenanceRecords" :key="record.id"
        @click="$emit('openPopup', 'maintenance', record)"
        class="bg-white hover:bg-marine-50/40 p-5 rounded-2xl border border-marine-100 hover:border-marine-300 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group">
        
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-marine-700 bg-sand-100 border border-sand-200 px-3 py-1 rounded-full flex items-center">
              <svg class="w-3.5 h-3.5 mr-1.5 text-sand-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
              {{ formatDate(record.date) }}
            </span>
            <span v-if="record.receipt_filename" class="text-[10px] font-mono text-sand-700 bg-sand-50 border border-sand-100 px-2 py-0.5 rounded truncate max-w-[12rem]">
              🧾 {{ record.receipt_filename }}
            </span>
          </div>

          <h4 class="font-serif text-lg font-bold text-marine-800 group-hover:text-marine-600 transition">
            {{ record.title }}
          </h4>
          <p v-if="record.description" class="text-xs text-marine-600 line-clamp-2 italic font-sans">
            "{{ record.description }}"
          </p>
        </div>

        <div class="pt-3 border-t border-marine-100/60 flex items-center justify-between text-xs">
          <span class="text-marine-400 italic">Click to view receipt &amp; details</span>
          <span class="text-marine-600 font-bold flex items-center group-hover:translate-x-1 transition duration-150">
            Open Record &rarr;
          </span>
        </div>

      </div>
    </div>

    <!-- Create Maintenance Modal -->
    <div v-if="showCreateModal" @click.self="showCreateModal = false" class="fixed inset-0 bg-marine-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl border border-marine-100 max-w-lg w-full slide-up overflow-hidden my-auto">
        
        <div class="bg-gradient-to-r from-marine-700 to-marine-900 px-6 py-4 text-white flex items-center justify-between">
          <h3 class="font-serif text-lg font-bold flex items-center space-x-2">
            <svg class="w-5 h-5 text-sand-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            <span>Log Maintenance Job</span>
          </h3>
          <button @click="showCreateModal = false" class="text-marine-300 hover:text-white transition p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">Service Title *</label>
              <input v-model="newMaint.title" type="text" required placeholder="e.g. Engine Oil &amp; Filter Change"
                class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">Service Date *</label>
              <input v-model="newMaint.date" type="date" required
                class="block w-full px-3 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">Receipt / Invoice Attachments (PDF / Images)</label>
            <FileUploadDropzone
              v-model="newMaint.files"
              accept="image/*,.pdf,.doc,.docx"
              hint="Upload multiple receipts or photos"
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">Job Description &amp; Parts Used (Markdown allowed)</label>
            <textarea v-model="newMaint.description" rows="4" placeholder="Replaced impellers, changed oil filters, tested engine at 2500 RPM..."
              class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20 font-mono"></textarea>
          </div>

          <div class="pt-3 flex space-x-3 justify-end border-t border-marine-100">
            <button type="button" @click="showCreateModal = false"
              class="px-4 py-2.5 border border-marine-200 rounded-lg hover:bg-marine-50 text-sm font-semibold text-marine-600 transition">
              Cancel
            </button>
            <button type="submit"
              class="bg-gradient-to-r from-marine-600 to-marine-800 hover:from-marine-700 hover:to-marine-900 text-white font-bold py-2.5 px-6 rounded-lg shadow transition text-sm flex items-center space-x-2">
              <span>Log Service Job</span>
            </button>
          </div>
        </form>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import FileUploadDropzone from './FileUploadDropzone.vue'
import { formatDate } from '../services/api'

const props = defineProps({
  newMaint: Object,
  maintenanceRecords: Array
})

const emit = defineEmits(['submitMaintenance', 'handleMaintFileChange', 'openPopup'])

const showCreateModal = ref(false)

const handleSubmit = () => {
  emit('submitMaintenance')
  showCreateModal.value = false
}
</script>
