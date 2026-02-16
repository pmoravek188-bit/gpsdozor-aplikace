<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('eco.title') }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ t('eco.subtitle') }}</p>
      </div>
      <button
        v-if="events.length > 0"
        @click="exportEvents"
        class="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {{ t('eco.exportCsv') }}
      </button>
    </div>

    <!-- Selector -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <VehicleSelector
        v-model="selectedVehicle"
        v-model:from="dateFrom"
        v-model:to="dateTo"
        :loading="loading"
        @load="loadEcoData"
      />

      <!-- Quick period selector -->
      <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-2">
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('eco.quickPeriod') }}:</p>
          <button
            @click="findEcoPeriod"
            :disabled="!selectedVehicle || searchingPeriod"
            class="px-2.5 py-1 text-xs rounded-lg border transition-colors bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="searchingPeriod">{{ t('eco.searching') }}...</span>
            <span v-else>{{ t('eco.findData') }}</span>
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="period in quickPeriods"
            :key="period.key"
            @click="setQuickPeriod(period.key)"
            class="px-2.5 py-1 text-xs rounded-lg border transition-colors bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400"
          >
            {{ period.label }}
          </button>
        </div>
        <div v-if="ecoDisabled" class="mt-2 text-xs text-amber-700 dark:text-amber-300">
          {{ t('eco.ecoDisabled') }}
        </div>
        <div v-if="derivedEco" class="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
          {{ t('eco.derivedNotice') }}
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <SkeletonLoader type="stats" :count="4" />
      <SkeletonLoader type="chart" />
      <SkeletonLoader type="table" :count="6" />
    </div>

    <template v-if="!loading && events.length > 0">
      <!-- Summary stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          :label="t('eco.totalEvents')"
          :value="events.length"
          colorClass="bg-blue-50 text-blue-600"
        >
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </template>
        </StatCard>
        <StatCard
          :label="t('eco.harshBraking')"
          :value="harshBraking"
          colorClass="bg-red-50 text-red-600"
        >
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </template>
        </StatCard>
        <StatCard
          :label="t('eco.harshCornering')"
          :value="harshCornering"
          colorClass="bg-amber-50 text-amber-600"
        >
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </template>
        </StatCard>
        <StatCard
          :label="t('eco.idling')"
          :value="idling"
          colorClass="bg-purple-50 text-purple-600"
        >
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </template>
        </StatCard>
      </div>

      <!-- Event type chart (Doughnut) + Bar timeline -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">{{ t('eco.eventDistribution') }}</h3>
          <div class="chart-container h-[300px] flex items-center justify-center">
            <Doughnut :data="eventTypeChartData" :options="doughnutOptions" />
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">{{ t('eco.eventsOverTime') }}</h3>
          <div class="chart-container h-[300px]">
            <Bar :data="timelineChartData" :options="barOptions" />
          </div>
        </div>
      </div>

      <!-- Events Map -->
      <div v-if="eventsWithPosition.length > 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">📍 {{ t('eco.eventsMap') }}</h3>
          <span class="text-xs text-gray-400">{{ t('eco.eventsMapHint') }}</span>
        </div>
        <div class="h-[400px]">
          <l-map
            :zoom="10"
            :center="mapCenter"
            :use-global-leaflet="false"
            class="h-full w-full"
          >
            <l-tile-layer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <l-marker
              v-for="(evt, idx) in eventsWithPosition"
              :key="idx"
              :lat-lng="[evt.Position.Latitude, evt.Position.Longitude]"
            >
              <l-icon
                :icon-size="[24, 24]"
                :icon-anchor="[12, 12]"
                :icon-url="getEventMarkerIcon(evt.EventType)"
              />
              <l-popup>
                <div class="min-w-[180px]">
                  <p class="font-bold text-sm" :class="getEventTextColor(evt.EventType)">
                    {{ getEventLabel(evt.EventType) }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">{{ formatDate(evt.Timestamp) }}</p>
                  <p v-if="evt.EventValue" class="text-xs mt-1">
                    {{ t('eco.value') }}: <strong>{{ evt.EventValue }}</strong>
                  </p>
                  <p class="text-xs mt-1">
                    {{ t('eco.severity') }}: <span :class="getSeverityTextClass(evt.EventSeverity)">{{ getSeverityLabel(evt.EventSeverity) }}</span>
                  </p>
                </div>
              </l-popup>
            </l-marker>
          </l-map>
        </div>
      </div>

      <!-- Severity distribution -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">{{ t('eco.severityDistribution') }}</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div v-for="sev in Object.keys(severityCounts)" :key="sev" class="text-center p-4 rounded-lg" :class="getSeverityBgClass(Number(sev))">
            <p class="text-2xl font-bold" :class="getSeverityTextClass(Number(sev))">{{ severityCounts[sev] || 0 }}</p>
            <p class="text-xs mt-1" :class="getSeverityTextClass(Number(sev))">{{ getSeverityLabel(Number(sev)) }}</p>
          </div>
        </div>
      </div>

      <!-- Events table -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">{{ t('eco.eventList') }}</h3>
          <select v-model="eventFilter" class="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-200">
            <option value="all">{{ t('eco.allTypes') }}</option>
            <option v-for="type in uniqueEventTypes" :key="type" :value="type">
              {{ getEventLabel(type) }}
            </option>
          </select>
        </div>
        <div class="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="sticky top-0 bg-gray-50 dark:bg-gray-700/50">
              <tr class="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th class="px-5 py-3">{{ t('eco.time') }}</th>
                <th class="px-5 py-3">{{ t('eco.eventType') }}</th>
                <th class="px-5 py-3">{{ t('eco.value') }}</th>
                <th class="px-5 py-3">{{ t('eco.severity') }}</th>
                <th class="px-5 py-3">{{ t('eco.positionCol') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr
                v-for="(evt, idx) in filteredEvents"
                :key="idx"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td class="px-5 py-3 text-gray-600 dark:text-gray-300">{{ formatDate(evt.Timestamp) }}</td>
                <td class="px-5 py-3">
                  <span :class="getEventBadgeClass(evt.EventType)">
                    {{ getEventLabel(evt.EventType) }}
                  </span>
                </td>
                <td class="px-5 py-3 font-medium dark:text-gray-200">{{ evt.EventValue || '–' }}</td>
                <td class="px-5 py-3">
                  <span :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    getSeverityBgClass(evt.EventSeverity),
                    getSeverityTextClass(evt.EventSeverity),
                  ]">
                    {{ getSeverityLabel(evt.EventSeverity) }}
                  </span>
                </td>
                <td class="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">
                  <template v-if="evt.Position">
                    {{ evt.Position.Latitude?.toFixed(4) }}, {{ evt.Position.Longitude?.toFixed(4) }}
                  </template>
                  <template v-else>–</template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <div v-if="!loading && loaded && events.length === 0" class="text-center py-16 text-gray-400 dark:text-gray-500">
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>{{ t('eco.noEvents') }}</p>
      <p class="text-sm mt-1">{{ t('eco.noEventsHint') }}</p>
      <button
        v-if="selectedVehicle"
        @click="findEcoPeriod"
        :disabled="searchingPeriod"
        class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/60"
      >
        {{ t('eco.findData') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { LMap, LTileLayer, LMarker, LPopup, LIcon } from '@vue-leaflet/vue-leaflet'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend,
} from 'chart.js'
import { useFleetStore } from '../stores/fleet'
import { useExport } from '../composables/useExport'
import { useToast } from '../composables/useToast'
import { useChartTheme } from '../composables/useChartTheme'
import { useApiError } from '../composables/useApiError'
import VehicleSelector from '../components/VehicleSelector.vue'
import StatCard from '../components/StatCard.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import dayjs from 'dayjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const { t } = useI18n()
const route = useRoute()
const fleetStore = useFleetStore()
const { exportCSV } = useExport()
const { showToast } = useToast()
const { handleApiError } = useApiError()
const { buildOptions } = useChartTheme()

const selectedVehicle = ref(route.params.vehicleCode || '')
const dateFrom = ref(dayjs().subtract(30, 'day').format('YYYY-MM-DDTHH:mm'))
const dateTo = ref(dayjs().format('YYYY-MM-DDTHH:mm'))
const events = ref([])
const loading = ref(false)
const loaded = ref(false)
const derivedEco = ref(false)
const searchingPeriod = ref(false)
const eventFilter = ref('all')
const selectedVehicleInfo = computed(() =>
  fleetStore.vehicles.find(v => v.vehicleCode === selectedVehicle.value) || null
)
const ecoDisabled = computed(() =>
  selectedVehicleInfo.value && selectedVehicleInfo.value.isEcoDrivingEnabled === false
)

const quickPeriods = computed(() => ([
  { key: 'week', label: t('eco.periods.lastWeek'), days: 7 },
  { key: 'month', label: t('eco.periods.lastMonth'), days: 30 },
  { key: '3months', label: t('eco.periods.last3Months'), days: 90 },
  { key: '6months', label: t('eco.periods.last6Months'), days: 180 },
  { key: 'year', label: t('eco.periods.lastYear'), days: 365 },
]))

const eventColors = {
  0: '#ef4444', // red
  1: '#f59e0b', // amber
  2: '#8b5cf6', // purple
  3: '#3b82f6', // blue
  4: '#6b7280', // gray
  5: '#f97316', // orange
  6: '#14b8a6', // teal
}

const harshBraking = computed(() =>
  events.value.filter(e => e.EventType === 0).length
)
const harshCornering = computed(() =>
  events.value.filter(e => e.EventType === 2).length
)
const idling = computed(() =>
  events.value.filter(e => e.EventType === 4).length
)

const severityCounts = computed(() => {
  const counts = {}
  events.value.forEach(e => {
    const sev = e.EventSeverity ?? 0
    counts[sev] = (counts[sev] || 0) + 1
  })
  return counts
})

const uniqueEventTypes = computed(() => {
  const types = new Set(events.value.map(e => e.EventType))
  return [...types].sort((a, b) => a - b)
})

const filteredEvents = computed(() => {
  if (eventFilter.value === 'all') return events.value
  return events.value.filter(e => e.EventType === Number(eventFilter.value))
})

// Events with position for map
const eventsWithPosition = computed(() =>
  events.value.filter(e => e.Position && e.Position.Latitude && e.Position.Longitude)
)

const mapCenter = computed(() => {
  if (eventsWithPosition.value.length === 0) return [49.8, 15.5]
  const lats = eventsWithPosition.value.map(e => e.Position.Latitude)
  const lngs = eventsWithPosition.value.map(e => e.Position.Longitude)
  return [
    (Math.min(...lats) + Math.max(...lats)) / 2,
    (Math.min(...lngs) + Math.max(...lngs)) / 2,
  ]
})

const eventTypeChartData = computed(() => {
  const counts = {}
  events.value.forEach(e => {
    const type = e.EventType
    counts[type] = (counts[type] || 0) + 1
  })
  return {
    labels: Object.keys(counts).map(k => getEventLabel(Number(k))),
    datasets: [{
      data: Object.values(counts),
      backgroundColor: Object.keys(counts).map(k => eventColors[Number(k)] || '#6b7280'),
    }]
  }
})

const timelineChartData = computed(() => {
  const dayCounts = {}
  events.value.forEach(e => {
    const d = dayjs(e.Timestamp).format('DD.MM')
    dayCounts[d] = (dayCounts[d] || 0) + 1
  })
  const sorted = Object.entries(dayCounts).sort((a, b) => {
    const dateA = dayjs(a[0], 'DD.MM').valueOf()
    const dateB = dayjs(b[0], 'DD.MM').valueOf()
    return dateA - dateB
  })
  return {
    labels: sorted.map(([d]) => d),
    datasets: [{
      label: t('eco.eventsLabel'),
      data: sorted.map(([, c]) => c),
      backgroundColor: '#3b82f6',
      borderRadius: 6,
    }]
  }
})

const doughnutOptions = computed(() => buildOptions({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
  },
  scales: {},
}))

const barOptions = computed(() => buildOptions({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {},
    y: { beginAtZero: true, title: { display: true, text: t('eco.eventCount') } },
  },
}))

function getEventLabel(type) {
  const key = `eco.type${type}`
  const label = t(key)
  return label !== key ? label : `Typ ${type}`
}

function getEventBadgeClass(type) {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'
  if (type === 0) return `${base} bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400`
  if (type === 1) return `${base} bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400`
  if (type === 2) return `${base} bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400`
  if (type === 3) return `${base} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400`
  if (type === 4) return `${base} bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-400`
  if (type === 5) return `${base} bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400`
  if (type === 6) return `${base} bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400`
  return `${base} bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-400`
}

function getEventTextColor(type) {
  if (type === 0) return 'text-red-700'
  if (type === 1) return 'text-amber-700'
  if (type === 2) return 'text-purple-700'
  if (type === 3) return 'text-blue-700'
  if (type === 5) return 'text-orange-700'
  if (type === 6) return 'text-teal-700'
  return 'text-gray-700'
}

function getEventMarkerIcon(type) {
  const color = (eventColors[type] || '#6b7280').replace('#', '%23')
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="${decodeURIComponent(color)}" stroke="white" stroke-width="2.5"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="11" font-weight="bold">!</text></svg>`)}`
}

function getSeverityLabel(severity) {
  if (severity === 0) return t('eco.severityLow')
  if (severity === 1) return t('eco.severityMedium')
  if (severity === 2) return t('eco.severityHigh')
  if (severity === 3) return t('eco.severityCritical')
  return `${severity}`
}

function getSeverityBgClass(severity) {
  if (severity === 0) return 'bg-green-50 dark:bg-green-900/20'
  if (severity === 1) return 'bg-yellow-50 dark:bg-yellow-900/20'
  if (severity === 2) return 'bg-red-50 dark:bg-red-900/20'
  if (severity === 3) return 'bg-red-100 dark:bg-red-900/30'
  return 'bg-gray-50 dark:bg-gray-700/30'
}

function getSeverityTextClass(severity) {
  if (severity === 0) return 'text-green-700 dark:text-green-400'
  if (severity === 1) return 'text-yellow-700 dark:text-yellow-400'
  if (severity === 2) return 'text-red-700 dark:text-red-400'
  if (severity === 3) return 'text-red-800 dark:text-red-300'
  return 'text-gray-700 dark:text-gray-400'
}




async function resolveVehicleAnchorTime() {
  const code = selectedVehicle.value
  if (!code) return null

  const fromStore = (fleetStore.vehicles || []).find(v => v.vehicleCode === code)
  let ts = fromStore?.lastResponseTime

  if (!ts) {
    try {
      const detail = await fleetStore.fetchVehicle(code)
      ts = detail?.lastResponseTime
    } catch (e) {
      // ignore
    }
  }

  if (!ts) return null
  const parsed = dayjs(ts)
  return parsed.isValid() ? parsed : null
}

function getHistoryRange(points) {
  if (!Array.isArray(points) || points.length === 0) return null
  const times = points
    .map(p => new Date(p.Timestamp || p.timestamp).getTime())
    .filter(t => Number.isFinite(t))
  if (times.length === 0) return null
  return {
    from: dayjs(Math.min(...times)).format('YYYY-MM-DDTHH:mm:ss'),
    to: dayjs(Math.max(...times)).format('YYYY-MM-DDTHH:mm:ss'),
  }
}

async function findEcoPeriod() {
  if (!selectedVehicle.value) return
  searchingPeriod.value = true
  showToast(t('eco.searchingData'), 'info', 2000)

  const anchor = await resolveVehicleAnchorTime()
  const base = anchor || dayjs()

  const periodsToTry = [
    { days: 7, label: t('eco.periods.lastWeek') },
    { days: 14, label: t('eco.periods.last2Weeks') },
    { days: 30, label: t('eco.periods.lastMonth') },
    { days: 60, label: t('eco.periods.last2Months') },
    { days: 90, label: t('eco.periods.last3Months') },
    { days: 180, label: t('eco.periods.last6Months') },
    { days: 365, label: t('eco.periods.lastYear') },
  ]

  for (const period of periodsToTry) {
    const fromDate = base.subtract(period.days, 'day').format('YYYY-MM-DDTHH:mm:ss')
    const toDate = base.format('YYYY-MM-DDTHH:mm:ss')

    try {
      const data = await fleetStore.fetchEcoDriving(
        selectedVehicle.value,
        fromDate,
        toDate
      )

      if (data?.Message || data?.message) {
        continue
      }

      const raw = extractEcoEvents(data)
      const parsed = raw.map(normalizeEcoEvent).filter(Boolean)
      if (parsed.length > 0) {
        dateFrom.value = fromDate
        dateTo.value = toDate
        events.value = parsed
        loaded.value = true
        loading.value = false
        searchingPeriod.value = false
        showToast(t('eco.dataFound', { period: period.label }), 'success', 5000)
        return
      }
    } catch (e) {
      // continue
    }
  }

  const historyPeriods = anchor
    ? [30, 90, 180, 365]
    : [30, 90, 180, 365, 730, 1825]

  for (const days of historyPeriods) {
    const fromDate = base.subtract(days, 'day').format('YYYY-MM-DDTHH:mm:ss')
    const toDate = base.format('YYYY-MM-DDTHH:mm:ss')
    const fallbackOk = await tryEcoHistoryFallback(fromDate, toDate, { updateRange: true })
    if (fallbackOk) {
      searchingPeriod.value = false
      showToast(t('eco.derivedNotice'), 'info', 4000)
      return
    }
  }

  searchingPeriod.value = false
  showToast(t('eco.noDataFound'), 'warning', 5000)
}


function deriveEcoEventsFromHistory(points) {
  if (!Array.isArray(points) || points.length < 2) return []

  const parsed = points
    .map(p => {
      const t = p.Timestamp || p.timestamp
      const speed = Number(p.Speed ?? p.speed)
      const lat = p.Lat ?? p.Latitude
      const lng = p.Lng ?? p.Longitude
      return { t, speed, lat, lng }
    })
    .filter(p => p.t && Number.isFinite(p.speed))
    .sort((a, b) => (new Date(a.t)).getTime() - (new Date(b.t)).getTime())

  const events = []
  const minGapMs = 60 * 1000
  const lastAt = { 0: 0, 1: 0, 3: 0 }

  for (let i = 1; i < parsed.length; i++) {
    const prev = parsed[i - 1]
    const cur = parsed[i]
    const t1 = new Date(prev.t).getTime()
    const t2 = new Date(cur.t).getTime()
    const dt = (t2 - t1) / 1000
    if (!dt || dt <= 0 || dt > 300) continue

    const v1 = prev.speed / 3.6
    const v2 = cur.speed / 3.6
    const accel = (v2 - v1) / dt

    if (accel <= -3 && (t2 - lastAt[0] > minGapMs)) {
      const sev = accel <= -6 ? 2 : accel <= -4.5 ? 1 : 0
      events.push({
        EventType: 0,
        EventSeverity: sev,
        EventValue: Math.round(accel * 10) / 10,
        Timestamp: cur.t,
        Position: (cur.lat != null && cur.lng != null) ? { Latitude: Number(cur.lat), Longitude: Number(cur.lng) } : null,
      })
      lastAt[0] = t2
    }

    if (accel >= 3 && (t2 - lastAt[1] > minGapMs)) {
      const sev = accel >= 6 ? 2 : accel >= 4.5 ? 1 : 0
      events.push({
        EventType: 1,
        EventSeverity: sev,
        EventValue: Math.round(accel * 10) / 10,
        Timestamp: cur.t,
        Position: (cur.lat != null && cur.lng != null) ? { Latitude: Number(cur.lat), Longitude: Number(cur.lng) } : null,
      })
      lastAt[1] = t2
    }

    if (cur.speed >= 120 && (t2 - lastAt[3] > minGapMs)) {
      const sev = cur.speed >= 150 ? 2 : cur.speed >= 135 ? 1 : 0
      events.push({
        EventType: 3,
        EventSeverity: sev,
        EventValue: Math.round(cur.speed),
        Timestamp: cur.t,
        Position: (cur.lat != null && cur.lng != null) ? { Latitude: Number(cur.lat), Longitude: Number(cur.lng) } : null,
      })
      lastAt[3] = t2
    }
  }

  return events
}

async function tryEcoHistoryFallback(fromDate, toDate, options = {}) {
  const { updateRange = false } = options
  try {
    const history = await fleetStore.fetchHistory(selectedVehicle.value, fromDate, toDate)
    const points = Array.isArray(history) ? history : []
    const derived = deriveEcoEventsFromHistory(points)
    if (derived.length === 0) return false

    if (updateRange) {
      const range = getHistoryRange(points)
      if (range) {
        dateFrom.value = range.from
        dateTo.value = range.to
      }
    }

    events.value = derived
    derivedEco.value = true
    return true
  } catch (e) {
    return false
  }
}

function extractEcoEvents(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.Items)) return data.Items
  if (Array.isArray(data?.events)) return data.events
  if (Array.isArray(data?.Events)) return data.Events
  return []
}

