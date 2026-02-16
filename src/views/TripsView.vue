<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('trips.title') }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ t('trips.subtitle') }}</p>
      </div>
      <button
        v-if="trips.length > 0"
        @click="exportTrips"
        class="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {{ t('trips.exportCsv') }}
      </button>
    </div>

    <!-- Selector -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <VehicleSelector
        v-model="selectedVehicle"
        v-model:from="dateFrom"
        v-model:to="dateTo"
        :loading="loading"
        @load="loadTrips"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <SkeletonLoader type="stats" :count="4" />
      <SkeletonLoader type="map" />
      <SkeletonLoader type="table" :count="6" />
    </div>

    <template v-if="!loading && trips.length > 0">
      <!-- Trip stats summary -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard :label="t('trips.tripCount')" :value="trips.length" colorClass="bg-blue-50 text-blue-600">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </template>
        </StatCard>
        <StatCard :label="t('trips.totalDistance')" :value="totalDistance + ' km'" colorClass="bg-green-50 text-green-600">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </template>
        </StatCard>
        <StatCard :label="t('trips.avgSpeed')" :value="avgSpeed + ' km/h'" colorClass="bg-amber-50 text-amber-600">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </StatCard>
        <StatCard :label="t('trips.maxSpeed')" :value="maxTripSpeed + ' km/h'" colorClass="bg-red-50 text-red-600">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </template>
        </StatCard>
      </div>

      <!-- Route comparison panel -->
      <div v-if="selectedTrip && routeComparison" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">
            🛣️ {{ t('trips.routeComparison', { index: selectedTripIndex + 1 }) }}
          </h3>
          <span class="text-xs text-gray-400">{{ t('trips.poweredBy') }}</span>
        </div>
        <div class="p-5">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
              <p class="text-xs text-blue-600 dark:text-blue-400 font-medium">{{ t('trips.actualDistance') }}</p>
              <p class="text-xl font-bold text-blue-900 dark:text-blue-200 mt-1">{{ (selectedTrip.TotalDistance || 0).toFixed(1) }} km</p>
              <p class="text-xs text-blue-500 dark:text-blue-400">{{ t('trips.gpsData') }}</p>
            </div>
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
              <p class="text-xs text-green-600 dark:text-green-400 font-medium">{{ t('trips.optimalDistance') }}</p>
              <p class="text-xl font-bold text-green-900 dark:text-green-200 mt-1">{{ routeComparison.optimalDistanceKm }} km</p>
              <p class="text-xs text-green-500 dark:text-green-400">{{ t('trips.osrmRouting') }}</p>
            </div>
            <div class="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
              <p class="text-xs text-amber-600 dark:text-amber-400 font-medium">{{ t('trips.difference') }}</p>
              <p class="text-xl font-bold text-amber-900 dark:text-amber-200 mt-1">+{{ routeComparison.difference }} km</p>
              <p class="text-xs text-amber-500 dark:text-amber-400">{{ t('trips.extraVsOptimal') }}</p>
            </div>
            <div :class="[
              'rounded-lg p-3 text-center',
              routeComparison.rating === 'excellent' ? 'bg-green-50 dark:bg-green-900/20' :
              routeComparison.rating === 'good' ? 'bg-lime-50 dark:bg-lime-900/20' :
              routeComparison.rating === 'fair' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20'
            ]">
              <p :class="[
                'text-xs font-medium',
                routeComparison.rating === 'excellent' ? 'text-green-600' :
                routeComparison.rating === 'good' ? 'text-lime-600' :
                routeComparison.rating === 'fair' ? 'text-amber-600' : 'text-red-600'
              ]">{{ t('trips.routeEfficiency') }}</p>
              <p :class="[
                'text-xl font-bold mt-1',
                routeComparison.rating === 'excellent' ? 'text-green-900 dark:text-green-200' :
                routeComparison.rating === 'good' ? 'text-lime-900 dark:text-lime-200' :
                routeComparison.rating === 'fair' ? 'text-amber-900 dark:text-amber-200' : 'text-red-900 dark:text-red-200'
              ]">{{ routeComparison.efficiency }}%</p>
              <p :class="[
                'text-xs',
                routeComparison.rating === 'excellent' ? 'text-green-500' :
                routeComparison.rating === 'good' ? 'text-lime-500' :
                routeComparison.rating === 'fair' ? 'text-amber-500' : 'text-red-500'
              ]">
                {{ t('trips.' + routeComparison.rating) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-sm">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-gray-600 dark:text-gray-300">
              {{ t('trips.estimatedTime') }}
              <strong class="text-gray-900 dark:text-white">{{ routeComparison.etaMinutes }} min</strong>
            </span>
            <span class="text-gray-400 mx-2">·</span>
            <span class="text-gray-600 dark:text-gray-300">
              {{ t('trips.actualTime') }}
              <strong class="text-gray-900 dark:text-white">{{ selectedTrip.TripLength || '–' }}</strong>
            </span>
          </div>

          <div class="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
            <span class="flex items-center gap-1.5">
              <span class="w-4 h-0.5 bg-blue-500 inline-block rounded"></span>
              {{ t('trips.actualRoute') }}
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-4 h-0.5 bg-green-500 inline-block rounded" style="border-bottom: 2px dashed #22c55e"></span>
              {{ t('trips.optimalRoute') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Map with route -->
      <div v-if="routePoints.length > 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="h-[450px]">
          <l-map
            :zoom="10"
            :center="routeCenter"
            :use-global-leaflet="false"
            class="h-full w-full"
          >
            <l-tile-layer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <l-polyline
              v-if="optimalRoutePoints.length > 1"
              :lat-lngs="optimalRoutePoints"
              :color="'#22c55e'"
              :weight="4"
              :dash-array="'10, 8'"
              :opacity="0.7"
            />
            <l-polyline
              v-if="routePoints.length > 1"
              :lat-lngs="routePoints"
              :color="'#3b82f6'"
              :weight="3"
            />
            <l-marker v-if="routePoints.length > 0" :lat-lng="routePoints[0]">
              <l-popup>
                <div class="text-sm">
                  <p class="font-bold text-green-700">🟢 {{ t('trips.start') }}</p>
                  <p v-if="tripStartAddress" class="text-xs text-gray-600 mt-1">{{ tripStartAddress }}</p>
                </div>
              </l-popup>
            </l-marker>
            <l-marker v-if="routePoints.length > 1" :lat-lng="routePoints[routePoints.length - 1]">
              <l-popup>
                <div class="text-sm">
                  <p class="font-bold text-red-700">🔴 {{ t('trips.destination') }}</p>
                  <p v-if="tripEndAddress" class="text-xs text-gray-600 mt-1">{{ tripEndAddress }}</p>
                </div>
              </l-popup>
            </l-marker>
          </l-map>
        </div>
      </div>

      <!-- Speed profile chart -->
      <div v-if="selectedTrip && speedProfileData.labels.length > 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">{{ t('trips.speedProfile') }}</h3>
        <div class="chart-container h-[250px]">
          <Line :data="speedProfileData" :options="speedProfileOptions" />
        </div>
      </div>

      <!-- Elevation profile chart -->
      <div v-if="selectedTrip && elevationData.labels.length > 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900 dark:text-white">⛰️ {{ t('trips.elevationProfile') }}</h3>
          <div v-if="elevationStats" class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>↑ {{ elevationStats.totalAscent }} m</span>
            <span>↓ {{ elevationStats.totalDescent }} m</span>
            <span>{{ t('trips.elevationMin') }}: {{ elevationStats.min }} m</span>
            <span>{{ t('trips.elevationMax') }}: {{ elevationStats.max }} m</span>
          </div>
        </div>
        <div class="chart-container h-[200px]">
          <Line :data="elevationData" :options="elevationChartOptions" />
        </div>
      </div>
      <div v-if="selectedTrip && elevationLoading" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-2 text-sm text-gray-400">
          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          {{ t('trips.loadingElevation') }}
        </div>
      </div>

      <!-- Trips table -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">{{ t('trips.tripList') }}</h3>
          <p class="text-xs text-gray-400">{{ t('trips.clickToShow') }}</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th class="px-5 py-3">{{ t('trips.headerNum') }}</th>
                <th class="px-5 py-3">{{ t('trips.headerStart') }}</th>
                <th class="px-5 py-3">{{ t('trips.headerEnd') }}</th>
                <th class="px-5 py-3">{{ t('trips.headerDistance') }}</th>
                <th class="px-5 py-3">{{ t('trips.headerAvgSpeed') }}</th>
                <th class="px-5 py-3">{{ t('trips.headerMaxSpeed') }}</th>
                <th class="px-5 py-3">{{ t('trips.headerDuration') }}</th>
                <th class="px-5 py-3">{{ t('trips.headerDriver') }}</th>
                <th class="px-5 py-3">{{ t('trips.headerEfficiency') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr
                v-for="(trip, idx) in trips"
                :key="trip.Id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                :class="selectedTrip?.Id === trip.Id ? 'bg-blue-50 dark:bg-blue-900/20' : ''"
                @click="showTripOnMap(trip, idx)"
              >
                <td class="px-5 py-3 text-gray-500 dark:text-gray-400">{{ idx + 1 }}</td>
                <td class="px-5 py-3">
                  <div>
                    <p class="font-medium dark:text-gray-200">{{ formatDate(trip.StartTime) }}</p>
                    <p class="text-xs text-gray-400">{{ trip.StartAddress || '–' }}</p>
                  </div>
                </td>
                <td class="px-5 py-3">
                  <div>
                    <p class="font-medium dark:text-gray-200">{{ formatDate(trip.FinishTime) }}</p>
                    <p class="text-xs text-gray-400">{{ trip.FinishAddress || '–' }}</p>
                  </div>
                </td>
                <td class="px-5 py-3 font-medium dark:text-gray-200">{{ (trip.TotalDistance || 0).toFixed(1) }} km</td>
                <td class="px-5 py-3 dark:text-gray-300">{{ Math.round(trip.AverageSpeed || 0) }} km/h</td>
                <td class="px-5 py-3">
                  <span :class="(trip.MaxSpeed || 0) > 130 ? 'text-red-600 font-semibold' : 'dark:text-gray-300'">
                    {{ Math.round(trip.MaxSpeed || 0) }} km/h
                  </span>
                </td>
                <td class="px-5 py-3 text-gray-600 dark:text-gray-300">{{ trip.TripLength || '–' }}</td>
                <td class="px-5 py-3 text-gray-600 dark:text-gray-300">{{ trip.DriverName || t('trips.unknownDriver') }}</td>
                <td class="px-5 py-3">
                  <span v-if="tripEfficiency[trip.Id]" :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    tripEfficiency[trip.Id].rating === 'excellent' ? 'bg-green-100 text-green-700' :
                    tripEfficiency[trip.Id].rating === 'good' ? 'bg-lime-100 text-lime-700' :
                    tripEfficiency[trip.Id].rating === 'fair' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  ]">
                    {{ tripEfficiency[trip.Id].efficiency }}%
                  </span>
                  <span v-else class="text-xs text-gray-300 dark:text-gray-600">–</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Distance chart -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">{{ t('trips.distanceChart') }}</h3>
        <div class="chart-container h-[300px]">
          <Bar :data="distanceChartData" :options="chartOptions" />
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <div v-if="!loading && loaded && trips.length === 0" class="text-center py-16 text-gray-400 dark:text-gray-500">
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
      <p>{{ t('trips.noTrips') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import {
  LMap, LTileLayer, LMarker, LPopup, LPolyline,
} from '@vue-leaflet/vue-leaflet'
import { Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { useFleetStore } from '../stores/fleet'
import { getRoute, compareRoutes } from '../api/routing'
import { reverseGeocode } from '../api/geocoding'
import { getElevationProfile, getElevationStats } from '../api/elevation'
import { useExport } from '../composables/useExport'
import { useChartTheme } from '../composables/useChartTheme'
import { useToast } from '../composables/useToast'
import { useApiError } from '../composables/useApiError'
import VehicleSelector from '../components/VehicleSelector.vue'
import StatCard from '../components/StatCard.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import dayjs from 'dayjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const { t } = useI18n()
const route = useRoute()
const fleetStore = useFleetStore()
const { exportCSV } = useExport()
const { showToast } = useToast()
const { handleApiError } = useApiError()
const { buildOptions } = useChartTheme()

const selectedVehicle = ref(route.params.vehicleCode || '')
const dateFrom = ref(dayjs().subtract(7, 'day').format('YYYY-MM-DDTHH:mm'))
const dateTo = ref(dayjs().format('YYYY-MM-DDTHH:mm'))
const trips = ref([])
const routePoints = ref([])
const optimalRoutePoints = ref([])
const loading = ref(false)
const loaded = ref(false)
const selectedTrip = ref(null)
const selectedTripIndex = ref(0)
const routeComparison = ref(null)
const tripEfficiency = reactive({})
const tripStartAddress = ref('')
const tripEndAddress = ref('')
const tripSpeedHistory = ref([])
const elevationProfile = ref([])
const elevationStats = ref(null)
const elevationLoading = ref(false)

const totalDistance = computed(() => {
  const d = trips.value.reduce((sum, t) => sum + (t.TotalDistance || 0), 0)
  return d.toFixed(1)
})

const avgSpeed = computed(() => {
  if (trips.value.length === 0) return 0
  const avg = trips.value.reduce((s, t) => s + (t.AverageSpeed || 0), 0) / trips.value.length
  return Math.round(avg)
})

const maxTripSpeed = computed(() => {
  if (trips.value.length === 0) return 0
  return Math.round(Math.max(...trips.value.map(t => t.MaxSpeed || 0)))
})

const routeCenter = computed(() => {
  if (routePoints.value.length === 0) return [49.8, 15.5]
  const lats = routePoints.value.map(p => p[0])
  const lngs = routePoints.value.map(p => p[1])
  return [
    (Math.min(...lats) + Math.max(...lats)) / 2,
    (Math.min(...lngs) + Math.max(...lngs)) / 2,
  ]
})

const distanceChartData = computed(() => ({
  labels: trips.value.map((_, i) => `${t('trips.headerNum')}${i + 1}`),
  datasets: [{
    label: t('trips.distanceLabel'),
    data: trips.value.map(t => (t.TotalDistance || 0).toFixed(1)),
    backgroundColor: '#3b82f6',
    borderRadius: 6,
  }]
}))

const chartOptions = computed(() => buildOptions({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {},
    y: { beginAtZero: true, title: { display: true, text: 'km' } },
  },
}))

const speedProfileData = computed(() => {
  if (tripSpeedHistory.value.length === 0) {
    return { labels: [], datasets: [] }
  }
  const data = tripSpeedHistory.value
  const sampled = data.length > 300 ? data.filter((_, i) => i % Math.ceil(data.length / 300) === 0) : data
  return {
    labels: sampled.map(p => dayjs(p.time).format('HH:mm')),
    datasets: [{
      label: t('trips.speedLabel'),
      data: sampled.map(p => p.speed),
      borderColor: '#3b82f6',
      backgroundColor: '#3b82f620',
      borderWidth: 2,
      pointRadius: 0,
      fill: true,
      tension: 0.3,
    }]
  }
})

const speedProfileOptions = computed(() => buildOptions({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  interaction: { mode: 'index', intersect: false },
  scales: {
    x: { ticks: { maxTicksLimit: 20 } },
    y: { beginAtZero: true, title: { display: true, text: 'km/h' } },
  },
}))

const elevationData = computed(() => {
  if (elevationProfile.value.length === 0) return { labels: [], datasets: [] }
  const data = elevationProfile.value
  return {
    labels: data.map(p => (p.distanceFromStart / 1000).toFixed(1) + ' km'),
    datasets: [{
      label: t('trips.elevationLabel'),
      data: data.map(p => p.elevation),
      borderColor: '#8b5cf6',
      backgroundColor: '#8b5cf620',
      borderWidth: 2,
      pointRadius: 0,
      fill: true,
      tension: 0.3,
    }]
  }
})

const elevationChartOptions = computed(() => buildOptions({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  interaction: { mode: 'index', intersect: false },
  scales: {
    x: { ticks: { maxTicksLimit: 15 }, title: { display: true, text: t('trips.distance') || 'km' } },
    y: { title: { display: true, text: 'm n.m.' } },
  },
}))

function exportTrips() {
  const data = trips.value.map((trip, i) => ({
    num: i + 1,
    start: formatDate(trip.StartTime),
    end: formatDate(trip.FinishTime),
    startAddress: trip.StartAddress || '',
    endAddress: trip.FinishAddress || '',
    distance: (trip.TotalDistance || 0).toFixed(1),
    avgSpeed: Math.round(trip.AverageSpeed || 0),
    maxSpeed: Math.round(trip.MaxSpeed || 0),
    duration: trip.TripLength || '',
    driver: trip.DriverName || '',
    efficiency: tripEfficiency[trip.Id]?.efficiency ? tripEfficiency[trip.Id].efficiency + '%' : '',
  }))

  exportCSV(data, `trips_${selectedVehicle.value}_${dayjs().format('YYYY-MM-DD')}`, {
    num: '#',
    start: t('trips.headerStart'),
    end: t('trips.headerEnd'),
    startAddress: t('trips.start') + ' - ' + t('dashboard.address'),
    endAddress: t('trips.destination') + ' - ' + t('dashboard.address'),
    distance: t('trips.headerDistance') + ' (km)',
    avgSpeed: t('trips.headerAvgSpeed') + ' (km/h)',
    maxSpeed: t('trips.headerMaxSpeed') + ' (km/h)',
    duration: t('trips.headerDuration'),
    driver: t('trips.headerDriver'),
    efficiency: t('trips.headerEfficiency'),
  })

  showToast(t('trips.exportCsv') + ' ✓', 'success')
}

async function loadTrips() {
  if (!selectedVehicle.value) return
  loading.value = true
  loaded.value = false
  routePoints.value = []
  optimalRoutePoints.value = []
  selectedTrip.value = null
  routeComparison.value = null
  tripStartAddress.value = ''
  tripEndAddress.value = ''
  tripSpeedHistory.value = []

  try {
    const data = await fleetStore.fetchTrips(
      selectedVehicle.value,
      dateFrom.value,
      dateTo.value
    )
    trips.value = Array.isArray(data) ? data : []

    if (trips.value.length > 0) {
      const points = []
      for (const trip of trips.value) {
        if (trip.StartPosition) {
          const lat = parseFloat(trip.StartPosition.Latitude)
          const lng = parseFloat(trip.StartPosition.Longitude)
          if (lat && lng) points.push([lat, lng])
        }
        if (trip.FinishPosition) {
          const lat = parseFloat(trip.FinishPosition.Latitude)
          const lng = parseFloat(trip.FinishPosition.Longitude)
          if (lat && lng) points.push([lat, lng])
        }
      }
      routePoints.value = points
      calculateAllEfficiencies()
    }
  } catch (e) {
    handleApiError(e, 'errors.tripsFailed', 'Failed to load trips')
    trips.value = []
  } finally {
    loading.value = false
    loaded.value = true
  }
}

async function calculateAllEfficiencies() {
  for (const trip of trips.value) {
    if (!trip.StartPosition || !trip.FinishPosition || !trip.TotalDistance) continue

    const startLat = parseFloat(trip.StartPosition.Latitude)
    const startLng = parseFloat(trip.StartPosition.Longitude)
    const endLat = parseFloat(trip.FinishPosition.Latitude)
    const endLng = parseFloat(trip.FinishPosition.Longitude)

    if (!startLat || !startLng || !endLat || !endLng) continue

    try {
      const osrmRoute = await getRoute([startLat, startLng], [endLat, endLng])
      const comparison = compareRoutes(trip.TotalDistance, parseFloat(osrmRoute.distanceKm))
      tripEfficiency[trip.Id] = {
        ...comparison,
        optimalDistanceKm: osrmRoute.distanceKm,
        etaMinutes: osrmRoute.durationMin,
      }
    } catch (e) {
      console.warn(`OSRM failed for trip ${trip.Id}:`, e.message)
    }

    await new Promise(r => setTimeout(r, 1000))
  }
}

async function showTripOnMap(trip, idx) {
  selectedTrip.value = trip
  selectedTripIndex.value = idx
  optimalRoutePoints.value = []
  routeComparison.value = null
  tripStartAddress.value = ''
  tripEndAddress.value = ''
  tripSpeedHistory.value = []
  elevationProfile.value = []
  elevationStats.value = null
  elevationLoading.value = false

  const startLat = parseFloat(trip.StartPosition?.Latitude)
  const startLng = parseFloat(trip.StartPosition?.Longitude)
  const endLat = parseFloat(trip.FinishPosition?.Latitude)
  const endLng = parseFloat(trip.FinishPosition?.Longitude)

  try {
    const history = await fleetStore.fetchHistory(
      selectedVehicle.value,
      trip.StartTime,
      trip.FinishTime
    )
    if (Array.isArray(history) && history.length > 0) {
      routePoints.value = history
        .filter(p => p.Lat && p.Lng)
        .map(p => [parseFloat(p.Lat), parseFloat(p.Lng)])

      tripSpeedHistory.value = history
        .filter(p => p.Timestamp && p.Speed != null)
        .map(p => ({
          time: p.Timestamp,
          speed: p.Speed ?? 0,
        }))
    }
  } catch (e) {
    console.warn('Could not load trip route history', e)
  }

  if (startLat && startLng && endLat && endLng) {
    try {
      const osrmRoute = await getRoute([startLat, startLng], [endLat, endLng])
      optimalRoutePoints.value = osrmRoute.geometry

      const comparison = compareRoutes(trip.TotalDistance || 0, parseFloat(osrmRoute.distanceKm))
      routeComparison.value = {
        ...comparison,
        optimalDistanceKm: osrmRoute.distanceKm,
        etaMinutes: osrmRoute.durationMin,
      }
    } catch (e) {
      console.warn('OSRM route failed:', e)
    }

    try {
      const [startAddr, endAddr] = await Promise.all([
        reverseGeocode(startLat, startLng),
        reverseGeocode(endLat, endLng),
      ])
      if (startAddr) tripStartAddress.value = startAddr.short
      if (endAddr) tripEndAddress.value = endAddr.short
    } catch (e) {
      console.warn('Geocode failed:', e)
    }
  }

  // Load elevation profile for the route
  if (routePoints.value.length >= 2) {
    elevationLoading.value = true
    try {
      const profile = await getElevationProfile(routePoints.value, 80)
      elevationProfile.value = profile
      elevationStats.value = getElevationStats(profile)
    } catch (e) {
      console.warn('Elevation profile failed:', e)
    } finally {
      elevationLoading.value = false
    }
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '–'
  return dayjs(dateStr).format('DD.MM.YYYY HH:mm')
}

onMounted(() => {
  if (selectedVehicle.value) {
    loadTrips()
  }
})
</script>
