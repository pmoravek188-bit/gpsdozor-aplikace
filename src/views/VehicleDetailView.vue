<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <router-link to="/vehicles" class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium">
          {{ t('vehicleDetail.backToList') }}
        </router-link>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {{ vehicle ? (vehicle.name || vehicle.vehicleCode) : t('vehicleDetail.title') }}
        </h1>
      </div>
      <span v-if="vehicle" :class="[
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
        vehicle.speed > 0
          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
      ]">
        {{ vehicle.speed > 0 ? t('vehicleDetail.driving') : t('vehicleDetail.parked') }}
        · {{ vehicle.speed }} km/h
      </span>
    </div>

    <!-- Not found -->
    <div v-if="!vehicle" class="text-center py-20 text-gray-400 dark:text-gray-500">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-lg font-medium">{{ t('vehicleDetail.notFound') }}</p>
    </div>

    <template v-if="vehicle">
      <!-- Info cards + Map row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Vehicle info card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-4">{{ t('vehicleDetail.info') }}</h3>
          <div class="space-y-3">
            <InfoRow :label="t('vehicleDetail.name')" :value="vehicle.name || vehicle.vehicleCode" />
            <InfoRow :label="t('vehicleDetail.code')" :value="vehicle.vehicleCode" />
            <InfoRow :label="t('vehicleDetail.licensePlate')" :value="vehicle.licensePlate || '–'" />
            <InfoRow :label="t('vehicleDetail.speed')" :value="vehicle.speed + ' km/h'" :highlight="vehicle.speed > 0" />
            <InfoRow :label="t('vehicleDetail.lastResponse')" :value="formatDate(vehicle.lastResponseTime)" />
            <InfoRow :label="t('vehicleDetail.position')" :value="vehicle.latitude?.toFixed(5) + ', ' + vehicle.longitude?.toFixed(5)" />

            <!-- Address -->
            <div v-if="address" class="flex items-start gap-3 py-2">
              <span class="text-sm text-gray-500 dark:text-gray-400 w-32 shrink-0">{{ t('vehicleDetail.address') }}</span>
              <span class="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {{ address }}
              </span>
            </div>

            <!-- Weather -->
            <div v-if="weather" class="flex items-start gap-3 py-2">
              <span class="text-sm text-gray-500 dark:text-gray-400 w-32 shrink-0">{{ t('vehicleDetail.weather') }}</span>
              <div class="flex items-center gap-2">
                <span class="text-xl">{{ weather.icon }}</span>
                <span class="text-sm font-medium dark:text-gray-200">{{ weather.temperature }}°C · {{ weather.label }}</span>
                <span class="text-xs text-gray-400">💨 {{ weather.windSpeed }} km/h</span>
              </div>
            </div>

            <!-- Battery -->
            <div class="flex items-start gap-3 py-2">
              <span class="text-sm text-gray-500 dark:text-gray-400 w-32 shrink-0">{{ t('vehicleDetail.battery') }}</span>
              <div class="flex items-center gap-2">
                <div class="w-24 h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    :class="[
                      'h-full rounded-full transition-all',
                      vehicle.battery > 50 ? 'bg-green-500' : vehicle.battery > 20 ? 'bg-amber-500' : 'bg-red-500'
                    ]"
                    :style="{ width: Math.max(vehicle.battery || 0, 0) + '%' }"
                  />
                </div>
                <span class="text-sm font-medium dark:text-gray-200">{{ vehicle.battery || 0 }}%</span>
              </div>
            </div>

            <InfoRow v-if="vehicle.deviceImei" :label="t('vehicleDetail.imei')" :value="vehicle.deviceImei" />
            <InfoRow v-if="vehicle.odometer" :label="t('vehicleDetail.odometer')" :value="Math.round(vehicle.odometer) + ' km'" />
            <InfoRow :label="t('vehicleDetail.ecoDriving')" :value="vehicle.isEcoDrivingEnabled ? t('vehicleDetail.enabled') : t('vehicleDetail.disabled')" />
          </div>
        </div>

        <!-- Map -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ t('vehicleDetail.mapTitle') }}</h3>
          </div>
          <div class="h-[400px]">
            <l-map
              v-if="vehicle.latitude && vehicle.longitude"
              :zoom="14"
              :center="[vehicle.latitude, vehicle.longitude]"
              :use-global-leaflet="false"
              class="h-full w-full"
            >
              <l-tile-layer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <l-marker :lat-lng="[vehicle.latitude, vehicle.longitude]">
                <l-popup>
                  <div class="min-w-[160px]">
                    <p class="font-bold text-sm">{{ vehicle.name || vehicle.vehicleCode }}</p>
                    <p class="text-xs text-gray-500">{{ vehicle.licensePlate }}</p>
                    <p class="text-xs mt-1">{{ vehicle.speed }} km/h</p>
                    <p v-if="address" class="text-xs text-blue-600 mt-1">📍 {{ address }}</p>
                  </div>
                </l-popup>
              </l-marker>
              <!-- POI markers -->
              <l-marker
                v-for="poi in pois.slice(0, 15)"
                :key="'poi-' + poi.id"
                :lat-lng="[poi.latitude, poi.longitude]"
              >
                <l-popup>
                  <div class="min-w-[140px]">
                    <p class="font-bold text-sm">{{ poi.icon }} {{ poi.name }}</p>
                    <p v-if="poi.brand" class="text-xs text-gray-500">{{ poi.brand }}</p>
                    <p v-if="poi.address" class="text-xs text-gray-400 mt-0.5">{{ poi.address }}</p>
                    <p class="text-xs text-blue-600 mt-1">
                      {{ poi.distance < 1000 ? Math.round(poi.distance) + ' m' : (poi.distance / 1000).toFixed(1) + ' km' }}
                    </p>
                  </div>
                </l-popup>
              </l-marker>
            </l-map>
          </div>
        </div>
      </div>

      <!-- Nearby POIs -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900 dark:text-white">{{ t('vehicleDetail.nearbyPoi') }}</h3>
          <button
            v-if="!poisLoading && pois.length === 0"
            @click="loadPOIs"
            class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium"
          >
            {{ t('vehicleDetail.loadPoi') }}
          </button>
          <span v-if="poisLoading" class="text-xs text-gray-400">{{ t('app.loading') }}</span>
          <span v-if="pois.length > 0" class="text-xs text-gray-400">{{ pois.length }} {{ t('vehicleDetail.found') }}</span>
        </div>

        <div v-if="pois.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="poi in pois.slice(0, 9)"
            :key="poi.id"
            class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <span class="text-xl shrink-0">{{ poi.icon }}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ poi.name }}</p>
              <p v-if="poi.brand" class="text-xs text-gray-500 dark:text-gray-400">{{ poi.brand }}</p>
              <p v-if="poi.address" class="text-xs text-gray-400 truncate">{{ poi.address }}</p>
              <p class="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                {{ poi.distance < 1000 ? Math.round(poi.distance) + ' m' : (poi.distance / 1000).toFixed(1) + ' km' }}
              </p>
            </div>
          </div>
        </div>

        <p v-if="!poisLoading && poisLoaded && pois.length === 0" class="text-sm text-gray-400 dark:text-gray-500">
          {{ t('vehicleDetail.noPoi') }}
        </p>
      </div>

      <!-- Quick actions -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">{{ t('vehicleDetail.actions') }}</h3>
        <div class="flex flex-wrap gap-3">
          <router-link
            :to="`/trips/${vehicle.vehicleCode}`"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            {{ t('vehicleDetail.goToTrips') }}
          </router-link>
          <router-link
            :to="`/sensors/${vehicle.vehicleCode}`"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {{ t('vehicleDetail.goToSensors') }}
          </router-link>
          <router-link
            :to="`/eco-driving/${vehicle.vehicleCode}`"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {{ t('vehicleDetail.goToEco') }}
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch, h } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import { useFleetStore } from '../stores/fleet'
import { getWeather } from '../api/weather'
import { reverseGeocode } from '../api/geocoding'
import { findFleetPOIs } from '../api/pois'
import dayjs from 'dayjs'

