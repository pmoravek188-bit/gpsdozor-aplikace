import axios from 'axios'
import { markApiSuccess, markApiFailure } from '../composables/useApiHealth'

/**
 * OSRM (Open Source Routing Machine) API
 * https://project-osrm.org/docs/v5.24.0/api/
 *
 * Free, no API key required, public demo server
 */

const routingClient = axios.create({
  baseURL: 'https://router.project-osrm.org',
  timeout: 30000,
})

routingClient.interceptors.response.use(
  (response) => {
    markApiSuccess('routing')
    return response
  },
  (error) => {
    markApiFailure('routing')
    return Promise.reject(error)
  }
)

/**
 * Get an optimized route between two points
 * @param {[number, number]} start - [latitude, longitude]
 * @param {[number, number]} end - [latitude, longitude]
 * @returns {Promise<{distance: number, duration: number, geometry: Array}>}
 */
export async function getRoute(start, end) {
  // OSRM expects coordinates as lon,lat (opposite of usual lat,lon)
  const coords = `${start[1]},${start[0]};${end[1]},${end[0]}`

  const { data } = await routingClient.get(`/route/v1/driving/${coords}`, {
    params: {
      overview: 'full',
      geometries: 'geojson',
      steps: false,
    },
  })

  if (!data.routes || data.routes.length === 0) {
    throw new Error('No route found')
  }

  const route = data.routes[0]
  return {
    distance: route.distance,         // meters
    duration: route.duration,         // seconds
    distanceKm: (route.distance / 1000).toFixed(1),
    durationMin: Math.round(route.duration / 60),
    // GeoJSON coordinates are [lon, lat] → convert to [lat, lon] for Leaflet
    geometry: route.geometry.coordinates.map(c => [c[1], c[0]]),
  }
}

/**
 * Get an optimized route through multiple waypoints
 * @param {Array<[number, number]>} waypoints - Array of [latitude, longitude]
 * @returns {Promise<{distance: number, duration: number, geometry: Array}>}
 */
export async function getRouteMultiple(waypoints) {
  if (!waypoints || waypoints.length < 2) {
    throw new Error('At least 2 waypoints required')
  }

  // OSRM expects lon,lat format
  const coords = waypoints.map(w => `${w[1]},${w[0]}`).join(';')

  const { data } = await routingClient.get(`/route/v1/driving/${coords}`, {
    params: {
      overview: 'full',
      geometries: 'geojson',
      steps: false,
    },
  })

  if (!data.routes || data.routes.length === 0) {
    throw new Error('No route found')
  }

  const route = data.routes[0]
  return {
    distance: route.distance,
    duration: route.duration,
    distanceKm: (route.distance / 1000).toFixed(1),
    durationMin: Math.round(route.duration / 60),
    geometry: route.geometry.coordinates.map(c => [c[1], c[0]]),
  }
}

/**
 * Compare actual trip distance with optimal route distance
 * @param {number} actualDistanceKm - actual distance driven in km
 * @param {number} optimalDistanceKm - optimal route distance in km
 * @returns {{efficiency: number, difference: number, rating: string}}
 */
export function compareRoutes(actualDistanceKm, optimalDistanceKm) {
  if (!actualDistanceKm || actualDistanceKm <= 0 || !optimalDistanceKm || optimalDistanceKm <= 0) {
    return { efficiency: 100, difference: 0, rating: 'unknown' }
  }

  const efficiency = Math.round((optimalDistanceKm / actualDistanceKm) * 100)
  const difference = (actualDistanceKm - optimalDistanceKm).toFixed(1)

  let rating = 'excellent'
  if (efficiency < 70) rating = 'poor'
  else if (efficiency < 85) rating = 'fair'
  else if (efficiency < 95) rating = 'good'

  return { efficiency, difference, rating }
}

export default { getRoute, getRouteMultiple, compareRoutes }
