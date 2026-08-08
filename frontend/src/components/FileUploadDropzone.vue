<template>
  <div class="space-y-3">
    <!-- Dropzone Area -->
    <div
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
      :class="[
        'relative group cursor-pointer border-2 border-dashed rounded-2xl p-5 text-center transition-all duration-200 ease-in-out select-none',
        isDragging
          ? 'border-marine-500 bg-marine-50/80 scale-[1.01] shadow-lg ring-4 ring-marine-500/10'
          : 'border-marine-200 hover:border-marine-400 bg-marine-50/20 hover:bg-marine-50/50 shadow-sm hover:shadow'
      ]"
    >
      <input
        ref="fileInputRef"
        type="file"
        :multiple="multiple"
        :accept="accept"
        class="hidden"
        @change="handleFileSelect"
      />

      <div class="flex flex-col items-center justify-center space-y-2 pointer-events-none">
        <div
          :class="[
            'w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
            isDragging ? 'bg-marine-600 text-white shadow-md' : 'bg-marine-100 text-marine-600'
          ]"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>

        <div class="space-y-1">
          <p class="text-xs font-bold text-marine-800">
            <span class="text-marine-600 hover:underline">Click to upload</span> or drag and drop
          </p>
          <p class="text-[11px] text-marine-500 font-medium">
            {{ hint || (multiple ? 'Images, PDFs or documents (Multiple allowed)' : 'Single file upload') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Selected Files Preview Grid -->
    <div v-if="filesList.length > 0" class="space-y-2">
      <div class="flex items-center justify-between text-xs font-semibold text-marine-700 px-1">
        <span>Selected Files ({{ filesList.length }})</span>
        <button
          type="button"
          @click.stop="clearAll"
          class="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline transition"
        >
          Clear All
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
        <div
          v-for="(item, index) in filesList"
          :key="item.id"
          class="relative bg-white border border-marine-100 hover:border-marine-300 rounded-xl p-2.5 flex items-center space-x-3 shadow-sm group transition"
        >
          <!-- Image Thumbnail Preview -->
          <div
            v-if="item.isImage && item.previewUrl"
            class="w-12 h-12 rounded-lg overflow-hidden border border-marine-100 flex-shrink-0 bg-slate-100 relative"
          >
            <img :src="item.previewUrl" :alt="item.file.name" class="w-full h-full object-cover" />
          </div>

          <!-- Document / File Icon -->
          <div
            v-else
            class="w-12 h-12 rounded-lg bg-marine-50 border border-marine-100 text-marine-600 flex items-center justify-center flex-shrink-0"
          >
            <svg v-if="isPdf(item.file.name)" class="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <svg v-else class="w-6 h-6 text-marine-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32a1.5 1.5 0 01-2.12-2.12l10.14-10.14M16.5 7.5h.008v.008H16.5V7.5z" />
            </svg>
          </div>

          <!-- File Info -->
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-marine-900 truncate" :title="item.file.name">
              {{ item.file.name }}
            </p>
            <p class="text-[10px] text-marine-500 font-mono mt-0.5">
              {{ formatBytes(item.file.size) }}
            </p>
          </div>

          <!-- Remove Item Button -->
          <button
            type="button"
            @click.stop="removeFile(index)"
            class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Remove file"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  multiple: {
    type: Boolean,
    default: true
  },
  accept: {
    type: String,
    default: '*'
  },
  hint: {
    type: String,
    default: ''
  },
  modelValue: {
    type: [Array, File, Object, null],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const fileInputRef = ref(null)
const isDragging = ref(false)
const filesList = ref([])

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const isPdf = (filename) => {
  return filename && filename.toLowerCase().endsWith('.pdf')
}

const processFiles = (newFiles) => {
  const added = Array.from(newFiles).map((file) => {
    const isImage = file.type.startsWith('image/')
    const previewUrl = isImage ? URL.createObjectURL(file) : null
    return {
      id: Math.random().toString(36).substring(2, 9),
      file,
      isImage,
      previewUrl
    }
  })

  if (props.multiple) {
    filesList.value = [...filesList.value, ...added]
  } else {
    // Revoke previous URLs
    filesList.value.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
    })
    filesList.value = added.slice(0, 1)
  }

  notifyParent()
}

const handleFileSelect = (e) => {
  if (e.target.files && e.target.files.length > 0) {
    processFiles(e.target.files)
    e.target.value = '' // reset input
  }
}

const handleDrop = (e) => {
  isDragging.value = false
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    processFiles(e.dataTransfer.files)
  }
}

const removeFile = (index) => {
  const removed = filesList.value[index]
  if (removed && removed.previewUrl) {
    URL.revokeObjectURL(removed.previewUrl)
  }
  filesList.value.splice(index, 1)
  notifyParent()
}

const clearAll = () => {
  filesList.value.forEach((item) => {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
  })
  filesList.value = []
  notifyParent()
}

const notifyParent = () => {
  const rawFiles = filesList.value.map((item) => item.file)
  if (props.multiple) {
    emit('update:modelValue', rawFiles)
    emit('change', rawFiles)
  } else {
    const single = rawFiles[0] || null
    emit('update:modelValue', single)
    emit('change', single)
  }
}

// Watch for external reset (e.g. modelValue set to null or empty)
watch(
  () => props.modelValue,
  (val) => {
    if (!val || (Array.isArray(val) && val.length === 0)) {
      filesList.value.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
      })
      filesList.value = []
    }
  }
)

onBeforeUnmount(() => {
  filesList.value.forEach((item) => {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
  })
})
</script>