function normalizeEcoEvent(evt) {
  if (!evt || typeof evt !== 'object') return null

  const typeRaw = evt.EventType ?? evt.eventType ?? evt.Type ?? evt.type
  const eventType = Number(typeRaw)
  if (!Number.isFinite(eventType)) return null

  const severityRaw = evt.EventSeverity ?? evt.eventSeverity ?? evt.Severity ?? evt.severity
  const eventSeverity = Number.isFinite(Number(severityRaw)) ? Number(severityRaw) : 0

  const value = evt.EventValue ?? evt.eventValue ?? evt.Value ?? evt.value
  const ts = evt.Timestamp ?? evt.TimeStamp ?? evt.time ?? evt.Time ?? evt.date ?? evt.Date

  const pos = evt.Position ?? evt.position ?? null
  const lat = pos?.Latitude ?? pos?.Lat ?? pos?.lat ?? evt.Latitude ?? evt.Lat ?? evt.lat
  const lng = pos?.Longitude ?? pos?.Lng ?? pos?.Lon ?? pos?.lng ?? pos?.lon ?? evt.Longitude ?? evt.Lng ?? evt.Lon ?? evt.lng ?? evt.lon
  const position = (lat != null && lng != null)
    ? { Latitude: Number(lat), Longitude: Number(lng) }
    : null

  return {
    ...evt,
    EventType: eventType,
    EventSeverity: eventSeverity,
    EventValue: value,
    Timestamp: ts,
    Position: position,
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '–'
  return dayjs(dateStr).format('DD.MM.YYYY HH:mm:ss')
}

function exportEvents() {
  const data = events.value.map(evt => ({
    time: formatDate(evt.Timestamp),
    type: getEventLabel(evt.EventType),
    value: evt.EventValue || '',
    severity: getSeverityLabel(evt.EventSeverity),
    lat: evt.Position?.Latitude?.toFixed(5) || '',
    lng: evt.Position?.Longitude?.toFixed(5) || '',
  }))

  exportCSV(data, `eco-driving_${selectedVehicle.value}_${dayjs().format('YYYY-MM-DD')}`, {
    time: t('eco.time'),
    type: t('eco.eventType'),
    value: t('eco.value'),
    severity: t('eco.severity'),
    lat: 'Latitude',
    lng: 'Longitude',
  })

  showToast(t('eco.exportCsv') + ' ✓', 'success')
}


async function loadEcoData() {
  if (!selectedVehicle.value) return
  loading.value = true
  loaded.value = false
  derivedEco.value = false
  try {
    const fromDate = dayjs(dateFrom.value).format('YYYY-MM-DDTHH:mm:ss')
    const toDate = dayjs(dateTo.value).format('YYYY-MM-DDTHH:mm:ss')

    const data = await fleetStore.fetchEcoDriving(
      selectedVehicle.value,
      fromDate,
      toDate
    )

    if (data?.Message || data?.message) {
      const msg = data.Message || data.message
      if (msg.includes('Timespan') || msg.includes('timespan')) {
        showToast(t('eco.timespanError'), 'warning', 5000)
      } else {
        handleApiError(new Error(msg), 'errors.ecoFailed', msg)
      }
      events.value = []
      return
    }

    const raw = extractEcoEvents(data)
    events.value = raw.map(normalizeEcoEvent).filter(Boolean)
    if (events.value.length === 0) {
      const fallbackOk = await tryEcoHistoryFallback(fromDate, toDate)
      if (fallbackOk) {
        showToast(t('eco.derivedNotice'), 'info', 4000)
      }
    }
  } catch (e) {
    const errorMessage = e?.response?.data?.Message || e?.message || ''
    if (errorMessage.includes('Timespan') || errorMessage.includes('timespan')) {
      showToast(t('eco.timespanError'), 'warning', 5000)
    } else {
      handleApiError(e, 'errors.ecoFailed', 'Failed to load eco driving data')
    }
    events.value = []
  } finally {
    loading.value = false
    loaded.value = true
  }
}

onMounted(() => {
  if (selectedVehicle.value) {
    loadEcoData()
  }
})
</script>
