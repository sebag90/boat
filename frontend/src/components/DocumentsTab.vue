<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    <!-- Add Entry Panel -->
    <div class="lg:col-span-5 bg-white rounded-2xl shadow-md border border-marine-100 overflow-hidden">
      <div class="bg-gradient-to-r from-marine-600 to-marine-700 px-6 py-4 text-white flex items-center justify-between">
        <h3 class="font-bold text-base flex items-center space-x-2">
          <svg class="w-5 h-5 text-sand-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          <span>Store New Document</span>
        </h3>
        <span class="text-xs uppercase bg-white/15 px-2 py-0.5 rounded font-bold tracking-widest text-marine-100">DOC-ADD</span>
      </div>
      <form @submit.prevent="$emit('submitDocument')" class="p-6 space-y-4">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Document Title</label>
          <input v-model="newDoc.title" type="text" required placeholder="e.g. Engine Maintenance Manual 2026"
            class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
        </div>
        <div class="space-y-1">
          <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Document File (PDF / Images / Docs)</label>
          <input type="file" @change="$emit('handleDocFileChange', $event)" ref="fileInput"
            class="block w-full px-3 py-2 border border-marine-200 rounded-lg text-xs bg-marine-50/20">
        </div>
        <div class="space-y-1">
          <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Notes &amp; Details (Markdown allowed)</label>
          <textarea v-model="newDoc.description" rows="4" placeholder="Operating instructions, page references, safety procedures..."
            class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20 font-mono"></textarea>
        </div>
        <button type="submit"
          class="w-full bg-gradient-to-r from-marine-600 to-marine-800 hover:from-marine-700 hover:to-marine-900 text-white font-bold py-3 px-4 rounded-xl shadow hover:shadow-md active:scale-[0.99] transition duration-150 flex items-center justify-center space-x-2">
          <svg class="w-4 h-4 text-sand-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
          <span>Store Document</span>
        </button>
      </form>
    </div>

    <!-- Divider -->
    <div class="lg:hidden h-1 bg-gradient-to-r from-transparent via-marine-200 to-transparent my-2"></div>

    <!-- List Panel -->
    <div class="lg:col-span-7 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-marine-100 pb-2 gap-2">
        <h3 class="font-serif text-xl font-bold text-marine-700">Ship's Document Locker</h3>
        <span class="text-xs bg-marine-100 text-marine-600 font-bold px-2.5 py-1 rounded-full self-start sm:self-auto">{{ documents.length }} Documents</span>
      </div>

      <!-- Case Insensitive Search Filter (Revision 1) -->
      <div class="relative">
        <input :value="docSearchQuery" @input="$emit('updateSearchQuery', $event.target.value)" type="text" placeholder="🔍 Case-insensitive search title, notes or filename..."
          class="w-full pl-10 pr-4 py-2.5 border border-marine-200 rounded-xl text-xs bg-white shadow-sm focus:ring-2 focus:ring-marine-500">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-marine-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
        </div>
      </div>

      <div v-if="documents.length === 0" class="text-center py-12 bg-white rounded-2xl border border-dashed border-marine-200 p-8">
        <svg class="w-12 h-12 text-marine-300 mx-auto" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
        <p class="text-marine-400 font-medium mt-3 text-sm">No documents matching filter in locker.</p>
      </div>

      <div v-else class="space-y-4 max-h-[35rem] overflow-y-auto pr-1">
        <div v-for="doc in documents" :key="doc.id"
          @click="$emit('openPopup', 'documents', doc)"
          class="bg-white hover:bg-marine-50/30 p-5 rounded-xl border border-marine-100 hover:border-marine-300 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3 group">
          
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-marine-600 bg-marine-50 border border-marine-100 px-3 py-1 rounded-full flex items-center">
                <svg class="w-3.5 h-3.5 mr-1 text-marine-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ formatDateTime(doc.uploaded_at) }}
              </span>
              <span v-if="doc.filename" class="text-[10px] font-mono text-sand-700 bg-sand-50 border border-sand-100 px-2 py-0.5 rounded truncate max-w-[12rem]">
                📎 {{ doc.filename }}
              </span>
            </div>

            <h4 class="font-serif text-lg font-bold text-marine-800 pt-1 group-hover:text-marine-600 transition">
              {{ doc.title }}
            </h4>
          </div>

          <div class="pt-2 border-t border-marine-50 flex items-center justify-between text-xs">
            <span class="text-marine-400 italic">Click to view &amp; edit document</span>
            <span class="text-marine-500 font-bold flex items-center group-hover:translate-x-1 transition duration-150">
              Open Details &rarr;
            </span>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatDateTime } from '../services/api'

defineProps({
  newDoc: Object,
  documents: Array,
  docSearchQuery: String
})

defineEmits(['submitDocument', 'handleDocFileChange', 'updateSearchQuery', 'openPopup'])
</script>
