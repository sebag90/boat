export interface Boat {
  id: number
  name: string
  description: string
  created_at: string
}

export interface Waypoint {
  id: number
  log_id: number
  latitude: number
  longitude: number
  timestamp: string
  name: string | null
}

export interface WaypointInput {
  latitude: number
  longitude: number
  timestamp?: string
  name?: string | null
}

export interface Photo {
  id: number
  album?: string | null
  filename: string
  content_type: string
  created_at: string
}

export interface LogEntry {
  id: number
  date: string
  crew: string
  start: string
  goal: string
  description: string
  created_at: string
  waypoints: Waypoint[]
  photo_count: number
}

export interface LogEntryInput {
  date: string
  crew: string
  start: string
  goal: string
  description: string
  waypoints: WaypointInput[]
}

export interface DocumentEntry {
  id: number
  title: string
  description: string
  filename: string | null
  content_type: string | null
  uploaded_at: string
}

export interface MaintenanceEntry {
  id: number
  title: string
  date: string
  description: string
  receipt_filename: string | null
  created_at: string
  photo_count: number
}

export interface TodoEntry {
  id: number
  text: string
  done: boolean
  file_filename: string | null
  file_content_type: string | null
  created_at: string
}

export interface ShoppingEntry {
  id: number
  name: string
  description: string
  link: string
  done: boolean
  file_filename: string | null
  file_content_type: string | null
  created_at: string
}

export type TabId = 'logbook' | 'documents' | 'maintenance' | 'todos' | 'shopping' | 'settings'

export type EntryType = 'document' | 'maintenance' | 'todo' | 'shopping'

export type AnyEntry = DocumentEntry | MaintenanceEntry | TodoEntry | ShoppingEntry

export interface DetailTarget<T extends AnyEntry = AnyEntry> {
  type: EntryType
  entry: T
}
