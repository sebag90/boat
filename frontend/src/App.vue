<template>
  <div class="min-h-screen flex flex-col justify-between bg-slate-50 overflow-x-hidden w-full">
    
    <!-- 1. LOGIN SCREEN -->
    <LoginScreen
      v-if="!authenticated"
      :auth-loading="authLoading"
      :auth-error="authError"
      :api-config-host="apiConfigHost"
      @login="handleLogin"
      @save-api-host="handleSaveApiHost"
    />

    <!-- 2. MAIN APPLICATION -->
    <div v-else class="flex-1 flex flex-col justify-between">
      
      <!-- NAVIGATION HEADER -->
      <HeaderNavbar
        :boats="boats"
        :current-boat="currentBoat"
        :current-tab="currentTab"
        :current-user="currentUser"
        :show-boat-dropdown="showBoatDropdown"
        :tab-list="tabList"
        @go-home="goHome"
        @toggle-boat-dropdown="showBoatDropdown = !showBoatDropdown"
        @select-boat="selectBoat"
        @open-create-boat-modal="openCreateBoatModal"
        @logout="logout"
        @switch-tab="switchTab"
      />

      <!-- MAIN CONTENT BODY -->
      <main class="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        <!-- NO BOATS STATE -->
        <div v-if="boats.length === 0 && !loading" class="flex-1 flex items-center justify-center px-4 py-16">
          <div class="max-w-md w-full text-center space-y-6 bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-marine-100 slide-up">
            <div class="w-20 h-20 bg-marine-50 mx-auto rounded-full flex items-center justify-center text-marine-600 border-2 border-marine-200 shadow-inner">
              <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18h16l-1.5-3H5.5L4 18M12 2L4.5 14H12V2M13 3.5V14h6L13 3.5Z"/></svg>
            </div>
            <div class="space-y-2">
              <h2 class="font-serif text-2xl font-extrabold text-marine-900">{{ t('welcome_skipper') }}</h2>
              <p class="text-marine-600 text-xs">
                {{ t('no_vessels') }}
              </p>
            </div>
            <button @click="openCreateBoatModal"
              class="inline-flex items-center space-x-2 bg-gradient-to-r from-marine-600 to-marine-800 hover:from-marine-700 hover:to-marine-900 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition text-xs">
              <svg class="w-4 h-4 text-sand-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
              <span>{{ t('register_first_vessel') }}</span>
            </button>
          </div>
        </div>

        <!-- BOAT SELECTED BUT CHOOSE BOAT SCREEN -->
        <div v-else-if="!currentBoat && !loading" class="flex-1 flex items-center justify-center px-4 py-16">
          <div class="max-w-md w-full text-center space-y-6 bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-marine-100 slide-up">
            <div class="w-16 h-16 bg-sand-100 mx-auto rounded-full flex items-center justify-center text-sand-600 border border-sand-200">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H3"/></svg>
            </div>
            <div class="space-y-2">
              <h3 class="font-serif text-xl font-bold text-marine-800">{{ t('select_from_fleet') }}</h3>
              <p class="text-marine-500 text-xs">{{ t('choose_yacht') }}</p>
            </div>
          </div>
        </div>

        <!-- ACTIVE BOAT TABS CONTENT -->
        <div v-else class="space-y-8">
          <LogbookTab
            v-if="currentTab === 'logbook'"
            :log-entries="logEntries"
            @open-create-modal="openCreateLogModal"
            @open-voyage-detail="openVoyageDetail"
          />

          <DocumentsTab
            v-if="currentTab === 'documents'"
            :new-doc="newDoc"
            :documents="filteredDocuments"
            :doc-search-query="docSearchQuery"
            @submit-document="submitDocument"
            @handle-doc-file-change="handleDocFileChange"
            @update-search-query="docSearchQuery = $event"
            @open-popup="openPopup"
          />

          <MaintenanceTab
            v-if="currentTab === 'maintenance'"
            :new-maint="newMaint"
            :maintenance-records="maintenanceRecords"
            @submit-maintenance="submitMaintenance"
            @handle-maint-file-change="handleMaintFileChange"
            @open-popup="openPopup"
          />

          <TodoTab
            v-if="currentTab === 'todo'"
            :new-todo="newTodo"
            :todo-items="todoItems"
            @submit-todo="submitTodo"
            @handle-todo-file-change="handleTodoFileChange"
            @toggle-todo="toggleTodo"
            @open-popup="openPopup"
          />

          <ShoppingTab
            v-if="currentTab === 'shopping'"
            :new-shop="newShop"
            :shopping-items="shoppingItems"
            @submit-shopping="submitShopping"
            @handle-shop-file-change="handleShopFileChange"
            @toggle-shopping="toggleShopping"
            @open-popup="openPopup"
          />

          <SettingsTab
            v-if="currentTab === 'settings'"
            :current-boat="currentBoat"
            @update-boat="updateCurrentBoat"
            @delete-boat="deleteCurrentBoat"
          />
        </div>

      </main>

      <!-- FOOTER -->
      <footer class="bg-marine-900 text-marine-300 py-6 border-t border-marine-800 text-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span class="font-semibold text-white">{{ t('dashboard_title') }}</span>
            <span class="text-marine-500">|</span>
            <span>{{ t('locale_europe') }}</span>
          </div>
          <p class="text-marine-400">&copy; {{ t('copyright') }}</p>
        </div>
      </footer>

    </div>

    <!-- MODALS -->
    <CreateBoatModal
      :show="showCreateBoatModal"
      @close="closeCreateBoatModal"
      @submit="submitCreateBoat"
    />

    <CreateLogModal
      :show="showCreateLogModal"
      @close="closeCreateLogModal"
      @submit="submitCreateLogModal"
    />

    <VoyageDetailModal
      v-if="selectedVoyage"
      :entry="selectedVoyage"
      :boat-id="currentBoat?.id"
      @close="selectedVoyage = null"
      @update-voyage="handleVoyageUpdated"
      @delete-voyage="handleVoyageDeleted"
    />

    <EntryModal
      v-if="activePopup"
      :active-popup="activePopup"
      :current-boat="currentBoat"
      @close="closePopup"
      @delete-entry="deletePopupEntry"
      @save-edit="savePopupEdit"
      @file-change="handleEditFileChange"
    />

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import LoginScreen from './components/LoginScreen.vue'
import HeaderNavbar from './components/HeaderNavbar.vue'
import CreateBoatModal from './components/CreateBoatModal.vue'
import CreateLogModal from './components/CreateLogModal.vue'
import VoyageDetailModal from './components/VoyageDetailModal.vue'
import EntryModal from './components/EntryModal.vue'
import LogbookTab from './components/LogbookTab.vue'
import DocumentsTab from './components/DocumentsTab.vue'
import MaintenanceTab from './components/MaintenanceTab.vue'
import TodoTab from './components/TodoTab.vue'
import ShoppingTab from './components/ShoppingTab.vue'
import SettingsTab from './components/SettingsTab.vue'

