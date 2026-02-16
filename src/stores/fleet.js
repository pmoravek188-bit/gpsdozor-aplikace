import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getGroups,
  getVehiclesInGroup,
  getVehicle,
  getTrips,
  getPositionHistory,
  getSensorData,
  getEcoDrivingEvents,
} from '../api/gpsdozor'

/**
 * Normalize vehicle data from API (PascalCase) to camelCase for internal use
 */
function normalizeVehicle(v) {
  return {
    vehicleCode: v.Code || v.vehicleCode,
    groupCode: v.GroupCode || v.groupCode,
    branchId: v.BranchId ?? v.branchId,
    branchName: v.BranchName || v.branchName,
    name: v.Name || v.name,
    licensePlate: v.SPZ || v.licensePlate,
    battery: v.BatteryPercentage ?? v.battery ?? 0,
    speed: v.Speed ?? v.speed ?? 0,
    latitude: parseFloat(v.LastPosition?.Latitude || v.latitude || 0),
    longitude: parseFloat(v.LastPosition?.Longitude || v.longitude || 0),
    deviceImei: v.DeviceImei || v.deviceImei,
    isActive: v.IsActive ?? v.isActive ?? true,
    lastResponseTime: v.LastPositionTimestamp || v.lastResponseTime,
    isEcoDrivingEnabled: v.IsEcoDrivingEnabled ?? v.isEcoDrivingEnabled,
    odometer: v.Odometer ?? v.odometer,
    refuelingCards: v.RefuelingCards || v.refuelingCards || [],
  }
}

function normalizeGroup(g) {
  return {
    groupCode: g.Code || g.groupCode,
    name: g.Name || g.name,
  }
}

export const useFleetStore = defineStore('fleet', () => {
  // State
  const groups = ref([])
  const activeGroupCode = ref(null)
  const vehicles = ref([])
  const loading = ref(false)
  const error = ref(null)

  // i18n for error messages
  function getErrorMessage(key) {
    const locale = localStorage.getItem('fleetview-locale') || 'cs'
    const messages = {
      cs: {
        'errors.fetchGroupsFailed': 'Nepodařilo se načíst skupiny vozidel.',
        'errors.fetchVehiclesFailed': 'Nepodařilo se načíst vozidla.',
      },
      en: {
        'errors.fetchGroupsFailed': 'Failed to load vehicle groups.',
        'errors.fetchVehiclesFailed': 'Failed to load vehicles.',
      },
    }
    return messages[locale]?.[key] || messages.cs[key] || key
  }

  // Computed
  const activeGroup = computed(() =>
    groups.value.find(g => g.groupCode === activeGroupCode.value)
  )

  const movingVehicles = computed(() =>
    vehicles.value.filter(v => v.speed > 0)
  )

  const stoppedVehicles = computed(() =>
    vehicles.value.filter(v => v.speed === 0)
  )

  // Actions
  async function fetchGroups() {
    loading.value = true
    error.value = null
    try {
      const data = await getGroups()
      groups.value = (Array.isArray(data) ? data : []).map(normalizeGroup)
      if (groups.value.length > 0 && !activeGroupCode.value) {
        activeGroupCode.value = groups.value[0].groupCode
      }
    } catch (e) {
      error.value = getErrorMessage('errors.fetchGroupsFailed')
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchVehicles(groupCode) {
    if (!groupCode) return
    loading.value = true
    error.value = null
    try {
      const data = await getVehiclesInGroup(groupCode)
      const arr = Array.isArray(data) ? data : data.vehicles || []
      vehicles.value = arr.map(normalizeVehicle)
    } catch (e) {
      error.value = getErrorMessage('errors.fetchVehiclesFailed')
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchVehicle(vehicleCode) {
    if (!vehicleCode) return null
    const data = await getVehicle(vehicleCode)
    return data ? normalizeVehicle(data) : null
  }

  async function selectGroup(groupCode) {
    activeGroupCode.value = groupCode
    await fetchVehicles(groupCode)
  }

  async function fetchTrips(vehicleCode, from, to) {
    return await getTrips(vehicleCode, from, to)
  }

  async function fetchHistory(vehicleCodes, from, to) {
    return await getPositionHistory(vehicleCodes, from, to)
  }

  async function fetchSensors(vehicleCode, sensorTypes, from, to) {
    return await getSensorData(vehicleCode, sensorTypes, from, to)
  }

  async function fetchEcoDriving(vehicleCode, from, to) {
    return await getEcoDrivingEvents(vehicleCode, from, to)
  }

  return {
    groups,
    activeGroupCode,
    activeGroup,
    vehicles,
    movingVehicles,
    stoppedVehicles,
    loading,
    error,
    fetchGroups,
    fetchVehicles,
    fetchVehicle,
    selectGroup,
    fetchTrips,
    fetchHistory,
    fetchSensors,
    fetchEcoDriving,
  }
})
