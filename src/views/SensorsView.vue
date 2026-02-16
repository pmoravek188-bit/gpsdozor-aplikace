<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('sensors.title') }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ t('sensors.subtitle') }}</p>
      </div>
      <button
        v-if="Object.keys(sensorData).length > 0"
        @click="exportSensors"
        class="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {{ t('sensors.exportCsv') }}
      </button>
    </div>

    <!-- Selector -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <VehicleSelector
        v-model="selectedVehicle"
        v-model:from="dateFrom"
        v-model:to="dateTo"
        :loading="loading"
        @load="loadSensors"
      />
      
      <!-- Quick period selector -->
      <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-2">
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('sensors.quickPeriod') }}:</p>
          <button
            @click="findDataPeriod"
            :disabled="!selectedVehicle || searchingPeriod"
            class="px-2.5 py-1 text-xs rounded-lg border transition-colors bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="searchingPeriod">{{ t('sensors.searching') }}...</span>
            <span v-else>{{ t('sensors.findData') }}</span>
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
      </div>
      <!-- Help / tips -->
      <div class="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
        <p class="font-medium">{{ t('sensors.helpTitle') }}</p>
        <p>{{ t('sensors.helpLine1') }}</p>
        <p>{{ t('sensors.helpLine2') }}</p>
        <p>{{ t('sensors.helpLine3') }}</p>
      </div>

      <div v-if="derivedSensors" class="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
        {{ t('sensors.derivedNotice') }}
      </div>

      <!-- Sensor type selector -->
      <div class="mt-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p v-if="availableSensorTypes.length > 0" class="text-xs text-gray-500 dark:text-gray-400">
            {{ t('sensors.availableSensors') }}: {{ availableSensorTypes.length }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ t('sensors.selectedCount', { selected: activeSensors.length, total: availableSensorsForVehicle.length }) }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2 mb-2">
          <button
            @click="selectSensorsWithData"
            class="px-2.5 py-1 text-xs rounded-lg border transition-colors bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400"
          >
            {{ t('sensors.selectWithData') }}
          </button>
          <button
            @click="selectAllAvailableSensors"
            class="px-2.5 py-1 text-xs rounded-lg border transition-colors bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400"
          >
            {{ t('sensors.selectAll') }}
          </button>
          <button
            @click="resetSensors"
            class="px-2.5 py-1 text-xs rounded-lg border transition-colors bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400"
          >
            {{ t('sensors.resetToSpeed') }}
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="sensor in availableSensorsForVehicle"
            :key="sensor.key"
            @click="toggleSensor(sensor.key)"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
              activeSensors.includes(sensor.key)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400',
              sensorData[sensor.key] && sensorData[sensor.key].length > 0
                ? 'ring-2 ring-green-400 ring-opacity-50'
                : ''
            ]"
            :title="sensorData[sensor.key] && sensorData[sensor.key].length > 0 
              ? t('sensors.hasData') 
              : t('sensors.noDataForSensor')"
          >
            {{ sensor.label }}
            <span v-if="sensorData[sensor.key] && sensorData[sensor.key].length > 0" class="ml-1">✓</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <SkeletonLoader type="chart" />
      <SkeletonLoader type="chart" />
    </div>

    <!-- Charts -->
    <template v-if="!loading && Object.keys(sensorData).length > 0">
      <div
        v-for="sensorKey in activeSensorsWithData"
        :key="sensorKey"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
      >
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ getSensorLabel(sensorKey) }}</h3>
            <p v-if="getSensorUnit(sensorKey)" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ getSensorUnit(sensorKey) }}</p>
          </div>
          <div v-if="sensorStats[sensorKey]" class="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{{ t('sensors.min') }}: <strong class="text-gray-900 dark:text-white">{{ sensorStats[sensorKey].min }}</strong></span>
            <span>{{ t('sensors.max') }}: <strong class="text-gray-900 dark:text-white">{{ sensorStats[sensorKey].max }}</strong></span>
            <span>{{ t('sensors.avg') }}: <strong class="text-gray-900 dark:text-white">{{ sensorStats[sensorKey].avg }}</strong></span>
          </div>
        </div>
        <div class="chart-container h-[280px]">
          <Line
            v-if="chartData[sensorKey]"
            :data="chartData[sensorKey]"
            :options="getChartOptions(sensorKey)"
          />
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <div v-if="!loading && loaded && Object.keys(sensorData).length === 0" class="text-center py-16 text-gray-400 dark:text-gray-500">
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p class="text-lg font-medium mb-2">{{ t('sensors.noData') }}</p>
      <p class="text-sm">{{ t('sensors.noDataHint') }}</p>
      <button
        v-if="selectedVehicle"
        @click="findDataPeriod"
        :disabled="searchingPeriod"
        class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/60"
      >
        {{ t('sensors.findData') }}
      </button>
      <p class="text-xs mt-3 text-gray-500 dark:text-gray-400">{{ t('sensors.noDataAvailable') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { useFleetStore } from '../stores/fleet'
import { useExport } from '../composables/useExport'
import { useToast } from '../composables/useToast'
import { useChartTheme } from '../composables/useChartTheme'
import { useApiError } from '../composables/useApiError'
import VehicleSelector from '../components/VehicleSelector.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import dayjs from 'dayjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const { t } = useI18n()
const route = useRoute()
const fleetStore = useFleetStore()
const { exportCSV } = useExport()
const { showToast } = useToast()
const { handleApiError } = useApiError()
const { buildOptions } = useChartTheme()

const selectedVehicle = ref(route.params.vehicleCode || '')
// Default to 7 days back - sensors might not have data for just 1 day
const dateFrom = ref(dayjs().subtract(7, 'day').format('YYYY-MM-DDTHH:mm:ss'))
const dateTo = ref(dayjs().format('YYYY-MM-DDTHH:mm:ss'))

const quickPeriods = computed(() => [
  { key: 'today', label: t('sensors.periods.today'), days: 0 },
  { key: 'yesterday', label: t('sensors.periods.yesterday'), days: 1 },
  { key: 'week', label: t('sensors.periods.lastWeek'), days: 7 },
  { key: 'month', label: t('sensors.periods.lastMonth'), days: 30 },
  { key: '3months', label: t('sensors.periods.last3Months'), days: 90 },
])


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

function getSeriesRange(series) {
  if (!Array.isArray(series) || series.length === 0) return null
  const times = series
    .map(p => new Date(p.t).getTime())
    .filter(t => Number.isFinite(t))
  if (times.length === 0) return null
  return {
    from: dayjs(Math.min(...times)).format('YYYY-MM-DDTHH:mm:ss'),
    to: dayjs(Math.max(...times)).format('YYYY-MM-DDTHH:mm:ss'),
  }
}

async function findDataPeriod() {
  if (!selectedVehicle.value) return

  searchingPeriod.value = true
  showToast(t('sensors.searchingData'), 'info', 2000)

  const anchor = await resolveVehicleAnchorTime()
  const base = anchor || dayjs()

  const periodsToTry = [
    { days: 1, label: '1 den' },
    { days: 3, label: '3 dny' },
    { days: 7, label: '1 týden' },
    { days: 14, label: '2 týdny' },
    { days: 30, label: '1 měsíc' },
    { days: 60, label: '2 měsíce' },
    { days: 90, label: '3 měsíce' },
    { days: 180, label: '6 měsíců' },
    { days: 365, label: '1 rok' },
  ]

  const sensorsToTry = availableSensorTypes.value.length > 0
    ? availableSensorTypes.value
    : ['Speed']

  for (const period of periodsToTry) {
    const fromDate = base.subtract(period.days, 'day').format('YYYY-MM-DDTHH:mm:ss')
    const toDate = base.format('YYYY-MM-DDTHH:mm:ss')

    try {
      const data = await fleetStore.fetchSensors(
        selectedVehicle.value,
        sensorsToTry,
        fromDate,
        toDate
      )

      const items = extractSensorItems(data)
      let hasData = false

      if (items && Array.isArray(items)) {
        hasData = items.some(item => normalizeSensorSeries(getItemData(item)).length > 0)
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        hasData = Object.values(data).some(val => Array.isArray(val) && val.length > 0)
      }

      if (hasData) {
        dateFrom.value = fromDate
        dateTo.value = toDate
        await loadSensors()
        showToast(t('sensors.dataFound', { period: period.label }), 'success', 5000)
        searchingPeriod.value = false
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
    const fallbackOk = await tryHistoryFallback(fromDate, toDate, { updateRange: true })
    if (fallbackOk) {
      searchingPeriod.value = false
      showToast(t('sensors.derivedNotice'), 'info', 4000)
      return
    }
  }

  searchingPeriod.value = false
  showToast(t('sensors.noDataFound'), 'warning', 5000)
}

const sensorData = ref({})
const sensorUnits = ref({})
const loading = ref(false)
const loaded = ref(false)
const searchingPeriod = ref(false)
const derivedSensors = ref(false)
const availableSensorTypes = ref([])

const availableSensors = computed(() => [
  { key: 'Speed', label: t('sensors.speed'), unit: 'km/h', color: '#3b82f6' },
  { key: 'Rpm', label: t('sensors.rpm'), unit: 'RPM', color: '#ef4444' },
  { key: 'FuelConsumedTotal', label: t('sensors.fuelTotal'), unit: 'l', color: '#f59e0b' },
  { key: 'FuelConsumptionActual', label: t('sensors.fuelActual'), unit: 'l/h', color: '#10b981' },
  { key: 'ExternalBatteryVoltage', label: t('sensors.batteryVoltage'), unit: 'V', color: '#8b5cf6' },
  { key: 'Temperature1', label: t('sensors.temperature'), unit: '°C', color: '#06b6d4' },
  { key: 'Altitude', label: t('sensors.altitude'), unit: 'm', color: '#84cc16' },
  { key: 'Odometer', label: t('sensors.odometer'), unit: 'km', color: '#6366f1' },
  { key: 'CoolingLiquidTemperature', label: t('sensors.coolingTemp'), unit: '°C', color: '#ec4899' },
])

const availableSensorsForVehicle = computed(() => {
  if (availableSensorTypes.value.length === 0) return availableSensors.value
  return availableSensors.value.filter(s => availableSensorTypes.value.includes(s.key))
})

const activeSensors = ref(['Speed'])

const activeSensorsWithData = computed(() =>
  activeSensors.value.filter(key => sensorData.value[key] && sensorData.value[key].length > 0)
)

function toggleSensor(key) {
  const idx = activeSensors.value.indexOf(key)
  if (idx >= 0) {
    if (activeSensors.value.length > 1) {
      activeSensors.value.splice(idx, 1)
    }
  } else {
    activeSensors.value.push(key)
  }
}

function selectSensorsWithData() {
  const keys = Object.keys(sensorData.value || {})
  if (keys.length > 0) activeSensors.value = keys
}

function selectAllAvailableSensors() {
  const all = availableSensorTypes.value.length > 0
    ? availableSensorTypes.value
    : availableSensors.value.map(s => s.key)
  if (all.length > 0) activeSensors.value = Array.from(new Set(all))
}

function resetSensors() {
  activeSensors.value = ['Speed']
}

function getSensorLabel(key) {
  return availableSensors.value.find(s => s.key === key)?.label || key
}

function mapUnitLabel(unit) {
  switch (unit) {
    case 'KilometersPerHour': return 'km/h'
    case 'RevolutionsPerMinute': return 'RPM'
    case 'Liter': return 'l'
    case 'LiterPerHour': return 'l/h'
    case 'Volt': return 'V'
    case 'Celsius': return '°C'
    case 'Meter': return 'm'
    case 'Kilometer': return 'km'
    default: return unit
  }
}

function getSensorUnit(key) {
  const unit = sensorUnits.value[key] || availableSensors.value.find(s => s.key === key)?.unit || ''
  return mapUnitLabel(unit)
}

function getSensorColor(key) {
  return availableSensors.value.find(s => s.key === key)?.color || '#6b7280'
}

function normalizeSensorPoint(point) {
  if (!point) return null
  if (Array.isArray(point)) {
    const [t, v] = point
    if (t == null && v == null) return null
    return { t, v }
  }
  if (typeof point !== 'object') return null
  const t = point.t ?? point.T ?? point.timestamp ?? point.Timestamp ?? point.time ?? point.Time ?? point.date ?? point.Date
  const v = point.v ?? point.V ?? point.value ?? point.Value ?? point.val ?? point.Val
  if (t == null && v == null) return null
  return { t, v }
}

function normalizeSensorSeries(series) {
  if (!Array.isArray(series)) return []
  return series.map(normalizeSensorPoint).filter(p => p && p.t != null)
}

function getItemName(item) {
  return item?.name || item?.Name || item?.sensor || item?.Sensor || item?.type || item?.Type || ''
}

function getItemData(item) {
  return item?.data || item?.Data || item?.values || item?.Values || item?.items || item?.Items || []
}

function getItemUnit(item) {
  return item?.units || item?.Units || item?.unit || item?.Unit || ''
}

function extractSensorItems(data) {
  if (!data || typeof data !== 'object') return null
  if (Array.isArray(data.items)) return data.items
  if (Array.isArray(data.Items)) return data.Items
  if (Array.isArray(data.sensors)) return data.sensors
  if (Array.isArray(data.Sensors)) return data.Sensors
  return null
}

async function tryHistoryFallback(fromDate, toDate, options = {}) {
  const { updateRange = false } = options
  try {
    const history = await fleetStore.fetchHistory(selectedVehicle.value, fromDate, toDate)
    const points = Array.isArray(history) ? history : []

    const series = points
      .filter(p => (p.Timestamp || p.timestamp) && p.Speed != null)
      .map(p => ({ t: p.Timestamp || p.timestamp, v: Number(p.Speed) }))
      .filter(p => Number.isFinite(p.v))

    if (series.length === 0) return false

    if (updateRange) {
      const range = getSeriesRange(series)
      if (range) {
        dateFrom.value = range.from
        dateTo.value = range.to
      }
    }

    sensorData.value = { Speed: series }
    sensorUnits.value = { Speed: 'km/h' }
    availableSensorTypes.value = ['Speed']
    activeSensors.value = ['Speed']
    derivedSensors.value = true
    return true
  } catch (e) {
    return false
  }
}

const sensorStats = computed(() => {
  const stats = {}
  for (const key of activeSensorsWithData.value) {
    const data = sensorData.value[key]
    if (data && data.length > 0) {
      const values = data.map(d => d.v).filter(v => v != null && isFinite(v))
      if (values.length > 0) {
        stats[key] = {
          min: Math.round(Math.min(...values) * 100) / 100,
          max: Math.round(Math.max(...values) * 100) / 100,
          avg: Math.round(values.reduce((s, v) => s + v, 0) / values.length * 100) / 100,
        }
      }
    }
  }
  return stats
})

const chartData = computed(() => {
  const charts = {}
  for (const key of activeSensorsWithData.value) {
    const data = sensorData.value[key]
    if (data && data.length > 0) {
      const sampled = data.length > 500
        ? data.filter((_, i) => i % Math.ceil(data.length / 500) === 0)
        : data

      charts[key] = {
        labels: sampled.map(d => dayjs(d.t).format('HH:mm')),
        datasets: [{
          label: `${getSensorLabel(key)} (${getSensorUnit(key)})`,
          data: sampled.map(d => d.v),
          borderColor: getSensorColor(key),
          backgroundColor: getSensorColor(key) + '20',
          borderWidth: 2,
          pointRadius: sampled.length > 100 ? 0 : 2,
          fill: true,
          tension: 0.3,
        }],
      }
    }
  }
  return charts
})

function getChartOptions(sensorKey) {
  return buildOptions({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} ${getSensorUnit(sensorKey)}`,
        },
      },
    },
    scales: {
      x: {
        display: true,
        ticks: { maxTicksLimit: 20 },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: getSensorUnit(sensorKey),
        },
      },
    },
  })
}

function exportSensors() {
  const rows = []
  for (const key of activeSensorsWithData.value) {
    const data = sensorData.value[key]
    if (!data) continue
    data.forEach(d => {
      rows.push({
        sensor: getSensorLabel(key),
        time: dayjs(d.t).format('DD.MM.YYYY HH:mm:ss'),
        value: d.v ?? '',
        unit: getSensorUnit(key),
      })
    })
  }

  if (rows.length === 0) return

  exportCSV(rows, `sensors_${selectedVehicle.value}_${dayjs().format('YYYY-MM-DD')}`, {
    sensor: 'Sensor',
    time: 'Time',
    value: 'Value',
    unit: 'Unit',
  })

  showToast(t('sensors.exportCsv') + ' ✓', 'success')
}

async function loadSensors(options = {}) {
  const { retry = true } = options
  if (!selectedVehicle.value || activeSensors.value.length === 0) return
  loading.value = true
  loaded.value = false
  sensorData.value = {}
  sensorUnits.value = {}
  availableSensorTypes.value = []
  derivedSensors.value = false

  try {
    const fromDate = dayjs(dateFrom.value).format('YYYY-MM-DDTHH:mm:ss')
    const toDate = dayjs(dateTo.value).format('YYYY-MM-DDTHH:mm:ss')

    const data = await fleetStore.fetchSensors(
      selectedVehicle.value,
      activeSensors.value,
      fromDate,
      toDate
    )

    if (!data) {
      showToast(t('sensors.noData') + ' - ' + t('sensors.noDataHint'), 'info', 5000)
      return
    }

    if (data.Message || data.message) {
      const msg = data.Message || data.message
      if (msg.includes('Timespan') || msg.includes('timespan')) {
        showToast(t('sensors.timespanError') || 'Chyba časového rozsahu. Zkuste kratší období.', 'warning', 5000)
      } else if (retry && activeSensors.value.length > 1 && /sensor/i.test(msg)) {
        activeSensors.value = ['Speed']
        await loadSensors({ retry: false })
        return
      } else {
        handleApiError(new Error(msg), 'errors.sensorsFailed', msg)
      }
      return
    }

    const items = extractSensorItems(data)

    if (items && Array.isArray(items)) {
      const parsed = {}
      const units = {}
      const availableTypes = []
      let hasAnyData = false

      items.forEach(item => {
        const name = getItemName(item)
        if (!name) return
        availableTypes.push(name)

        const series = normalizeSensorSeries(getItemData(item))
        if (series.length > 0) {
          parsed[name] = series
          units[name] = getItemUnit(item)
          hasAnyData = true
        }
      })

      sensorData.value = parsed
      sensorUnits.value = units
      availableSensorTypes.value = Array.from(new Set(availableTypes))

      const sensorsWithData = Object.keys(parsed)
      if (sensorsWithData.length > 0) {
        const currentActiveHasData = activeSensors.value.some(key => sensorsWithData.includes(key))
        if (!currentActiveHasData) {
          activeSensors.value = [sensorsWithData[0]]
        }
      }

      if (!hasAnyData && items.length > 0) {
        const fallbackOk = await tryHistoryFallback(fromDate, toDate)
        if (fallbackOk) {
          showToast(t('sensors.derivedNotice'), 'info', 4000)
        } else {
          showToast(t('sensors.noData') + ' - ' + t('sensors.noDataHint'), 'info', 5000)
        }
      } else if (hasAnyData) {
        const count = Object.keys(parsed).length
        showToast(t('sensors.dataLoaded', { count }), 'success', 3000)
      }
      return
    }

    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const parsed = {}
      Object.entries(data).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          const series = normalizeSensorSeries(val)
          if (series.length > 0) parsed[key] = series
        }
      })

      sensorData.value = parsed
      availableSensorTypes.value = Object.keys(parsed)

      if (Object.keys(parsed).length === 0) {
        const fallbackOk = await tryHistoryFallback(fromDate, toDate)
        if (fallbackOk) {
          showToast(t('sensors.derivedNotice'), 'info', 4000)
        } else {
          showToast(t('sensors.noData') + ' - ' + t('sensors.noDataHint'), 'info', 5000)
        }
      }
      return
    }

    if (data === '' || data === null) {
      showToast(t('sensors.noData') + ' - ' + t('sensors.noDataHint'), 'info', 5000)
    }
  } catch (e) {
    const errorMessage = e?.response?.data?.Message || e?.message || ''

    if (errorMessage.includes('Timespan') || errorMessage.includes('timespan')) {
      showToast(t('sensors.timespanError') || 'Chyba časového rozsahu. Zkuste kratší období.', 'warning', 5000)
    } else if (retry && activeSensors.value.length > 1 && /sensor/i.test(errorMessage)) {
      activeSensors.value = ['Speed']
      await loadSensors({ retry: false })
      return
    } else if (e?.response?.status === 400) {
      const apiMessage = e?.response?.data?.Message || errorMessage
      showToast(apiMessage || t('sensors.timespanError') || 'Chyba v požadavku. Zkuste upravit parametry.', 'warning', 5000)
    } else if (e?.response?.status === 401) {
      handleApiError(e, 'errors.sensorsFailed', 'Authentication failed')
    } else {
      handleApiError(e, 'errors.sensorsFailed', 'Failed to load sensor data')
    }
  } finally {
    loading.value = false
    loaded.value = true
  }
}

onMounted(() => {
  if (selectedVehicle.value) {
    loadSensors()
  }
})
</script>

