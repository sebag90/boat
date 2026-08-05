<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    <!-- Add Entry Panel -->
    <div class="lg:col-span-5 bg-white rounded-2xl shadow-md border border-marine-100 overflow-hidden">
      <div class="bg-gradient-to-r from-marine-600 to-marine-700 px-6 py-4 text-white flex items-center justify-between">
        <h3 class="font-bold text-base flex items-center space-x-2">
          <svg class="w-5 h-5 text-sand-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          <span>Add Item to Buy</span>
        </h3>
        <span class="text-xs uppercase bg-white/15 px-2 py-0.5 rounded font-bold tracking-widest text-marine-100">SHOP-ADD</span>
      </div>
      <form @submit.prevent="$emit('submitShopping')" class="p-6 space-y-4">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Item Name</label>
          <input v-model="newShop.name" type="text" required placeholder="e.g. VHF Radio Antenna Mount"
            class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
        </div>
        <div class="space-y-1">
          <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Shop Web Link (Optional)</label>
          <input v-model="newShop.link" type="url" placeholder="https://www.chandlery.com/product/..."
            class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm font-mono text-xs focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20">
        </div>
        <div class="space-y-1">
          <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Upload Image / File (Optional)</label>
          <input type="file" @change="$emit('handleShopFileChange', $event)" ref="fileInput"
            class="block w-full px-3 py-2 border border-marine-200 rounded-lg text-xs bg-marine-50/20">
        </div>
        <div class="space-y-1">
          <label class="block text-xs font-bold text-marine-600 uppercase tracking-wider">Description &amp; Specifications (Markdown allowed)</label>
          <textarea v-model="newShop.description" rows="3" placeholder="Specs, dimensions, or urgency levels..."
            class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20 font-mono"></textarea>
        </div>
        <button type="submit"
          class="w-full bg-gradient-to-r from-marine-600 to-marine-800 hover:from-marine-700 hover:to-marine-900 text-white font-bold py-3 px-4 rounded-xl shadow hover:shadow-md active:scale-[0.99] transition duration-150 flex items-center justify-center space-x-2">
          <svg class="w-4 h-4 text-sand-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
          <span>Add to Cargo List</span>
        </button>
      </form>
    </div>

    <!-- Divider -->
    <div class="lg:hidden h-1 bg-gradient-to-r from-transparent via-marine-200 to-transparent my-2"></div>

    <!-- List Panel -->
    <div class="lg:col-span-7 space-y-4">
      <div class="flex items-center justify-between border-b-2 border-marine-100 pb-2">
        <h3 class="font-serif text-xl font-bold text-marine-700">Shopping Cargo List</h3>
        <span class="text-xs bg-marine-100 text-marine-600 font-bold px-2.5 py-1 rounded-full">
          {{ shoppingItems.filter(s => !s.done).length }} To Buy / {{ shoppingItems.length }} Total
        </span>
      </div>

      <div v-if="shoppingItems.length === 0" class="text-center py-12 bg-white rounded-2xl border border-dashed border-marine-200 p-8">
        <svg class="w-12 h-12 text-marine-300 mx-auto" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>
        <p class="text-marine-400 font-medium mt-3 text-sm">Cargo hold is fully stocked. Ready for sailing!</p>
      </div>

      <div v-else class="space-y-3 max-h-[35rem] overflow-y-auto pr-1">
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
                <span>Added {{ formatDate(shop.created_at) }}</span>
                <span v-if="shop.file_filename" class="text-sand-600 bg-sand-50 border border-sand-100 px-1.5 py-0.5 rounded flex items-center">
                  <svg class="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32a1.5 1.5 0 01-2.12-2.12l10.14-10.14M16.5 7.5h.008v.008H16.5V7.5z"/></svg>
                  Attachment
                </span>
                <a v-if="shop.link" :href="shop.link" target="_blank" @click.stop
                  class="text-marine-500 hover:text-marine-700 underline flex items-center">
                  Shop Link
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
    </div>
  </div>
</template>

<script setup>
import { formatDate } from '../services/api'

defineProps({
  newShop: Object,
  shoppingItems: Array
})

defineEmits(['submitShopping', 'handleShopFileChange', 'toggleShopping', 'openPopup'])
</script>