import {
  request,
  setAuthHeader,
  getTodayDateString
} from './services/api'

import { currentLocale, t } from './services/i18n'
const authenticated = ref(false)
const authLoading = ref(false)
const authError = ref(null)
const currentUser = ref('')
const apiConfigHost = ref(localStorage.getItem('api_host') || '')

// API & BASE NAVIGATION
const loading = ref(false)
const boats = ref([])
const currentBoat = ref(null)
const currentTab = ref('logbook')
const showBoatDropdown = ref(false)
const showCreateBoatModal = ref(false)
const showCreateLogModal = ref(false)
const selectedVoyage = ref(null)

// ACTIVE LIST DATA
const logEntries = ref([])
const documents = ref([])
const maintenanceRecords = ref([])
const todoItems = ref([])
const shoppingItems = ref([])

// SEARCH FILTER
const docSearchQuery = ref('')

// NEW ENTRY FORMS MODEL
const newDoc = reactive({ title: '', description: '', files: [], file: null })
const newMaint = reactive({ title: '', date: getTodayDateString(), description: '', files: [], receipt: null })
const newTodo = reactive({ text: '', files: [], file: null })
const newShop = reactive({ name: '', description: '', link: '', files: [], file: null })

// EDIT POPUP STATE
const activePopup = ref(null)
const editFile = ref(null)

