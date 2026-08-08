<template>
  <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-sand-200 overflow-hidden">
    <div class="bg-gradient-to-r from-marine-700 to-marine-900 px-8 py-6 text-white relative">
      <h3 class="font-serif text-2xl font-bold flex items-center space-x-2.5">
        <svg class="w-6 h-6 text-sand-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.645-.869L9.594 3.94z" /><circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span>{{ t('settings_title') }}</span>
      </h3>
      <p class="text-marine-300 text-xs uppercase tracking-widest font-semibold mt-1">Configure or decommission {{ currentBoat.name }}</p>
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sand-500 via-sand-400 to-sand-600"></div>
    </div>

    <div class="p-8 space-y-8">
      <!-- Update Vessel details -->
      <div class="space-y-4">
        <h4 class="font-serif text-lg font-bold text-marine-800 border-b pb-2 flex items-center space-x-2">
          <svg class="w-5 h-5 text-marine-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
          <span>Rename / Edit Description</span>
        </h4>
        <form @submit.prevent="$emit('updateBoat', editBoat)" class="space-y-4">
          <div class="space-y-1">
            <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">{{ t('vessel_name') }}</label>
            <input v-model="editBoat.name" type="text" required
              class="block w-full px-4 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 focus:border-marine-500 transition">
          </div>
          <div class="space-y-1">
            <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">{{ t('vessel_description') }}</label>
            <textarea v-model="editBoat.description" rows="3"
              class="block w-full px-4 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 focus:border-marine-500 transition"></textarea>
          </div>
          <button type="submit"
            class="bg-marine-600 hover:bg-marine-800 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition duration-150 text-sm">
            {{ t('update_vessel') }}
          </button>
        </form>
      </div>

      <!-- Decommission / Delete Yacht (Revision 10) -->
      <div class="space-y-4 border-t border-red-100 pt-6">
        <h4 class="font-serif text-lg font-bold text-red-700 border-b border-red-200 pb-2 flex items-center space-x-2">
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <span>{{ t('danger_zone') }}</span>
        </h4>
        <div class="bg-red-50 rounded-xl p-5 border border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h5 class="text-sm font-bold text-red-800">{{ t('decommission_vessel') }} "{{ currentBoat.name }}"</h5>
            <p class="text-xs text-red-600 mt-1 max-w-md">
              {{ t('decommission_warning') }}
            </p>
          </div>
          <button @click="$emit('deleteBoat')"
            class="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 text-sm flex-shrink-0 active:scale-95">
            {{ t('delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { t } from '../services/i18n'

const props = defineProps({
  currentBoat: Object
})

defineEmits(['updateBoat', 'deleteBoat'])

const editBoat = ref({ name: '', description: '' })

watch(() => props.currentBoat, (boat) => {
  if (boat) {
    editBoat.value = { name: boat.name || '', description: boat.description || '' }
  }
}, { immediate: true, deep: true })
</script>
