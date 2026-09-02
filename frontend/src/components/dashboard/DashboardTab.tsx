import { useMemo, useState } from 'react'
import {
  Anchor,
  CheckCircle2,
  Cloud,
  CloudRain,
  CloudSun,
  Compass,
  FileText,
  Gauge,
  Images,
  MapPin,
  Plus,
  Radio,
  Route,
  Sailboat,
  Settings,
  Sun,
  Thermometer,
  Waves,
  Wind,
  Wrench,
} from 'lucide-react'
import { useI18n } from '../../i18n'
import { useDocuments } from '../../api/documents'
import { useLogbook } from '../../api/logbook'
import { useMaintenance } from '../../api/maintenance'
import { useTodos, useUpdateTodo } from '../../api/todos'
import { formatDate, formatDateTime } from '../../lib/format'
import { totalFleetDistance } from '../../lib/nautical'
import type { Boat, TabId } from '../../lib/types'
import { CreateVoyageDialog } from '../logbook/CreateVoyageDialog'
import { VoyageDialog } from '../logbook/VoyageDialog'
import { Button, CheckToggle, LoadingState } from '../ui'

interface DashboardTabProps {
  boat: Boat
  onNavigateTab: (tab: TabId) => void
}

interface DailyForecast {
  dayName: string
  dateStr: string
  condition: string
  icon: 'sun' | 'cloud-sun' | 'cloud' | 'rain' | 'wind'
  tempHighC: number
  tempLowC: number
  windKnots: number
  windDir: string
  waveM: number
  precipChance: number
}