const tabList = computed(() => [
  { id: 'logbook', name: t('nav_logbook'), icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>` },
  { id: 'documents', name: t('nav_documents'), icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>` },
  { id: 'maintenance', name: t('nav_maintenance'), icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A1.5 1.5 0 0019.5 18.75l-5.83-5.83M11.42 15.17l2.42-2.42M11.42 15.17L6 10.25M13.84 12.75l2.42-2.42m0 0l-5.83-5.83A1.5 1.5 0 008.25 6.75l5.83 5.83z" /></svg>` },
  { id: 'todo', name: t('nav_todo'), icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.375M9 9h3.375M11.4 3h1.2c1.9 0 3.4 1.5 3.4 3.4v12.2c0 1.9-1.5 3.4-3.4 3.4h-1.2C9.5 22 8 20.5 8 18.6V6.4C8 4.5 9.5 3 11.4 3z" /></svg>` },
  { id: 'shopping', name: t('nav_shopping'), icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>` },
  { id: 'settings', name: t('nav_settings'), icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.645-.869L9.594 3.94z" /><circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/></svg>` }
])

const filteredDocuments = computed(() => {
  if (!docSearchQuery.value) return documents.value
  const query = docSearchQuery.value.toLowerCase().trim()
  return documents.value.filter(doc =>
    (doc.title && doc.title.toLowerCase().includes(query)) ||
    (doc.description && doc.description.toLowerCase().includes(query)) ||
    (doc.filename && doc.filename.toLowerCase().includes(query))
  )
})

// AUTHENTICATION LOGIC
const handleSaveApiHost = (host) => {
  if (host) {
    localStorage.setItem('api_host', host)
  } else {
    localStorage.removeItem('api_host')
  }
  apiConfigHost.value = host
  alert('API Host settings saved.')
}

const checkAuthSaved = () => {
  const savedHeader = localStorage.getItem('auth_header')
  const savedUser = localStorage.getItem('current_user')
  if (savedHeader) {
    setAuthHeader(savedHeader)
    currentUser.value = savedUser || 'Skipper'
    authenticated.value = true
    return true
  }
  return false
}

const handleLogin = async (username, password) => {
  authLoading.value = true
  authError.value = null
  try {
    const token = btoa(unescape(encodeURIComponent(`${username}:${password}`)))
    const header = `Basic ${token}`
    setAuthHeader(header)

    const res = await request('/api/boats')
    const boatsData = await res.json()
    boats.value = boatsData
    authenticated.value = true
    currentUser.value = username
    localStorage.setItem('current_user', username)

    if (boats.value.length > 0) {
      const savedBoatId = localStorage.getItem('selected_boat_id')
      const found = boats.value.find(b => b.id == savedBoatId)
      if (found) {
        selectBoat(found)
      } else {
        selectBoat(boats.value[0])
      }
    }
  } catch (e) {
    authError.value = e.message.includes('Invalid') || e.message === 'Unauthorized'
      ? 'Authentication failed. Incorrect username or password.'
      : `Error connecting to server: ${e.message}`
    setAuthHeader('')
  } finally {
    authLoading.value = false
  }
}

const logout = () => {
  authenticated.value = false
  currentBoat.value = null
  setAuthHeader('')
  localStorage.removeItem('current_user')
}

// BOAT ACTIONS
const fetchBoats = async () => {
  loading.value = true
  try {
    const res = await request('/api/boats')
    boats.value = await res.json()

    if (boats.value.length > 0) {
      const savedBoatId = localStorage.getItem('selected_boat_id')
      const found = boats.value.find(b => b.id == savedBoatId)
      if (found) {
        selectBoat(found)
      } else {
        selectBoat(boats.value[0])
      }
    }
  } catch (e) {
    if (e.message === 'Unauthorized' || e.message.includes('401')) {
      logout()
    }
  } finally {
    loading.value = false
  }
}

const selectBoat = (boat) => {
  currentBoat.value = boat
  localStorage.setItem('selected_boat_id', boat.id)
  showBoatDropdown.value = false
  switchTab(currentTab.value)
}

const goHome = () => {
  if (boats.value.length > 0) {
    selectBoat(boats.value[0])
  }
}

const openCreateBoatModal = () => {
  showCreateBoatModal.value = true
  showBoatDropdown.value = false
}

const closeCreateBoatModal = () => {
  showCreateBoatModal.value = false
}

const submitCreateBoat = async ({ name, description }) => {
  try {
    loading.value = true
    const res = await request('/api/boats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    })
    const created = await res.json()
    boats.value.push(created)
    selectBoat(created)
    closeCreateBoatModal()
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const updateCurrentBoat = async (updatedData) => {
  try {
    const res = await request(`/api/boats/${currentBoat.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    })
    const updated = await res.json()
    currentBoat.value = updated
    const idx = boats.value.findIndex(b => b.id === updated.id)
    if (idx !== -1) boats.value[idx] = updated
    alert('Vessel info updated successfully!')
  } catch (e) { }
}

const deleteCurrentBoat = async () => {
  if (!confirm(`Are you sure you want to decommission "${currentBoat.value.name}"? This cannot be undone!`)) return
  try {
    await request(`/api/boats/${currentBoat.value.id}`, { method: 'DELETE' })
    const deletedId = currentBoat.value.id
    boats.value = boats.value.filter(b => b.id !== deletedId)
    currentBoat.value = null
    localStorage.removeItem('selected_boat_id')
    alert('Vessel decommissioned successfully.')
  } catch (e) { }
}

// TAB SWITCHING & FETCHING
const switchTab = (tabId) => {
  currentTab.value = tabId
  if (!currentBoat.value) return

  if (tabId === 'logbook') fetchLogbook()
  else if (tabId === 'documents') fetchDocuments()
  else if (tabId === 'maintenance') fetchMaintenance()
  else if (tabId === 'todo') fetchTodos()
  else if (tabId === 'shopping') fetchShopping()
}

const fetchLogbook = async () => {
  loading.value = true
  try {
    const res = await request(`/api/boats/${currentBoat.value.id}/logbook`)
    logEntries.value = await res.json()
  } catch (e) { }
  finally { loading.value = false; }
}

const fetchDocuments = async () => {
  loading.value = true
  try {
    const res = await request(`/api/boats/${currentBoat.value.id}/documents`)
    documents.value = await res.json()
  } catch (e) { }
  finally { loading.value = false; }
}

const fetchMaintenance = async () => {
  loading.value = true
  try {
    const res = await request(`/api/boats/${currentBoat.value.id}/maintenance`)
    maintenanceRecords.value = await res.json()
  } catch (e) { }
  finally { loading.value = false; }
}

const fetchTodos = async () => {
  loading.value = true
  try {
    const res = await request(`/api/boats/${currentBoat.value.id}/todos`)
    todoItems.value = await res.json()
  } catch (e) { }
  finally { loading.value = false; }
}

const fetchShopping = async () => {
  loading.value = true
  try {
    const res = await request(`/api/boats/${currentBoat.value.id}/shopping`)
    shoppingItems.value = await res.json()
  } catch (e) { }
  finally { loading.value = false; }
}

// LOGBOOK MODAL HANDLERS
const openCreateLogModal = () => { showCreateLogModal.value = true }
const closeCreateLogModal = () => { showCreateLogModal.value = false }

const submitCreateLogModal = async (data) => {
  try {
    loading.value = true
    const res = await request(`/api/boats/${currentBoat.value.id}/logbook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const createdEntry = await res.json()
    logEntries.value.unshift(createdEntry)
    closeCreateLogModal()
    selectedVoyage.value = createdEntry
  } catch (e) {
    alert(`Could not create voyage: ${e.message}`)
  } finally {
    loading.value = false
  }
}

const openVoyageDetail = (voyage) => {
  selectedVoyage.value = voyage
}

const handleVoyageUpdated = (updated) => {
  selectedVoyage.value = updated
  const idx = logEntries.value.findIndex(e => e.id === updated.id)
  if (idx !== -1) {
    logEntries.value[idx] = updated
  } else {
    logEntries.value.unshift(updated)
  }
}

const handleVoyageDeleted = (id) => {
  logEntries.value = logEntries.value.filter(e => e.id !== id)
  selectedVoyage.value = null
}

// FORM SUBMISSIONS & FILE HANDLERS FOR OTHER TABS
const handleDocFileChange = (e) => { newDoc.file = e.target.files[0] }
const handleMaintFileChange = (e) => { newMaint.receipt = e.target.files[0] }
const handleTodoFileChange = (e) => { newTodo.file = e.target.files[0] }
const handleShopFileChange = (e) => { newShop.file = e.target.files[0] }

const submitDocument = async () => {
  try {
    const fd = new FormData()
    fd.append('title', newDoc.title)
    fd.append('description', newDoc.description || '')
    const filesList = Array.isArray(newDoc.files) ? newDoc.files : (newDoc.file ? [newDoc.file] : [])
    filesList.forEach(f => fd.append('files', f))

    await request(`/api/boats/${currentBoat.value.id}/documents`, {
      method: 'POST',
      body: fd
    })
    await fetchDocuments()
    newDoc.title = ''
    newDoc.description = ''
    newDoc.files = []
    newDoc.file = null
  } catch (e) { }
}

const submitMaintenance = async () => {
  try {
    const fd = new FormData()
    fd.append('title', newMaint.title)
    fd.append('date', newMaint.date)
    fd.append('description', newMaint.description || '')
    const filesList = Array.isArray(newMaint.files) ? newMaint.files : (newMaint.receipt ? [newMaint.receipt] : [])
    filesList.forEach(f => fd.append('files', f))

    await request(`/api/boats/${currentBoat.value.id}/maintenance`, {
      method: 'POST',
      body: fd
    })
    await fetchMaintenance()
    newMaint.title = ''
    newMaint.date = getTodayDateString()
    newMaint.description = ''
    newMaint.files = []
    newMaint.receipt = null
  } catch (e) { }
}

const submitTodo = async () => {
  try {
    const fd = new FormData()
    fd.append('text', newTodo.text)
    const filesList = Array.isArray(newTodo.files) ? newTodo.files : (newTodo.file ? [newTodo.file] : [])
    filesList.forEach(f => fd.append('files', f))

    await request(`/api/boats/${currentBoat.value.id}/todos`, {
      method: 'POST',
      body: fd
    })
    await fetchTodos()
    newTodo.text = ''
    newTodo.files = []
    newTodo.file = null
  } catch (e) { }
}

const toggleTodo = async (todo) => {
  try {
    const fd = new FormData()
    fd.append('done', (!todo.done).toString())
    const res = await request(`/api/todos/${todo.id}`, {
      method: 'PUT',
      body: fd
    })
    const updated = await res.json()
    const idx = todoItems.value.findIndex(t => t.id === todo.id)
    if (idx !== -1) todoItems.value[idx] = updated
  } catch (e) { }
}

const submitShopping = async () => {
  try {
    const fd = new FormData()
    fd.append('name', newShop.name)
    fd.append('description', newShop.description || '')
    fd.append('link', newShop.link || '')
    const filesList = Array.isArray(newShop.files) ? newShop.files : (newShop.file ? [newShop.file] : [])
    filesList.forEach(f => fd.append('files', f))

    await request(`/api/boats/${currentBoat.value.id}/shopping`, {
      method: 'POST',
      body: fd
    })
    await fetchShopping()
    newShop.name = ''
    newShop.description = ''
    newShop.link = ''
    newShop.files = []
    newShop.file = null
  } catch (e) { }
}

const toggleShopping = async (shop) => {
  try {
    const fd = new FormData()
    fd.append('done', (!shop.done).toString())
    const res = await request(`/api/shopping/${shop.id}`, {
      method: 'PUT',
      body: fd
    })
    const updated = await res.json()
    const idx = shoppingItems.value.findIndex(s => s.id === shop.id)
    if (idx !== -1) shoppingItems.value[idx] = updated
  } catch (e) { }
}

// POPUP DIALOG LOGIC FOR OTHER TABS
const openPopup = (type, entry) => {
  activePopup.value = { type, entry, editMode: false }
  editFile.value = null
}

const closePopup = () => {
  activePopup.value = null
  editFile.value = null
}

const handleEditFileChange = (e) => {
  editFile.value = e.target.files[0]
}

const savePopupEdit = async (editForm) => {
  if (!activePopup.value) return
  const type = activePopup.value.type
  const id = activePopup.value.entry.id

  try {
    const fd = new FormData()
    if (type === 'documents') {
      fd.append('title', editForm.title)
      fd.append('description', editForm.description || '')
    } else if (type === 'maintenance') {
      fd.append('title', editForm.title)
      fd.append('date', editForm.date)
      fd.append('description', editForm.description || '')
    } else if (type === 'todo') {
      fd.append('text', editForm.text)
      fd.append('done', editForm.done ? 'true' : 'false')
    } else if (type === 'shopping') {
      fd.append('name', editForm.name)
      fd.append('description', editForm.description || '')
      fd.append('link', editForm.link || '')
      fd.append('done', editForm.done ? 'true' : 'false')
    }
    if (editFile.value) {
      fd.append('file', editFile.value)
    }

    let url = ''
    if (type === 'documents') url = `/api/documents/${id}`
    else if (type === 'maintenance') url = `/api/maintenance/${id}`
    else if (type === 'todo') url = `/api/todos/${id}`
    else if (type === 'shopping') url = `/api/shopping/${id}`

    const res = await request(url, {
      method: 'PUT',
      body: fd
    })

    const updated = await res.json()
    activePopup.value.entry = updated
    activePopup.value.editMode = false
    editFile.value = null

    // Update in local array
    if (type === 'documents') {
      const idx = documents.value.findIndex(e => e.id === id)
      if (idx !== -1) documents.value[idx] = updated
    } else if (type === 'maintenance') {
      const idx = maintenanceRecords.value.findIndex(e => e.id === id)
      if (idx !== -1) maintenanceRecords.value[idx] = updated
      maintenanceRecords.value.sort((a, b) => new Date(b.date) - new Date(a.date))
    } else if (type === 'todo') {
      const idx = todoItems.value.findIndex(e => e.id === id)
      if (idx !== -1) todoItems.value[idx] = updated
    } else if (type === 'shopping') {
      const idx = shoppingItems.value.findIndex(e => e.id === id)
      if (idx !== -1) shoppingItems.value[idx] = updated
    }
  } catch (e) {
    alert(`Update failed: ${e.message}`)
  }
}

const deletePopupEntry = async () => {
  if (!activePopup.value) return
  if (!confirm('Are you sure you want to delete this record?')) return

  const type = activePopup.value.type
  const id = activePopup.value.entry.id

  let url = ''
  if (type === 'documents') url = `/api/documents/${id}`
  else if (type === 'maintenance') url = `/api/maintenance/${id}`
  else if (type === 'todo') url = `/api/todos/${id}`
  else if (type === 'shopping') url = `/api/shopping/${id}`

  try {
    await request(url, { method: 'DELETE' })
    if (type === 'documents') documents.value = documents.value.filter(e => e.id !== id)
    else if (type === 'maintenance') maintenanceRecords.value = maintenanceRecords.value.filter(e => e.id !== id)
    else if (type === 'todo') todoItems.value = todoItems.value.filter(e => e.id !== id)
    else if (type === 'shopping') shoppingItems.value = shoppingItems.value.filter(e => e.id !== id)

    closePopup()
  } catch (e) {
    alert(`Delete failed: ${e.message}`)
  }
}

onMounted(() => {
  const saved = checkAuthSaved()
  if (saved) {
    fetchBoats()
  }

  window.addEventListener('click', (e) => {
    const dropdown = document.getElementById('boatSelectorContainer')
    if (dropdown && !dropdown.contains(e.target)) {
      showBoatDropdown.value = false
    }
  })

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (activePopup.value) closePopup()
      if (selectedVoyage.value) selectedVoyage.value = null
      if (showCreateBoatModal.value) closeCreateBoatModal()
      if (showCreateLogModal.value) closeCreateLogModal()
    }
  })
})
</script>
