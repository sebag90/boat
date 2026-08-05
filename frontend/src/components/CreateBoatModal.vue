<template>
  <div v-if="show" class="fixed inset-0 bg-marine-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl shadow-2xl border border-marine-100 max-w-md w-full slide-up overflow-hidden">
      <div class="bg-gradient-to-r from-marine-700 to-marine-900 px-6 py-4 text-white flex items-center justify-between">
        <h3 class="font-serif text-lg font-bold flex items-center space-x-2">
          <svg class="w-5 h-5 text-sand-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18h16l-1.5-3H5.5L4 18M12 2L4.5 14H12V2M13 3.5V14h6L13 3.5Z"/></svg>
          <span>Register New Vessel</span>
        </h3>
        <button @click="$emit('close')" class="text-marine-300 hover:text-white transition">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <form @submit.prevent="$emit('submit', { name, description })" class="p-6 space-y-4">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Vessel Name</label>
          <input v-model="name" type="text" required placeholder="e.g. Morning Star"
            class="block w-full px-3 py-2 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500">
        </div>
        <div class="space-y-1">
          <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Registry Description</label>
          <textarea v-model="description" rows="3" placeholder="Specs, length, port of registry..."
            class="block w-full px-3 py-2 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500"></textarea>
        </div>
        <div class="pt-2 flex space-x-3 justify-end">
          <button type="button" @click="$emit('close')"
            class="px-4 py-2 border border-marine-200 rounded-lg hover:bg-marine-50 text-sm font-semibold text-marine-600 transition">
            Abort
          </button>
          <button type="submit"
            class="bg-marine-600 hover:bg-marine-800 text-white font-bold py-2 px-5 rounded-lg shadow-md transition text-sm">
            Register
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ show: Boolean })
defineEmits(['close', 'submit'])

const name = ref('')
const description = ref('')
</script>