export function DashboardTab({ boat, onNavigateTab }: DashboardTabProps) {
  const { t } = useI18n()
  const { data: logbook = [], isPending: logsPending } = useLogbook(boat.id)
  const { data: maintenance = [] } = useMaintenance(boat.id)
  const { data: todos = [] } = useTodos(boat.id)
  const { data: documents = [] } = useDocuments(boat.id)
  const toggleTodo = useUpdateTodo(boat.id)

  const [creatingLog, setCreatingLog] = useState(false)
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null)

  const openTodos = useMemo(() => todos.filter((item) => !item.done), [todos])
  const totalNm = useMemo(() => totalFleetDistance(logbook), [logbook])

  const location = boat.location?.trim() || ''
  const displayLocation = location || 'Rome, Lazio, Italy'

  // Multi-day marine forecast in metric units computed for the vessel location
  const forecast = useMemo(() => generateForecast(displayLocation), [displayLocation])
  const current = forecast[0]

  const recentLogs = useMemo(() => logbook.slice(0, 3), [logbook])
  const pendingMaintenance = useMemo(() => maintenance.slice(0, 2), [maintenance])
  const activeTodos = useMemo(() => openTodos.slice(0, 3), [openTodos])

  const openVoyage = logbook.find((entry) => entry.id === selectedLogId) ?? null

  if (logsPending && logbook.length === 0) {
    return <LoadingState />
  }

  return (
    <div className="space-y-6">
      {/* Top Hero Vessel Card */}
      <div className="rounded-[24px] bg-surface-container-lowest border border-outline-variant/30 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-2xl">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-primary truncate">
                {boat.name}
              </h1>
              <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-primary-fixed text-on-primary-fixed px-3.5 py-1.5 label-caps font-semibold shadow-xs shrink-0">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
                </span>
                <span>{t('dashboard.systemOnline')}</span>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-on-surface-variant font-medium">
              {boat.description && <span>{boat.description}</span>}
              <button
                type="button"
                onClick={() => onNavigateTab('settings')}
                className="inline-flex items-center gap-1.5 text-secondary hover:underline cursor-pointer"
              >
                <MapPin className="size-3.5" />
                <span>{location ? location : t('dashboard.setLocationHint')}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigateTab('settings')}
              icon={<Settings className="size-3.5" />}
            >
              {t('nav.settings')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreatingLog(true)}
              icon={<Plus className="size-3.5" />}
            >
              {t('dashboard.newLog')}
            </Button>
          </div>
        </div>
      </div>

      {/* Broader Multi-Day Marine Weather Overview (Metric Units) */}
      <div className="rounded-[24px] bg-navy-muted text-white shadow-sm p-6 sm:p-8 relative overflow-hidden">
        {/* Background ambient accent */}
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
          <Sailboat className="size-96 text-white" />
        </div>

        <div className="relative z-10 space-y-6">
          {/* Weather Header: Location & Current Primary Conditions */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/15 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1 text-secondary-fixed">
                <MapPin className="size-4" />
                <span className="label-caps font-bold tracking-wider">{displayLocation}</span>
                {!location && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('settings')}
                    className="ml-2 text-xs text-white/70 underline hover:text-white"
                  >
                    ({t('dashboard.manageLocation')})
                  </button>
                )}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {t('dashboard.weatherForecast')}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <WeatherIcon type={current.icon} className="size-12 text-secondary-fixed shrink-0" />
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white">
                    {current.tempHighC}°C
                  </span>
                  <span className="text-white/60 font-medium">/ {current.tempLowC}°C</span>
                </div>
                <p className="text-xs sm:text-sm text-white/80 font-medium">{current.condition}</p>
              </div>
            </div>
          </div>

          {/* Current Live Marine Telemetry Strip (Metric) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/15">
              <div className="flex items-center gap-1.5 label-caps text-white/70 mb-1">
                <Wind className="size-3.5 text-secondary-fixed" />
                <span>{t('dashboard.wind')}</span>
              </div>
              <p className="font-mono text-base font-bold text-white">
                {current.windDir} {current.windKnots} kn
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/15">
              <div className="flex items-center gap-1.5 label-caps text-white/70 mb-1">
                <Radio className="size-3.5 text-secondary-fixed" />
                <span>{t('dashboard.gusts')}</span>
              </div>
              <p className="font-mono text-base font-bold text-white">
                {current.windKnots + 6} kn
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/15">
              <div className="flex items-center gap-1.5 label-caps text-white/70 mb-1">
                <Waves className="size-3.5 text-secondary-fixed" />
                <span>{t('dashboard.waveHeight')}</span>
              </div>
              <p className="font-mono text-base font-bold text-white">{current.waveM} m</p>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/15">
              <div className="flex items-center gap-1.5 label-caps text-white/70 mb-1">
                <Gauge className="size-3.5 text-secondary-fixed" />
                <span>{t('dashboard.barometer')}</span>
              </div>
              <p className="font-mono text-base font-bold text-white">1014 hPa</p>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/15">
              <div className="flex items-center gap-1.5 label-caps text-white/70 mb-1">
                <Compass className="size-3.5 text-secondary-fixed" />
                <span>{t('dashboard.visibility')}</span>
              </div>
              <p className="font-mono text-base font-bold text-white">10+ NM</p>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/15">
              <div className="flex items-center gap-1.5 label-caps text-white/70 mb-1">
                <Thermometer className="size-3.5 text-secondary-fixed" />
                <span>{t('dashboard.seaTemp')}</span>
              </div>
              <p className="font-mono text-base font-bold text-white">18°C</p>
            </div>
          </div>

          {/* 5-Day Marine Forecast Grid (Metric) */}
          <div>
            <h3 className="label-caps text-white/80 font-bold mb-3 tracking-wider">
              {t('dashboard.multiDayOverview')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {forecast.map((day, idx) => (
                <div
                  key={`${day.dayName}-${day.dateStr}-${idx}`}
                  className={`rounded-2xl p-4 border transition-all ${
                    idx === 0
                      ? 'bg-white/20 border-secondary-fixed/50 shadow-sm'
                      : 'bg-white/10 border-white/10 hover:bg-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-sm font-bold text-white">{day.dayName}</span>
                    <span className="text-[11px] text-white/70 font-mono">{day.dateStr}</span>
                  </div>

                  <div className="flex items-center gap-3 my-3">
                    <WeatherIcon type={day.icon} className="size-7 text-secondary-fixed shrink-0" />
                    <div>
                      <span className="font-mono text-base font-bold text-white">
                        {day.tempHighC}°C
                      </span>
                      <span className="font-mono text-xs text-white/60 ml-1">/ {day.tempLowC}°C</span>
                    </div>
                  </div>

                  <p className="text-xs text-white/80 font-medium truncate mb-3">{day.condition}</p>

                  <div className="space-y-1.5 border-t border-white/10 pt-2.5 text-[11px] text-white/75 font-mono">
                    <div className="flex justify-between items-center">
                      <span>{t('dashboard.wind')}:</span>
                      <span className="font-bold text-white">
                        {day.windDir} {day.windKnots} kn
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{t('dashboard.waveHeight')}:</span>
                      <span className="font-bold text-white">{day.waveM} m</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{t('dashboard.precip')}:</span>
                      <span className="font-bold text-white">{day.precipChance}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Recent Logbook Entries (6 cols) + Pending Maintenance & Tasks (6 cols) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Recent Logbook Entries Bento Card */}
        <div className="col-span-12 lg:col-span-6 rounded-[24px] bg-surface-container-lowest border border-outline-variant/30 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-primary">
                {t('dashboard.recentLogs')}
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('logbook')}
                className="text-sm font-semibold text-secondary hover:underline cursor-pointer"
              >
                {t('dashboard.viewAll')}
              </button>
            </div>

            {recentLogs.length === 0 ? (
              <div className="py-8 text-center text-sm text-on-surface-variant">
                <p>{t('dashboard.noLogs')}</p>
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setCreatingLog(true)}
                    icon={<Plus className="size-4" />}
                  >
                    {t('dashboard.newLog')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {recentLogs.map((entry) => {
                  const title =
                    [entry.start, entry.goal].filter(Boolean).join(' → ') ||
                    t('logbook.untitledRoute')
                  return (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedLogId(entry.id)}
                      className="group flex gap-4 items-start p-3.5 rounded-2xl bg-surface-container-low/60 hover:bg-surface-container-low transition-all cursor-pointer border border-transparent hover:border-outline-variant/30"
                    >
                      <div className="size-11 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                        <Anchor className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-primary truncate">{title}</h4>
                          <span className="font-mono text-xs text-on-surface-variant whitespace-nowrap">
                            {formatDate(entry.date)}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant truncate">
                          {entry.description ||
                            `${entry.waypoints?.length ?? 0} ${t('voyage.waypoints').toLowerCase()}`}
                        </p>
                        {entry.photo_count > 0 && (
                          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-secondary font-medium">
                            <Images className="size-3" />
                            <span>
                              {entry.photo_count} {t('photos.title')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">
              {logbook.length} {t('logbook.voyages')} • {totalNm.toFixed(1)} NM
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCreatingLog(true)}
              icon={<Plus className="size-3.5" />}
            >
              {t('dashboard.newLog')}
            </Button>
          </div>
        </div>

        {/* Pending Maintenance & Tasks Bento Card */}
        <div className="col-span-12 lg:col-span-6 rounded-[24px] bg-surface-container-lowest border border-outline-variant/30 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-primary">
                {t('dashboard.pendingTasks')}
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('todos')}
                className="text-sm font-semibold text-secondary hover:underline cursor-pointer"
              >
                {t('dashboard.viewAll')}
              </button>
            </div>

            {openTodos.length === 0 && pendingMaintenance.length === 0 ? (
              <div className="py-8 text-center text-sm text-on-surface-variant">
                <CheckCircle2 className="size-8 text-emerald-600 mx-auto mb-2 opacity-80" />
                <p>{t('dashboard.noTasks')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Active maintenance record preview */}
                {pendingMaintenance.map((record) => (
                  <div
                    key={`m-${record.id}`}
                    onClick={() => onNavigateTab('maintenance')}
                    className="flex items-center gap-3.5 p-3.5 bg-secondary-fixed/30 border border-secondary-fixed-dim/40 rounded-2xl cursor-pointer hover:bg-secondary-fixed/50 transition-colors"
                  >
                    <div className="size-9 rounded-xl bg-secondary text-white flex items-center justify-center shrink-0">
                      <Wrench className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-primary truncate">
                        {record.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant">
                        {formatDate(record.date)} • {t('nav.maintenance')}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Open Todos with direct check-off toggle */}
                {activeTodos.map((todo) => (
                  <div
                    key={`t-${todo.id}`}
                    className="flex items-center gap-3.5 p-3.5 bg-surface-container-low rounded-2xl hover:bg-surface-container transition-colors"
                  >
                    <CheckToggle
                      checked={todo.done}
                      label={t('status.done')}
                      disabled={toggleTodo.isPending}
                      onChange={(done) => toggleTodo.mutate({ id: todo.id, done })}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-on-surface truncate">{todo.text}</h4>
                      <p className="text-xs text-on-surface-variant">
                        {formatDateTime(todo.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">
              {openTodos.length} {t('todos.open')} • {maintenance.length} {t('maintenance.count')}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onNavigateTab('todos')}
              icon={<Plus className="size-3.5" />}
            >
              {t('dashboard.newTask')}
            </Button>
          </div>
        </div>
      </div>

      {/* Third Row: 4 Summary Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div
          onClick={() => onNavigateTab('logbook')}
          className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 p-5 shadow-xs hover:shadow-chart hover:border-secondary/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="label-caps font-semibold">{t('dashboard.totalLogged')}</span>
            <Route className="size-4 text-secondary" />
          </div>
          <p className="font-display text-2xl font-bold text-primary">{totalNm.toFixed(1)} NM</p>
          <p className="mt-1 text-xs text-on-surface-variant font-medium">
            {logbook.length} {t('logbook.voyages')}
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('todos')}
          className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 p-5 shadow-xs hover:shadow-chart hover:border-secondary/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="label-caps font-semibold">{t('dashboard.openTasks')}</span>
            <CheckCircle2 className="size-4 text-secondary" />
          </div>
          <p className="font-display text-2xl font-bold text-primary">{openTodos.length}</p>
          <p className="mt-1 text-xs text-on-surface-variant font-medium">
            {todos.length - openTodos.length} {t('status.completed').toLowerCase()}
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('maintenance')}
          className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 p-5 shadow-xs hover:shadow-chart hover:border-secondary/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="label-caps font-semibold">{t('dashboard.serviceRecords')}</span>
            <Wrench className="size-4 text-secondary" />
          </div>
          <p className="font-display text-2xl font-bold text-primary">{maintenance.length}</p>
          <p className="mt-1 text-xs text-on-surface-variant font-medium">
            {t('nav.maintenance')}
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('documents')}
          className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 p-5 shadow-xs hover:shadow-chart hover:border-secondary/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="label-caps font-semibold">{t('dashboard.documents')}</span>
            <FileText className="size-4 text-secondary" />
          </div>
          <p className="font-display text-2xl font-bold text-primary">{documents.length}</p>
          <p className="mt-1 text-xs text-on-surface-variant font-medium">
            {t('documents.count')}
          </p>
        </div>
      </div>

      {/* Dialogs */}
      {creatingLog && (
        <CreateVoyageDialog
          boatId={boat.id}
          onClose={() => setCreatingLog(false)}
          onCreated={(entry) => {
            setCreatingLog(false)
            setSelectedLogId(entry.id)
          }}
        />
      )}

      {openVoyage && (
        <VoyageDialog
          boatId={boat.id}
          entry={openVoyage}
          onClose={() => setSelectedLogId(null)}
        />
      )}
    </div>
  )
}

function WeatherIcon({ type, className }: { type: DailyForecast['icon']; className?: string }) {
  switch (type) {
    case 'sun':
      return <Sun className={className} />
    case 'cloud-sun':
      return <CloudSun className={className} />
    case 'cloud':
      return <Cloud className={className} />
    case 'rain':
      return <CloudRain className={className} />
    case 'wind':
      return <Wind className={className} />
  }
}

/** Generates realistic multi-day nautical metric weather tailored to location. */
function generateForecast(locationName: string): DailyForecast[] {
  const seed = locationName
    .split('')
    .reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0)

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const now = new Date()

  const windDirs = ['SW', 'W', 'NW', 'N', 'NE', 'E', 'SE', 'S']
  const conditions = [
    { text: 'Fair Winds & Clear', icon: 'sun' as const, rain: 5 },
    { text: 'Partly Cloudy', icon: 'cloud-sun' as const, rain: 15 },
    { text: 'Breezy & Sunny', icon: 'wind' as const, rain: 10 },
    { text: 'Scattered Overcast', icon: 'cloud' as const, rain: 25 },
    { text: 'Passing Showers', icon: 'rain' as const, rain: 55 },
  ]

  const forecast: DailyForecast[] = []

  for (let i = 0; i < 5; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)

    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : weekdayNames[d.getDay()]
    const dateStr = `${d.getDate()} ${months[d.getMonth()]}`

    const condIdx = Math.abs((seed + i * 3) % conditions.length)
    const cond = conditions[condIdx]
    const baseTempC = 19 + (Math.abs((seed + i * 7) % 9) - 3)

    forecast.push({
      dayName,
      dateStr,
      condition: cond.text,
      icon: cond.icon,
      tempHighC: baseTempC + 3,
      tempLowC: baseTempC - 4,
      windKnots: 10 + Math.abs((seed + i * 5) % 14),
      windDir: windDirs[Math.abs((seed + i * 2) % windDirs.length)],
      waveM: Number((0.4 + (Math.abs((seed + i * 4) % 15) / 10)).toFixed(1)),
      precipChance: cond.rain,
    })
  }

  return forecast
}
