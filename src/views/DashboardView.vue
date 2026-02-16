<template>
  <div class="space-y-6">
    <!-- Auto-refresh control -->
    <div class="flex items-center justify-end gap-2">
      <span class="text-xs text-gray-500 dark:text-gray-400">{{ t('refresh.autoRefresh') }}:</span>
      <select
        :value="refreshInterval"
        @change="setRefreshInterval(Number($event.target.value))"
        class="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-200"
      >
        <option :value="0">{{ t('refresh.off') }}</option>
        <option :value="30">30s</option>
        <option :value="60">1 min</option>
        <option :value="300">5 min</option>
      </select>
      <span v-if="refreshActive" class="text-xs text-blue-500">
        {{ t('refresh.nextRefresh', { n: refreshSecondsLeft }) }}
      </span>
    </div>

    <!-- Skeleton while loading -->
    <template v-if="initialLoading && fleetStore.vehicles.length === 0">
      <SkeletonLoader type="stats" :count="5" />
      <SkeletonLoader type="map" />
      <SkeletonLoader type="table" :count="5" />
    </template>

    <template v-else>
    <!-- Stats row -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        :label="t('dashboard.totalVehicles')"
        :value="fleetStore.vehicles.length"
        :subtitle="t('dashboard.inActiveGroup')"
        colorClass="bg-blue-50 text-blue-600"
      >
        <template #icon>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        </template>
      </StatCard>

      <StatCard
        :label="t('dashboard.moving')"
        :value="fleetStore.movingVehicles.length"
        :subtitle="t('dashboard.currentlyDriving')"
        colorClass="bg-green-50 text-green-600"
      >
        <template #icon>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </template>
      </StatCard>

      <StatCard
        :label="t('dashboard.stopped')"
        :value="fleetStore.stoppedVehicles.length"
        :subtitle="t('dashboard.speedZero')"
        colorClass="bg-amber-50 text-amber-600"
      >
        <template #icon>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </template>
      </StatCard>

      <StatCard
        :label="t('dashboard.maxSpeed')"
        :value="maxSpeed + ' km/h'"
        :subtitle="t('dashboard.currentMax')"
        colorClass="bg-red-50 text-red-600"
      >
        <template #icon>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </template>
      </StatCard>

      <!-- Weather card -->
      <StatCard
        :label="t('dashboard.weather')"
        :value="weatherInfo ? weatherInfo.icon + ' ' + weatherInfo.temperature + '°C' : '...'"
        :subtitle="weatherInfo ? weatherInfo.label : t('dashboard.loadingWeather')"
        colorClass="bg-cyan-50 text-cyan-600"
      >
        <template #icon>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        </template>
      </StatCard>
    </div>

    <!-- Weather detail banner -->
    <div v-if="weatherInfo" class="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-4 text-white flex items-center justify-between">
      <div class="flex items-center gap-4">
        <span class="text-4xl">{{ weatherInfo.icon }}</span>
        <div>
          <p class="text-lg font-semibold">{{ weatherInfo.label }}, {{ weatherInfo.temperature }}°C</p>
          <p class="text-sm text-white/80">{{ t('dashboard.wind') }}: {{ weatherInfo.windSpeed }} km/h · {{ t('dashboard.fleetArea') }}</p>
        </div>
      </div>
      <div class="text-right text-sm text-white/70">
        <p>Open-Meteo API</p>
        <p>{{ weatherInfo.isDay ? '🌞 ' + t('dashboard.day') : '🌙 ' + t('dashboard.night') }}</p>
      </div>
    </div>

    <!-- Charts row -->
    <div v-if="fleetStore.vehicles.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">{{ t('dashboard.fleetStatus') }}</h3>
        <div class="chart-container h-[240px] flex items-center justify-center">
          <Doughnut :data="fleetStatusChart" :options="doughnutOptions" />
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">{{ t('dashboard.speedOverview') }}</h3>
        <div class="chart-container h-[240px]">
          <Bar :data="speedBarChart" :options="barOptions" />
        </div>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('dashboard.filterLabel') }}</span>
        <button
          v-for="f in filters"
          :key="f.key"
          @click="activeFilter = f.key"
          :class="[
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            activeFilter === f.key
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          {{ f.label }} ({{ f.count }})
        </button>

        <div class="flex-1" />

        <div class="relative">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('dashboard.searchPlaceholder')"
            class="pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-56"
          />
        </div>
      </div>
    </div>

    <!-- Map -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="h-[500px]" ref="mapContainer">
        <l-map
          ref="map"
          :zoom="mapZoom"
          :center="mapCenter"
          :use-global-leaflet="false"
          class="h-full w-full"
        >
          <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            layer-type="base"
          />
          <l-marker
            v-for="v in filteredVehicles"
            :key="v.vehicleCode"
            :lat-lng="[v.latitude, v.longitude]"
          >
            <l-icon
              :icon-size="[32, 32]"
              :icon-anchor="[16, 16]"
              :icon-url="getMarkerIcon(v)"
            />
            <l-popup>
              <div class="min-w-[200px]">
                <p class="font-bold text-sm">{{ v.name || v.vehicleCode }}</p>
                <p v-if="v.licensePlate" class="text-xs text-gray-500">{{ v.licensePlate }}</p>

                <!-- Geocoded address -->
                <div v-if="addresses[v.vehicleCode]" class="mt-1.5 flex items-start gap-1">
                  <svg class="w-3 h-3 mt-0.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span class="text-xs text-blue-700 font-medium">{{ addresses[v.vehicleCode] }}</span>
                </div>

                <!-- Weather at vehicle location -->
                <div v-if="vehicleWeather[v.vehicleCode]" class="mt-1.5 flex items-center gap-1.5 bg-cyan-50 rounded px-1.5 py-0.5">
                  <span class="text-sm">{{ vehicleWeather[v.vehicleCode].icon }}</span>
                  <span class="text-xs text-cyan-800 font-medium">
                    {{ vehicleWeather[v.vehicleCode].temperature }}°C · {{ vehicleWeather[v.vehicleCode].label }}
                  </span>
                </div>

                <div class="mt-2 space-y-1 text-xs">
                  <p><span class="text-gray-500">{{ t('dashboard.speed') }}:</span> <strong>{{ v.speed }} km/h</strong></p>
                  <p><span class="text-gray-500">{{ t('dashboard.position') }}:</span> {{ v.latitude?.toFixed(5) }}, {{ v.longitude?.toFixed(5) }}</p>
                  <p v-if="v.lastResponseTime"><span class="text-gray-500">{{ t('dashboard.lastResponse') }}:</span> {{ formatDate(v.lastResponseTime) }}</p>
                </div>
                <div class="mt-2 flex gap-1">
                  <router-link :to="`/vehicles/${v.vehicleCode}`" class="text-xs text-blue-600 hover:underline font-medium">Detail</router-link>
                  <span class="text-gray-300">|</span>
                  <router-link :to="`/trips/${v.vehicleCode}`" class="text-xs text-blue-600 hover:underline">{{ t('vehicles.trips') }}</router-link>
                  <span class="text-gray-300">|</span>
                  <router-link :to="`/sensors/${v.vehicleCode}`" class="text-xs text-blue-600 hover:underline">{{ t('vehicles.sensors') }}</router-link>
                </div>
              </div>
            </l-popup>
          </l-marker>
        </l-map>
      </div>
    </div>

    <!-- Vehicles mini table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 class="font-semibold text-gray-900 dark:text-white">{{ t('dashboard.vehicleOverview') }}</h3>
        <span v-if="geocodingProgress" class="text-xs text-gray-400">
          📍 {{ geocodingProgress }}
        </span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th class="px-5 py-3">{{ t('dashboard.vehicle') }}</th>
              <th class="px-5 py-3">{{ t('dashboard.licensePlate') }}</th>
              <th class="px-5 py-3">{{ t('dashboard.location') }}</th>
              <th class="px-5 py-3">{{ t('dashboard.weatherCol') }}</th>
              <th class="px-5 py-3">{{ t('dashboard.speed') }}</th>
              <th class="px-5 py-3">{{ t('dashboard.status') }}</th>
              <th class="px-5 py-3">{{ t('dashboard.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr
              v-for="v in filteredVehicles"
              :key="v.vehicleCode"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <td class="px-5 py-3">
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{{ v.name || v.vehicleCode }}</p>
                  <p class="text-xs text-gray-400">{{ formatDate(v.lastResponseTime) }}</p>
                </div>
              </td>
              <td class="px-5 py-3 text-gray-600 dark:text-gray-300">{{ v.licensePlate || '–' }}</td>
              <td class="px-5 py-3">
                <div v-if="addresses[v.vehicleCode]" class="flex items-start gap-1">
                  <svg class="w-3.5 h-3.5 mt-0.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span class="text-xs text-gray-700 dark:text-gray-300">{{ addresses[v.vehicleCode] }}</span>
                </div>
                <span v-else class="text-xs text-gray-400">
                  {{ v.latitude?.toFixed(4) }}, {{ v.longitude?.toFixed(4) }}
                </span>
              </td>
              <td class="px-5 py-3">
                <div v-if="vehicleWeather[v.vehicleCode]" class="flex items-center gap-1">
                  <span>{{ vehicleWeather[v.vehicleCode].icon }}</span>
                  <span class="text-xs font-medium dark:text-gray-200">{{ vehicleWeather[v.vehicleCode].temperature }}°C</span>
                </div>
                <span v-else class="text-xs text-gray-300">–</span>
              </td>
              <td class="px-5 py-3">
                <span :class="v.speed > 0 ? 'text-green-600 font-semibold' : 'text-gray-400'">
                  {{ v.speed }} km/h
                </span>
              </td>
              <td class="px-5 py-3">
                <span :class="[
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  v.speed > 0
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                ]">
                  {{ v.speed > 0 ? t('dashboard.driving') : t('dashboard.parked') }}
                </span>
              </td>
              <td class="px-5 py-3">
                <div class="flex gap-2">
                  <router-link :to="`/vehicles/${v.vehicleCode}`" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-xs font-medium">Detail</router-link>
                  <router-link :to="`/trips/${v.vehicleCode}`" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-xs font-medium">{{ t('vehicles.trips') }}</router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- External API info panel -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-3">{{ t('dashboard.externalApis') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div class="flex items-start gap-3 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
          <span class="text-2xl">🌤️</span>
          <div>
            <p class="text-sm font-semibold text-cyan-900 dark:text-cyan-300">Open-Meteo</p>
            <p class="text-xs text-cyan-700 dark:text-cyan-400">{{ t('dashboard.openMeteoDesc') }}</p>
          </div>
        </div>
        <div class="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <span class="text-2xl">📍</span>
          <div>
            <p class="text-sm font-semibold text-blue-900 dark:text-blue-300">Nominatim</p>
            <p class="text-xs text-blue-700 dark:text-blue-400">{{ t('dashboard.nominatimDesc') }}</p>
          </div>
        </div>
        <div class="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <span class="text-2xl">🛣️</span>
          <div>
            <p class="text-sm font-semibold text-indigo-900 dark:text-indigo-300">OSRM</p>
            <p class="text-xs text-indigo-700 dark:text-indigo-400">{{ t('dashboard.osrmDesc') }}</p>
          </div>
        </div>
        <div class="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <span class="text-2xl">⛽</span>
          <div>
            <p class="text-sm font-semibold text-green-900 dark:text-green-300">Overpass API</p>
            <p class="text-xs text-green-700 dark:text-green-400">{{ t('dashboard.overpassDesc') }}</p>
          </div>
        </div>
        <div class="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <span class="text-2xl">⛰️</span>
          <div>
            <p class="text-sm font-semibold text-purple-900 dark:text-purple-300">Open-Elevation</p>
            <p class="text-xs text-purple-700 dark:text-purple-400">{{ t('dashboard.elevationDesc') }}</p>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { LMap, LTileLayer, LMarker, LPopup, LIcon } from '@vue-leaflet/vue-leaflet'
import { Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale,
  Title, Tooltip, Legend,
} from 'chart.js'
import { useFleetStore } from '../stores/fleet'
import { getWeather, getWeatherBatch } from '../api/weather'
import { reverseGeocode } from '../api/geocoding'
import { useAutoRefresh } from '../composables/useAutoRefresh'
import { useChartTheme } from '../composables/useChartTheme'
import { useApiError } from '../composables/useApiError'
import StatCard from '../components/StatCard.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import dayjs from 'dayjs'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend)

const { t, locale } = useI18n()
const fleetStore = useFleetStore()
const { handleApiError } = useApiError()

const searchQuery = ref('')
const activeFilter = ref('all')
const mapZoom = ref(7)
const mapCenter = ref([49.8, 15.5])
const initialLoading = ref(true)

// External API data
const weatherInfo = ref(null)
const vehicleWeather = reactive({})
const addresses = reactive({})
const geocodingProgress = ref('')

// ── Auto-refresh ──────────────────────────────
async function refreshDashboard() {
  if (fleetStore.activeGroupCode) {
    await fleetStore.fetchVehicles(fleetStore.activeGroupCode)
  }
}

const {
  intervalSeconds: refreshInterval,
  secondsLeft: refreshSecondsLeft,
  isActive: refreshActive,
  setInterval: setRefreshInterval,
} = useAutoRefresh(refreshDashboard)

// ── Computed ──────────────────────────────────
const maxSpeed = computed(() => {
  if (fleetStore.vehicles.length === 0) return 0
  return Math.max(...fleetStore.vehicles.map(v => v.speed || 0))
})

const filters = computed(() => [
  { key: 'all', label: t('dashboard.allVehicles'), count: fleetStore.vehicles.length },
  { key: 'moving', label: t('dashboard.movingFilter'), count: fleetStore.movingVehicles.length },
  { key: 'stopped', label: t('dashboard.stoppedFilter'), count: fleetStore.stoppedVehicles.length },
])

const filteredVehicles = computed(() => {
  let list = fleetStore.vehicles

  if (activeFilter.value === 'moving') {
    list = list.filter(v => v.speed > 0)
  } else if (activeFilter.value === 'stopped') {
    list = list.filter(v => v.speed === 0)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(v =>
      (v.name || '').toLowerCase().includes(q) ||
      (v.licensePlate || '').toLowerCase().includes(q) ||
      (v.vehicleCode || '').toLowerCase().includes(q)
    )
  }

  return list
})

// ── Charts ────────────────────────────────────
const fleetStatusChart = computed(() => ({
  labels: [t('dashboard.moving'), t('dashboard.stopped')],
  datasets: [{
    data: [fleetStore.movingVehicles.length, fleetStore.stoppedVehicles.length],
    backgroundColor: ['#22c55e', '#9ca3af'],
    borderWidth: 0,
  }],
}))

const { buildOptions } = useChartTheme()

const doughnutOptions = computed(() => buildOptions({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { padding: 16 } },
  },
  scales: {},
}))

const speedBarChart = computed(() => {
  const sorted = [...fleetStore.vehicles]
    .sort((a, b) => (b.speed || 0) - (a.speed || 0))
    .slice(0, 12)

  return {
    labels: sorted.map(v => v.name || v.licensePlate || v.vehicleCode),
    datasets: [{
      label: 'km/h',
      data: sorted.map(v => v.speed || 0),
      backgroundColor: sorted.map(v =>
        v.speed > 100 ? '#ef4444' : v.speed > 0 ? '#3b82f6' : '#d1d5db'
      ),
      borderRadius: 4,
    }],
  }
})

const barOptions = computed(() => buildOptions({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: { legend: { display: false } },
  scales: {
    x: { beginAtZero: true, title: { display: true, text: 'km/h' } },
    y: { ticks: { font: { size: 10 } } },
  },
}))

// ── Helpers ───────────────────────────────────
function getMarkerIcon(vehicle) {
  const color = vehicle.speed > 0 ? '%2322c55e' : '%236b7280'
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="${decodeURIComponent(color)}" stroke="white" stroke-width="3"/><circle cx="16" cy="16" r="4" fill="white"/></svg>`)}`
}

function formatDate(dateStr) {
  if (!dateStr) return '–'
  return dayjs(dateStr).format('DD.MM.YYYY HH:mm')
}

// ── External API: Weather ──────────────────────
async function loadWeather(vehicles) {
  if (vehicles.length === 0) return
  const validVehicles = vehicles.filter(v => v.latitude && v.longitude)
  if (validVehicles.length === 0) return

  const avgLat = validVehicles.reduce((s, v) => s + v.latitude, 0) / validVehicles.length
  const avgLng = validVehicles.reduce((s, v) => s + v.longitude, 0) / validVehicles.length

  try {
    weatherInfo.value = await getWeather(avgLat, avgLng, locale.value)
  } catch (e) {
    handleApiError(e, 'errors.weatherFailed', 'Failed to load fleet weather')
  }

  try {
    const locations = validVehicles.map(v => ({ latitude: v.latitude, longitude: v.longitude }))
    const results = await getWeatherBatch(locations, locale.value)
    results.forEach((w, i) => {
      if (w) vehicleWeather[validVehicles[i].vehicleCode] = w
    })
  } catch (e) {
    console.warn('Failed to load vehicle weather batch:', e)
  }
}

// ── External API: Geocoding ────────────────────
async function loadAddresses(vehicles) {
  const validVehicles = vehicles.filter(v => v.latitude && v.longitude)
  if (validVehicles.length === 0) return

  geocodingProgress.value = t('dashboard.geocodingProgress', { current: 0, total: validVehicles.length })

  for (let i = 0; i < validVehicles.length; i++) {
    const v = validVehicles[i]
    if (addresses[v.vehicleCode]) continue

    try {
      const result = await reverseGeocode(v.latitude, v.longitude)
      if (result) {
        addresses[v.vehicleCode] = result.short
      }
    } catch (e) {
      console.warn(`Geocode failed for ${v.vehicleCode}:`, e)
    }

    geocodingProgress.value = t('dashboard.geocodingProgress', { current: i + 1, total: validVehicles.length })

    if (i < validVehicles.length - 1) {
      await new Promise(r => setTimeout(r, 1100))
    }
  }

  geocodingProgress.value = ''
}

// Auto-center map on vehicles
watch(() => filteredVehicles.value, (veh) => {
  if (veh.length > 0) {
    const validVehicles = veh.filter(v => v.latitude && v.longitude)
    if (validVehicles.length > 0) {
      const avgLat = validVehicles.reduce((s, v) => s + v.latitude, 0) / validVehicles.length
      const avgLng = validVehicles.reduce((s, v) => s + v.longitude, 0) / validVehicles.length
      mapCenter.value = [avgLat, avgLng]
    }
  }
}, { immediate: true })

// Load external data when vehicles change
watch(() => fleetStore.vehicles, async (vehicles) => {
  if (vehicles.length > 0) {
    initialLoading.value = false
    loadWeather(vehicles)
    loadAddresses(vehicles)
  }
}, { immediate: true })

// Reload weather when locale changes
watch(locale, () => {
  if (fleetStore.vehicles.length > 0) {
    loadWeather(fleetStore.vehicles)
  }
})
</script>
