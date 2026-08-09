<template>
  <div class="space-y-6">
    
    <!-- Top Bar with Header Stats & Primary Action -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-marine-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center space-x-2">
          <h3 class="font-serif text-2xl font-extrabold text-marine-900">{{ t('documents_title') }}</h3>
          <span class="text-xs bg-marine-100 text-marine-800 font-bold px-2.5 py-0.5 rounded-full border border-marine-200">
            {{ documents.length }}
          </span>
        </div>
        <p class="text-xs text-marine-500">{{ t('documents_subtitle') }}</p>
      </div>

      <button @click="showCreateModal = true"
        class="w-full sm:w-auto bg-gradient-to-r from-marine-600 to-marine-800 hover:from-marine-700 hover:to-marine-900 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition flex items-center justify-center space-x-2 text-sm flex-shrink-0">
        <svg class="w-5 h-5 text-sand-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        <span>{{ t('store_new_document') }}</span>
      </button>
    </div>

    <!-- Search / Filter Bar -->
    <div class="relative">
      <input :value="docSearchQuery" @input="$emit('updateSearchQuery', $event.target.value)" type="text" :placeholder="'🔍 ' + t('search_documents')"
        class="w-full pl-10 pr-4 py-3 border border-marine-200 rounded-xl text-xs bg-white shadow-sm focus:ring-2 focus:ring-marine-500 transition">
      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-marine-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="documents.length === 0" class="text-center py-16 bg-white rounded-2xl border border-dashed border-marine-200 p-8 space-y-4">
      <div class="w-16 h-16 bg-marine-50 text-marine-600 rounded-full flex items-center justify-center mx-auto border border-marine-100">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
      </div>
      <div>
        <h4 class="text-marine-900 font-bold text-lg">{{ t('no_documents_found') }}</h4>
        <p class="text-marine-500 font-medium text-xs mt-1 max-w-sm mx-auto">
          {{ t('no_documents_sub') }}
        </p>
      </div>
      <button @click="showCreateModal = true"
        class="inline-flex items-center space-x-2 bg-marine-700 hover:bg-marine-800 text-white font-bold py-2.5 px-5 rounded-xl shadow text-xs transition">
        <svg class="w-4 h-4 text-sand-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        <span>{{ t('store_first_document') }}</span>
      </button>
    </div>

    <!-- Documents Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="doc in documents" :key="doc.id"
        @click="$emit('openPopup', 'documents', doc)"
        class="bg-white hover:bg-marine-50/40 p-5 rounded-2xl border border-marine-100 hover:border-marine-300 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group">
        
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] font-bold text-marine-600 bg-marine-50 border border-marine-100 px-2.5 py-1 rounded-full flex items-center">
              <svg class="w-3.5 h-3.5 mr-1 text-marine-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {{ formatDateTime(doc.uploaded_at) }}
            </span>
            <span v-if="doc.filename" class="text-[10px] font-mono text-sand-700 bg-sand-50 border border-sand-100 px-2 py-0.5 rounded truncate max-w-[10rem]">
              📎 {{ doc.filename }}
            </span>
          </div>

          <h4 class="font-serif text-lg font-bold text-marine-800 group-hover:text-marine-600 transition pt-1">
            {{ doc.title }}
          </h4>
          <p v-if="doc.description" class="text-xs text-marine-600 line-clamp-2 font-mono bg-slate-50 p-2 rounded border border-slate-100">
            {{ doc.description }}
          </p>
        </div>

        <div class="pt-3 border-t border-marine-100/60 flex items-center justify-between text-xs">
          <span class="text-marine-400 italic">{{ t('click_view_edit') }}</span>
          <span class="text-marine-600 font-bold flex items-center group-hover:translate-x-1 transition duration-150">
            {{ t('details_arrow') }}
          </span>
        </div>

      </div>
    </div>

    <!-- Create Document Modal -->
    <div v-if="showCreateModal" @click.self="showCreateModal = false" class="fixed inset-0 bg-marine-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl border border-marine-100 max-w-lg w-full slide-up overflow-hidden my-auto">
        
        <div class="bg-gradient-to-r from-marine-700 to-marine-900 px-6 py-4 text-white flex items-center justify-between">
          <h3 class="font-serif text-lg font-bold flex items-center space-x-2">
            <svg class="w-5 h-5 text-sand-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            <span>{{ t('store_new_document') }}</span>
          </h3>
          <button @click="showCreateModal = false" class="text-marine-300 hover:text-white transition p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div class="space-y-1">
            <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">{{ t('doc_title') }} *</label>
            <input v-model="newDoc.title" type="text" required :placeholder="t('ph_doc_title')"
              class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">{{ t('doc_files') }}</label>
            <FileUploadDropzone
              v-model="newDoc.files"
              accept="image/*,.pdf,.doc,.docx,.txt"
              :hint="t('upload_dropzone_hint_multi')"
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">{{ t('notes_details') }}</label>
            <textarea v-model="newDoc.description" rows="4" :placeholder="t('ph_doc_notes')"
              class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20 font-mono"></textarea>
          </div>

          <div class="pt-3 flex space-x-3 justify-end border-t border-marine-100">
            <button type="button" @click="showCreateModal = false"
              class="px-4 py-2.5 border border-marine-200 rounded-lg hover:bg-marine-50 text-sm font-semibold text-marine-600 transition">
              {{ t('cancel') }}
            </button>
            <button type="submit"
              class="bg-gradient-to-r from-marine-600 to-marine-800 hover:from-marine-700 hover:to-marine-900 text-white font-bold py-2.5 px-6 rounded-lg shadow transition text-sm flex items-center space-x-2">
              <span>{{ t('store_document_btn') }}</span>
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
import { t } from '../services/i18n'
import { formatDateTime } from '../services/api'

const props = defineProps({
  newDoc: Object,
  documents: Array,
  docSearchQuery: String
})

const emit = defineEmits(['submitDocument', 'handleDocFileChange', 'updateSearchQuery', 'openPopup'])

const showCreateModal = ref(false)

const handleSubmit = () => {
  emit('submitDocument')
  showCreateModal.value = false
}
</script>