const { t, locale } = useI18n()
const route = useRoute()
const fleetStore = useFleetStore()

const weather = ref(null)
const address = ref('')
const pois = ref([])
const poisLoading = ref(false)
const poisLoaded = ref(false)

const vehicle = computed(() =>
  fleetStore.vehicles.find(v => v.vehicleCode === route.params.vehicleCode) || null
)

// Simple info row helper
const InfoRow = (props) =>
  h('div', { class: 'flex items-start gap-3 py-2' }, [
    h('span', { class: 'text-sm text-gray-500 dark:text-gray-400 w-32 shrink-0' }, props.label),
    h('span', {
      class: [
        'text-sm font-medium dark:text-gray-200',
        props.highlight ? 'text-green-600 dark:text-green-400' : '',
      ].filter(Boolean).join(' '),
    }, props.value),
  ])
InfoRow.props = { label: String, value: [String, Number], highlight: Boolean }

function formatDate(dateStr) {
  if (!dateStr) return '–'
  return dayjs(dateStr).format('DD.MM.YYYY HH:mm:ss')
}

// Load weather & address for this vehicle
async function loadExternalData(v) {
  if (!v || !v.latitude || !v.longitude) return

  try {
    weather.value = await getWeather(v.latitude, v.longitude, locale.value)
  } catch (e) {
    console.warn('Weather failed for vehicle:', e)
  }

  try {
    const result = await reverseGeocode(v.latitude, v.longitude)
    if (result) address.value = result.short
  } catch (e) {
    console.warn('Geocode failed for vehicle:', e)
  }
}

async function loadPOIs() {
  const v = vehicle.value
  if (!v || !v.latitude || !v.longitude) return

  poisLoading.value = true
  try {
    pois.value = await findFleetPOIs(v.latitude, v.longitude, 3000)
  } catch (e) {
    console.warn('POIs failed:', e)
  } finally {
    poisLoading.value = false
    poisLoaded.value = true
  }
}

watch(vehicle, (v) => {
  if (v) loadExternalData(v)
}, { immediate: true })

// Reload weather on locale change
watch(locale, () => {
  if (vehicle.value) loadExternalData(vehicle.value)
})
</script>
