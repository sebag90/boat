<template>
  <div class="flex-1 flex items-center justify-center px-4 relative overflow-hidden waves-bg py-12">
    <!-- Background anchor element -->
    <div class="absolute -right-16 -bottom-16 text-marine-500 opacity-10 pointer-events-none transform rotate-12">
      <svg class="w-96 h-96" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C13.1 2 14 2.9 14 4s-.9 2-2 2-2-.9-2-2 .9-2 2-2m6 11h-4v-1.5c1.4-.4 2.5-1.5 2.9-2.9L19 9c.4-1.2-.2-2.5-1.4-2.9-1.2-.4-2.5.2-2.9 1.4l-.4 1.2c-.4 1.1-1.3 1.9-2.3 2.1V7h-1v4H9v1h2v3.1c-1.5.2-2.8 1.1-3.4 2.5l-.6 1.3C6.5 20.1 7.1 21.4 8.3 21.8c1.2.4 2.5-.2 2.9-1.4l.6-1.3c.4-.9 1.2-1.5 2.2-1.6V19c0 1.1.9 2 2 2s2-.9 2-2V13h2v-1h-2M15 19H9c-.6 0-1-.4-1-1s.4-1 1-1h6c.6 0 1 .4 1 1s-.4 1-1 1z"/>
      </svg>
    </div>

    <div class="w-full max-w-md slide-up z-10">
      <div class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-marine-100 overflow-hidden">
        <!-- Card Header -->
        <div class="bg-gradient-to-br from-marine-700 to-marine-900 px-8 py-8 text-center text-white relative">
          <!-- Language Switcher in Login Header -->
          <button @click="toggleLocale" type="button"
            title="Switch Language / Cambia Lingua"
            class="absolute top-4 right-4 flex items-center space-x-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-bold text-sand-300 transition active:scale-95">
            <span>{{ currentLocale === 'en' ? '🇬🇧 EN' : '🇮🇹 IT' }}</span>
          </button>

          <div class="w-20 h-20 bg-gradient-to-br from-sand-400 to-sand-600 rounded-full mx-auto flex items-center justify-center shadow-lg border-4 border-white mb-4">
            <svg class="w-10 h-10 text-marine-900" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" stroke-linecap="round"/>
            </svg>
          </div>
          <h1 class="font-serif text-3xl font-extrabold tracking-wide">YACHT MASTER</h1>
          <p class="text-marine-300 text-sm mt-1 uppercase tracking-widest font-semibold font-sans">Shipboard Log &amp; Locker</p>
          <div class="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sand-500 via-sand-400 to-sand-600"></div>
        </div>

        <!-- Form -->
        <form @submit.prevent="$emit('login', username, password)" class="p-8 space-y-5">
          <div v-if="authError" class="p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-lg font-medium shadow-sm flex items-center space-x-2">
            <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span>{{ authError }}</span>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">{{ t('username') }}</label>
            <div class="relative">
              <input v-model="username" type="text" required placeholder="admin"
                class="block w-full pl-10 pr-4 py-3 border border-marine-200 rounded-xl text-sm focus:ring-2 focus:ring-marine-500 focus:border-marine-500 bg-marine-50/30 transition">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-marine-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
              </div>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">{{ t('password') }}</label>
            <div class="relative">
              <input v-model="password" type="password" required placeholder="••••••••"
                class="block w-full pl-10 pr-4 py-3 border border-marine-200 rounded-xl text-sm focus:ring-2 focus:ring-marine-500 focus:border-marine-500 bg-marine-50/30 transition">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-marine-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
              </div>
            </div>
          </div>

          <button type="submit" :disabled="authLoading"
            class="w-full bg-gradient-to-r from-marine-600 via-marine-700 to-marine-800 hover:from-marine-700 hover:to-marine-900 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.99] transition duration-150 flex items-center justify-center space-x-2 text-sm disabled:opacity-50">
            <span v-if="authLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            <span>{{ authLoading ? t('authenticating') : t('sign_in') }}</span>
          </button>
        </form>

        <!-- Optional API Host Configuration -->
        <div class="bg-marine-50/60 p-4 border-t border-marine-100 text-center">
          <button @click="showApiHostConfig = !showApiHostConfig" type="button" class="text-xs text-marine-500 hover:text-marine-700 font-semibold underline">
            {{ showApiHostConfig ? 'Hide API Connection Config' : 'Configure Custom API Host URL' }}
          </button>
          <div v-if="showApiHostConfig" class="mt-3 space-y-2 max-w-xs mx-auto text-left">
            <label class="block text-[11px] font-bold text-marine-600 uppercase">Backend API Base Host</label>
            <input v-model="apiHostInput" type="text" placeholder="e.g. http://localhost:8000"
              class="w-full px-3 py-1.5 text-xs border border-marine-200 rounded bg-white focus:ring-1 focus:ring-marine-500">
            <button @click="$emit('saveApiHost', apiHostInput)" type="button" class="w-full bg-marine-200 hover:bg-marine-300 text-marine-800 font-bold py-1 px-3 rounded text-xs transition">
              Save Host Override
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { currentLocale, toggleLocale, t } from '../services/i18n'

const props = defineProps({
  authLoading: Boolean,
  authError: String,
  apiConfigHost: String
})

defineEmits(['login', 'saveApiHost'])

const username = ref('')
const password = ref('')
const showApiHostConfig = ref(false)
const apiHostInput = ref(props.apiConfigHost || '')
</script>
