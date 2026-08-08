<template>
  <div class="space-y-6">
    
    <!-- Top Bar Header & Action -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-marine-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center space-x-2">
          <h3 class="font-serif text-2xl font-extrabold text-marine-900">Ship's To-Do List</h3>
          <span class="text-xs bg-marine-100 text-marine-800 font-bold px-2.5 py-0.5 rounded-full border border-marine-200">
            {{ todoItems.filter(t => !t.done).length }} Pending / {{ todoItems.length }} Total
          </span>
        </div>
        <p class="text-xs text-marine-500">Manage vessel maintenance tasks, deck checklists, and safety checks</p>
      </div>

      <button @click="showCreateModal = true"
        class="w-full sm:w-auto bg-gradient-to-r from-marine-600 to-marine-800 hover:from-marine-700 hover:to-marine-900 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition flex items-center justify-center space-x-2 text-sm flex-shrink-0">
        <svg class="w-5 h-5 text-sand-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        <span>Add To-Do Task</span>
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="todoItems.length === 0" class="text-center py-16 bg-white rounded-2xl border border-dashed border-marine-200 p-8 space-y-4">
      <div class="w-16 h-16 bg-marine-50 text-marine-600 rounded-full flex items-center justify-center mx-auto border border-marine-100">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.375M9 9h3.375M11.4 3h1.2c1.9 0 3.4 1.5 3.4 3.4v12.2c0 1.9-1.5 3.4-3.4 3.4h-1.2C9.5 22 8 20.5 8 18.6V6.4C8 4.5 9.5 3 11.4 3z"/></svg>
      </div>
      <div>
        <h4 class="text-marine-900 font-bold text-lg">All Tasks Completed!</h4>
        <p class="text-marine-500 font-medium text-xs mt-1 max-w-sm mx-auto">
          All clear on deck. Add new tasks, inspection items, or gear checks to your fleet list.
        </p>
      </div>
      <button @click="showCreateModal = true"
        class="inline-flex items-center space-x-2 bg-marine-700 hover:bg-marine-800 text-white font-bold py-2.5 px-5 rounded-xl shadow text-xs transition">
        <svg class="w-4 h-4 text-sand-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        <span>Add First Task</span>
      </button>
    </div>

    <!-- Todo Items List -->
    <div v-else class="space-y-3">
      <div v-for="todo in todoItems" :key="todo.id"
        class="bg-white p-4 rounded-xl border transition flex items-center justify-between space-x-4 group"
        :class="[todo.done ? 'border-marine-100 opacity-60 bg-marine-50/20' : 'border-marine-200 hover:border-marine-400 shadow-sm hover:shadow']">
        
        <div class="flex items-center space-x-3.5 min-w-0 flex-1">
          <button @click="$emit('toggleTodo', todo)" type="button"
            class="w-6 h-6 rounded-lg border flex items-center justify-center transition active:scale-95 flex-shrink-0"
            :class="[todo.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-marine-300 hover:border-marine-600 text-transparent']">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          </button>

          <div class="min-w-0 flex-1 cursor-pointer" @click="$emit('openPopup', 'todo', todo)">
            <p class="text-sm font-semibold text-marine-800 truncate" :class="{'line-through text-marine-400 font-normal': todo.done}">
              {{ todo.text }}
            </p>
            <div class="flex items-center space-x-2.5 mt-0.5 text-[11px] text-marine-400">
              <span>Created {{ formatDate(todo.created_at) }}</span>
              <span v-if="todo.file_filename" class="text-sand-600 bg-sand-50 border border-sand-100 px-1.5 py-0.5 rounded flex items-center">
                <svg class="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32a1.5 1.5 0 01-2.12-2.12l10.14-10.14M16.5 7.5h.008v.008H16.5V7.5z"/></svg>
                Attachment
              </span>
            </div>
          </div>
        </div>

        <button @click="$emit('openPopup', 'todo', todo)"
          class="text-marine-400 hover:text-marine-600 p-2 rounded-lg hover:bg-marine-50 transition flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
        </button>
      </div>
    </div>

    <!-- Create Todo Modal -->
    <div v-if="showCreateModal" @click.self="showCreateModal = false" class="fixed inset-0 bg-marine-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl border border-marine-100 max-w-lg w-full slide-up overflow-hidden my-auto">
        
        <div class="bg-gradient-to-r from-marine-700 to-marine-900 px-6 py-4 text-white flex items-center justify-between">
          <h3 class="font-serif text-lg font-bold flex items-center space-x-2">
            <svg class="w-5 h-5 text-sand-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            <span>Add To-Do Task</span>
          </h3>
          <button @click="showCreateModal = false" class="text-marine-300 hover:text-white transition p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div class="space-y-1">
            <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">Task Description * (Markdown allowed)</label>
            <textarea v-model="newTodo.text" rows="3" required placeholder="e.g. Inspect bilge pump float switch, check anchor chain links..."
              class="block w-full px-3.5 py-2.5 border border-marine-200 rounded-lg text-sm focus:ring-2 focus:ring-marine-500 transition bg-marine-50/20 font-mono"></textarea>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-marine-700 uppercase tracking-wider">Upload Attachments / Images (Optional)</label>
            <FileUploadDropzone
              v-model="newTodo.files"
              accept="image/*,.pdf,.doc,.docx"
              hint="Upload multiple images or attachments"
            />
          </div>

          <div class="pt-3 flex space-x-3 justify-end border-t border-marine-100">
            <button type="button" @click="showCreateModal = false"
              class="px-4 py-2.5 border border-marine-200 rounded-lg hover:bg-marine-50 text-sm font-semibold text-marine-600 transition">
              Cancel
            </button>
            <button type="submit"
              class="bg-gradient-to-r from-marine-600 to-marine-800 hover:from-marine-700 hover:to-marine-900 text-white font-bold py-2.5 px-6 rounded-lg shadow transition text-sm flex items-center space-x-2">
              <span>Add Task</span>
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
  newTodo: Object,
  todoItems: Array
})

const emit = defineEmits(['submitTodo', 'handleTodoFileChange', 'toggleTodo', 'openPopup'])

const showCreateModal = ref(false)

const handleSubmit = () => {
  emit('submitTodo')
  showCreateModal.value = false
}
</script>
