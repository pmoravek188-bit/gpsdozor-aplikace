<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('vehicles.title') }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ t('vehicles.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-3">
        <select v-model="sortBy" class="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200">
          <option value="name">{{ t('vehicles.sortByName') }}</option>
          <option value="speed">{{ t('vehicles.sortBySpeed') }}</option>
          <option value="licensePlate">{{ t('vehicles.sortByPlate') }}</option>
        </select>
      </div>
    </div>

    <!-- Search -->
    <div class="relative">
      <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        v-model="search"
        type="text"
        :placeholder="t('vehicles.searchPlaceholder')"
        class="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <!-- Skeleton loading -->
    <SkeletonLoader v-if="fleetStore.loading && fleetStore.vehicles.length === 0" type="cards" :count="6" />

    <!-- Vehicle cards grid -->
    <TransitionGroup v-else name="list" tag="div" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="v in sortedVehicles"
        :key="v.vehicleCode"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div>
            <router-link :to="`/vehicles/${v.vehicleCode}`" class="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {{ v.name || v.vehicleCode }}
            </router-link>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ v.vehicleCode }}</p>
          </div>
          <span :class="[
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            v.speed > 0
              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          ]">
            {{ v.speed > 0 ? t('vehicles.driving') : t('vehicles.parked') }}
          </span>
        </div>

        <!-- Address from Nominatim -->
        <div v-if="addresses[v.vehicleCode]" class="mt-2 flex items-start gap-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-2.5 py-1.5">
          <svg class="w-3.5 h-3.5 mt-0.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span class="text-xs text-blue-800 dark:text-blue-300 font-medium">{{ addresses[v.vehicleCode] }}</span>
        </div>

        <!-- Weather from Open-Meteo -->
        <div v-if="vehicleWeather[v.vehicleCode]" class="mt-2 flex items-center gap-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg px-2.5 py-1.5">
          <span class="text-lg">{{ vehicleWeather[v.vehicleCode].icon }}</span>
          <div>
            <span class="text-xs font-semibold text-cyan-900 dark:text-cyan-300">{{ vehicleWeather[v.vehicleCode].temperature }}°C</span>
            <span class="text-xs text-cyan-700 dark:text-cyan-400 ml-1">{{ vehicleWeather[v.vehicleCode].label }}</span>
          </div>
          <span class="text-xs text-cyan-500 ml-auto">💨 {{ vehicleWeather[v.vehicleCode].windSpeed }} km/h</span>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('vehicles.licensePlate') }}</p>
            <p class="font-medium dark:text-gray-200">{{ v.licensePlate || '–' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('vehicles.speed') }}</p>
            <p class="font-medium" :class="v.speed > 0 ? 'text-green-600' : 'dark:text-gray-200'">
              {{ v.speed }} km/h
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('vehicles.position') }}</p>
            <p class="font-medium text-xs dark:text-gray-300">
              {{ v.latitude?.toFixed(4) }}, {{ v.longitude?.toFixed(4) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('vehicles.battery') }}</p>
            <div class="flex items-center gap-1">
              <div class="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  :class="[
                    'h-full rounded-full',
                    v.battery > 50 ? 'bg-green-500' : v.battery > 20 ? 'bg-amber-500' : 'bg-red-500'
                  ]"
                  :style="{ width: Math.max(v.battery || 0, 0) + '%' }"
                />
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ v.battery || 0 }}%</span>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <p class="text-xs text-gray-400 dark:text-gray-500">
            {{ formatDate(v.lastResponseTime) }}
          </p>
          <div class="flex gap-2">
            <router-link
              :to="`/vehicles/${v.vehicleCode}`"
              class="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              {{ t('vehicles.detail') }}
            </router-link>
            <router-link
              :to="`/trips/${v.vehicleCode}`"
              class="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              {{ t('vehicles.trips') }}
            </router-link>
            <router-link
              :to="`/sensors/${v.vehicleCode}`"
              class="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              {{ t('vehicles.sensors') }}
            </router-link>
            <router-link
              :to="`/eco-driving/${v.vehicleCode}`"
              class="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              {{ t('vehicles.eco') }}
            </router-link>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <p v-if="sortedVehicles.length === 0" class="text-center text-gray-400 dark:text-gray-500 py-10">
      {{ t('vehicles.noVehiclesFound') }}
    </p>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFleetStore } from '../stores/fleet'
import { getWeatherBatch } from '../api/weather'
import { reverseGeocode } from '../api/geocoding'
import { useLocalStorage } from '../composables/useLocalStorage'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import dayjs from 'dayjs'

const { t, locale } = useI18n()
const fleetStore = useFleetStore()
const search = ref('')
const sortBy = useLocalStorage('fleetview-vehicles-sort', 'name')

// External API data
const vehicleWeather = reactive({})
const addresses = reactive({})

const sortedVehicles = computed(() => {
  let list = [...fleetStore.vehicles]

  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(v =>
      (v.name || '').toLowerCase().includes(q) ||
      (v.licensePlate || '').toLowerCase().includes(q) ||
      (v.vehicleCode || '').toLowerCase().includes(q)
    )
  }

  list.sort((a, b) => {
    if (sortBy.value === 'speed') return (b.speed || 0) - (a.speed || 0)
    if (sortBy.value === 'licensePlate') return (a.licensePlate || '').localeCompare(b.licensePlate || '')
    return (a.name || a.vehicleCode || '').localeCompare(b.name || b.vehicleCode || '')
  })

  return list
})

function formatDate(dateStr) {
  if (!dateStr) return '–'
  return dayjs(dateStr).format('DD.MM.YYYY HH:mm')
}

// Load weather + geocoding when vehicles change
watch(() => fleetStore.vehicles, async (vehicles) => {
  if (vehicles.length === 0) return

  const validVehicles = vehicles.filter(v => v.latitude && v.longitude)
  if (validVehicles.length === 0) return

  // Weather batch
  try {
    const locations = validVehicles.map(v => ({ latitude: v.latitude, longitude: v.longitude }))
    const results = await getWeatherBatch(locations, locale.value)
    results.forEach((w, i) => {
      if (w) vehicleWeather[validVehicles[i].vehicleCode] = w
    })
  } catch (e) {
    console.warn('Weather batch failed:', e)
  }

  // Geocoding (sequential, 1 req/sec)
  for (let i = 0; i < validVehicles.length; i++) {
    const v = validVehicles[i]
    if (addresses[v.vehicleCode]) continue

    try {
      const result = await reverseGeocode(v.latitude, v.longitude)
      if (result) addresses[v.vehicleCode] = result.short
    } catch (e) {
      console.warn('Geocode failed:', e)
    }

    if (i < validVehicles.length - 1) {
      await new Promise(r => setTimeout(r, 1100))
    }
  }
}, { immediate: true })

// Reload weather when locale changes
watch(locale, async () => {
  const validVehicles = fleetStore.vehicles.filter(v => v.latitude && v.longitude)
  if (validVehicles.length === 0) return
  try {
    const locations = validVehicles.map(v => ({ latitude: v.latitude, longitude: v.longitude }))
    const results = await getWeatherBatch(locations, locale.value)
    results.forEach((w, i) => {
      if (w) vehicleWeather[validVehicles[i].vehicleCode] = w
    })
  } catch (e) { /* ignore */ }
})
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.list-move {
  transition: transform 0.3s ease;
}
</style>
