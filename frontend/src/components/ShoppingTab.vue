<template>
  <div class="space-y-6">
    
    <!-- Top Bar Header & Action -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-marine-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center space-x-2">
          <h3 class="font-serif text-2xl font-extrabold text-marine-900">{{ t('shopping_title') }}</h3>
          <span class="text-xs bg-marine-100 text-marine-800 font-bold px-2.5 py-0.5 rounded-full border border-marine-200">
            {{ shoppingItems.filter(s => !s.done).length }} {{ t('to_buy') }} / {{ shoppingItems.length }} {{ t('total') }}
          </span>
        </div>
        <p class="text-xs text-marine-500">{{ t('shopping_subtitle') }}</p>
      </div>

      <button @click="showCreateModal = true"
        class="w-full sm:w-auto bg-gradient-to-r from-marine-600 to-marine-800 hover:from-marine-700 hover:to-marine-900 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition flex items-center justify-center space-x-2 text-sm flex-shrink-0">
        <svg class="w-5 h-5 text-sand-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        <span>{{ t('add_cargo_item') }}</span>
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="shoppingItems.length === 0" class="text-center py-16 bg-white rounded-2xl border border-dashed border-marine-200 p-8 space-y-4">
      <div class="w-16 h-16 bg-marine-50 text-marine-600 rounded-full flex items-center justify-center mx-auto border border-marine-100">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>
      </div>
      <div>
        <h4 class="text-marine-900 font-bold text-lg">{{ t('no_shopping') }}</h4>
        <p class="text-marine-500 font-medium text-xs mt-1 max-w-sm mx-auto">
          {{ t('no_shopping_sub') }}
        </p>
      </div>
      <button @click="showCreateModal = true"
        class="inline-flex items-center space-x-2 bg-marine-700 hover:bg-marine-800 text-white font-bold py-2.5 px-5 rounded-xl shadow text-xs transition">
        <svg class="w-4 h-4 text-sand-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        <span>{{ t('add_first_cargo') }}</span>
      </button>
    </div>

    <!-- Shopping Items List -->
    <div v-else class="space-y-3">
      <div v-for="shop in shoppingItems" :key="shop.id"
        class="bg-white p-4 rounded-xl border transition flex items-center justify-between space-x-4 group"
        :class="[shop.done ? 'border-marine-100 opacity-60 bg-marine-50/20' : 'border-marine-200 hover:border-marine-400 shadow-sm hover:shadow']">
        
        <div class="flex items-center space-x-3.5 min-w-0 flex-1">
          <button @click="$emit('toggleShopping', shop)" type="button"
            class="w-6 h-6 rounded-lg border flex items-center justify-center transition active:scale-95 flex-shrink-0"
            :class="[shop.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-marine-300 hover:border-marine-600 text-transparent']">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          </button>

          <div class="min-w-0 flex-1 cursor-pointer" @click="$emit('openPopup', 'shopping', shop)">
            <p class="text-sm font-semibold text-marine-800 truncate" :class="{'line-through text-marine-400 font-normal': shop.done}">
              {{ shop.name }}
            </p>
            <div class="flex items-center space-x-2.5 mt-0.5 text-[11px] text-marine-400">
              <span>{{ t('added_on') }} {{ formatDate(shop.created_at) }}</span>
              <span v-if="shop.file_filename" class="text-sand-600 bg-sand-50 border border-sand-100 px-1.5 py-0.5 rounded flex items-center">
                <svg class="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32a1.5 1.5 0 01-2.12-2.12l10.14-10.14M16.5 7.5h.008v.008H16.5V7.5z"/></svg>
                {{ t('attachment_badge') }}
              </span>
              <a v-if="shop.link" :href="shop.link" target="_blank" @click.stop
                class="text-marine-500 hover:text-marine-700 underline flex items-center">
                {{ t('shop_link') }}
                <svg class="w-2.5 h-2.5 ml-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
              </a>
            </div>
          </div>
        </div>

        <button @click="$emit('openPopup', 'shopping', shop)"
          class="text-marine-400 hover:text-marine-600 p-2 rounded-lg hover:bg-marine-50 transition flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
        </button>
      </div>
    </div>

    <!-- Create Shopping Item Modal -->
    <div v-if="showCreateModal" @click.self="showCreateModal = false" class="fixed inset-0 bg-marine-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl border border-marine-100 max-w-lg w-full slide-up overflow-hidden my-auto">
        
        <div class="bg-gradient-to-r from-marine-700 to-marine-900 px-6 py-4 text-white flex items-center justify-between">
          <h3 class="font-serif text-lg font-bold flex items-center space-x-2">
            <svg class="w-5 h-5 text-sand-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            <span>{{ t('add_cargo_item') }}</span>
          </h3>
          <button @click="showCreateModal = false" class="text-marine-300 hover:text-white transition p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div class="space-y-1">
            <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">{{ t('item_name') }} *</label>
            <input v-model="newShop.name" type="text" required :placeholder="t('ph_shop_name')"
              class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">{{ t('shop_web_link') }}</label>
            <input v-model="newShop.link" type="url" :placeholder="t('ph_shop_link')"
              class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm font-mono text-xs focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">{{ t('upload_images_files') }}</label>
            <FileUploadDropzone
              v-model="newShop.files"
              accept="image/*,.pdf,.doc,.docx"
              :hint="t('upload_dropzone_hint_multi')"
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">{{ t('item_description') }}</label>
            <textarea v-model="newShop.description" rows="3" :placeholder="t('ph_shop_notes')"
              class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20 font-mono"></textarea>
          </div>

          <div class="pt-3 flex space-x-3 justify-end border-t border-marine-100">
            <button type="button" @click="showCreateModal = false"
              class="px-4 py-2.5 border border-marine-200 rounded-lg hover:bg-marine-50 text-sm font-semibold text-marine-600 transition">
              {{ t('cancel') }}
            </button>
            <button type="submit"
              class="bg-gradient-to-r from-marine-600 to-marine-800 hover:from-marine-700 hover:to-marine-900 text-white font-bold py-2.5 px-6 rounded-lg shadow transition text-sm flex items-center space-x-2">
              <span>{{ t('add_cargo_btn') }}</span>
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
import { formatDate } from '../services/api'

const props = defineProps({
  newShop: Object,
  shoppingItems: Array
})

const emit = defineEmits(['submitShopping', 'handleShopFileChange', 'toggleShopping', 'openPopup'])

const showCreateModal = ref(false)

const handleSubmit = () => {
  emit('submitShopping')
  showCreateModal.value = false
}
</script>
