import axios from 'axios'
import { markApiSuccess, markApiFailure } from '../composables/useApiHealth'

const API_BASE = '/bff/api/v1'

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
})

client.interceptors.response.use(
  (response) => {
    markApiSuccess('gpsdozor')
    return response
  },
  (error) => {
    markApiFailure('gpsdozor')
    console.error('API Error:', error?.response?.status, error?.message)
    return Promise.reject(error)
  }
)

/**
 * 1) Get available groups
 */
export function getGroups() {
  return client.get('/groups').then(r => r.data)
}

/**
 * 2) Get vehicles in a group
 */
export function getVehiclesInGroup(groupCode) {
  return client.get(`/vehicles/group/${groupCode}`).then(r => r.data)
}

/**
 * 3) Get current vehicle info
 */
export function getVehicle(vehicleCode) {
  return client.get(`/vehicle/${vehicleCode}`).then(r => r.data)
}

/**
 * 4) Get position history for vehicle(s)
 */
export function getPositionHistory(vehicleCodes, from, to) {
  const codes = Array.isArray(vehicleCodes) ? vehicleCodes.join(',') : vehicleCodes
  return client.get(`/vehicles/history/${codes}`, {
    params: { from, to }
  }).then(r => r.data)
}

/**
 * 5) Get trips (logbook) for a vehicle
 */
export function getTrips(vehicleCode, from, to) {
  return client.get(`/vehicle/${vehicleCode}/trips`, {
    params: { from, to }
  }).then(r => r.data)
}

/**
 * 9) Get sensor data
 */
export function getSensorData(vehicleCode, sensorTypes, from, to) {
  const types = Array.isArray(sensorTypes) ? sensorTypes.join(',') : sensorTypes
  return client.get(`/vehicle/${vehicleCode}/sensors/${types}`, {
    params: { from, to }
  }).then(r => r.data)
}

/**
 * 10) Get eco-driving events
 */
export function getEcoDrivingEvents(vehicleCode, from, to) {
  return client.get(`/vehicle/${vehicleCode}/eco-driving-events`, {
    params: { from, to }
  }).then(r => r.data)
}

/**
 * 13) Get branches in group
 */
export function getBranches(groupCode) {
  return client.get(`/groups/${groupCode}/branches`).then(r => r.data)
}

export default {
  getGroups,
  getVehiclesInGroup,
  getVehicle,
  getPositionHistory,
  getTrips,
  getSensorData,
  getEcoDrivingEvents,
  getBranches,
}
