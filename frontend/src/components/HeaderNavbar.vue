<template>
  <header class="bg-gradient-to-r from-marine-700 via-marine-800 to-marine-900 text-white shadow-xl sticky top-0 z-40 border-b-2 border-sand-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        
        <!-- Logo / Brand -->
        <div class="flex items-center space-x-3 cursor-pointer" @click="$emit('goHome')">
          <div class="w-11 h-11 bg-sand-500 rounded-xl flex items-center justify-center text-marine-900 shadow-lg border border-white/20 transform rotate-3 hover:rotate-0 transition duration-300">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 18h16l-1.5-3H5.5L4 18M12 2L4.5 14H12V2M13 3.5V14h6L13 3.5Z" />
            </svg>
          </div>
          <div>
            <span class="font-serif text-2xl font-black tracking-wide bg-gradient-to-r from-white to-marine-100 bg-clip-text text-transparent">YACHT MASTER</span>
            <span class="hidden sm:inline-block ml-2 text-xs uppercase tracking-widest text-sand-400 font-bold px-2 py-0.5 rounded bg-white/10">Shipshape</span>
          </div>
        </div>

        <!-- Right Controls -->
        <div class="flex items-center space-x-3 sm:space-x-4">
          <!-- Language Switcher Button/Icon -->
          <button @click="toggleLocale"
            title="Switch Language / Cambia Lingua"
            class="flex items-center space-x-1.5 px-2.5 py-2 bg-marine-900/60 hover:bg-marine-700 border border-marine-600 rounded-lg text-xs font-bold text-sand-400 hover:text-white transition active:scale-95">
            <span class="text-sm leading-none">{{ currentLocale === 'en' ? '🇬🇧' : '🇮🇹' }}</span>
            <span class="uppercase font-mono tracking-wider text-[11px]">{{ currentLocale === 'en' ? 'EN' : 'IT' }}</span>
          </button>

          <!-- Boat Selector Dropdown -->
          <div class="relative" id="boatSelectorContainer">
            <label class="sr-only">Select Boat</label>
            <div class="flex items-center bg-marine-900/60 border border-marine-600 rounded-lg px-3 py-2 text-sm text-marine-100 hover:text-white transition cursor-pointer"
              @click="$emit('toggleBoatDropdown')">
              <svg class="w-4 h-4 mr-2 text-sand-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
              <span class="font-semibold tracking-wide">
                {{ currentBoat ? currentBoat.name : 'Select Vessel...' }}
              </span>
            </div>

            <!-- Boat Dropdown Menu -->
            <div v-if="showBoatDropdown" class="absolute right-0 mt-2 w-64 bg-white text-marine-900 rounded-lg shadow-2xl border border-marine-100 py-2 z-50 slide-up">
              <div class="px-3 py-1 text-xs font-bold text-marine-500 uppercase tracking-wider border-b border-marine-50 mb-1">
                Your Fleet
              </div>
              <div class="max-h-60 overflow-y-auto">
                <button v-for="b in boats" :key="b.id"
                  @click="$emit('selectBoat', b)"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-marine-50 flex items-center justify-between transition"
                  :class="{'bg-marine-100 font-bold text-marine-900': currentBoat && currentBoat.id === b.id}">
                  <span class="truncate">{{ b.name }}</span>
                  <span v-if="currentBoat && currentBoat.id === b.id" class="w-2 h-2 rounded-full bg-sand-500 pulse-light"></span>
                </button>
              </div>
              <div class="border-t border-marine-50 mt-1 pt-1">
                <button @click="$emit('openCreateBoatModal')"
                  class="w-full text-left px-4 py-2.5 text-sm text-marine-600 hover:bg-marine-50 font-bold flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                  <span>Add New Vessel</span>
                </button>
              </div>
            </div>
          </div>

          <!-- User Badge / Logout -->
          <div class="flex items-center space-x-2 border-l border-marine-700 pl-4">
            <div class="w-8 h-8 rounded-full bg-sand-500/20 border border-sand-400 flex items-center justify-center text-sand-400 font-bold text-xs uppercase">
              {{ currentUser ? currentUser.substring(0, 2).toUpperCase() : 'SK' }}
            </div>
            <button @click="$emit('logout')" title="Sign Out" class="p-2 text-marine-300 hover:text-white hover:bg-marine-800 rounded-lg transition active:scale-95">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>
            </button>
          </div>

        </div>

      </div>
    </div>

    <!-- TABS BAR -->
    <div v-if="currentBoat" class="bg-marine-800/80 border-t border-marine-700 backdrop-blur-md overflow-x-auto scrollbar-none">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 min-w-max py-2">
        <button v-for="tab in tabList" :key="tab.id"
          @click="$emit('switchTab', tab.id)"
          class="px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition flex items-center space-x-2 border"
          :class="[
            currentTab === tab.id
              ? 'border-marine-600 text-marine-600 bg-white/90 shadow-sm'
              : 'border-transparent text-marine-300 hover:text-white hover:bg-marine-700/50'
          ]">
          <span class="w-4 h-4" v-html="tab.icon"></span>
          <span>{{ tab.name }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { currentLocale, toggleLocale, t } from '../services/i18n'

defineProps({
  boats: Array,
  currentBoat: Object,
  currentTab: String,
  currentUser: String,
  showBoatDropdown: Boolean,
  tabList: Array
})

defineEmits(['goHome', 'toggleBoatDropdown', 'selectBoat', 'openCreateBoatModal', 'logout', 'switchTab'])
</script>
