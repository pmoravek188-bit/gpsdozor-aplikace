import axios from 'axios'
import { markApiSuccess, markApiFailure } from '../composables/useApiHealth'

/**
 * Open-Elevation API — Free elevation data
 * https://open-elevation.com/
 * Free, no API key needed
 */

const elevationClient = axios.create({
  baseURL: 'https://api.open-elevation.com/api/v1',
  timeout: 15000,
})

elevationClient.interceptors.response.use(
  (response) => {
    markApiSuccess('elevation')
    return response
  },
  (error) => {
    markApiFailure('elevation')
    return Promise.reject(error)
  }
)

/**
 * Get elevation for a single point
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<number>} Elevation in meters
 */
export async function getElevation(latitude, longitude) {
  if (!latitude || !longitude) return null

  try {
    const { data } = await elevationClient.get('/lookup', {
      params: {
        locations: `${latitude},${longitude}`,
      },
    })

    if (data && data.results && data.results.length > 0) {
      return data.results[0].elevation
    }
    return null
  } catch (e) {
    console.warn('Elevation API failed:', e.message)
    return null
  }
}

/**
 * Get elevation profile for a route (array of [lat, lon] pairs)
 * Samples points to stay within API limits
 * @param {Array<[number, number]>} routePoints - Array of [lat, lng] pairs
 * @param {number} maxSamples - Maximum number of points to sample (default 100)
 * @returns {Promise<Array<{latitude: number, longitude: number, elevation: number}>>}
 */
export async function getElevationProfile(routePoints, maxSamples = 100) {
  if (!routePoints || routePoints.length === 0) return []

  // Sample points evenly if there are too many
  let sampled = routePoints
  if (routePoints.length > maxSamples) {
    const step = Math.ceil(routePoints.length / maxSamples)
    sampled = routePoints.filter((_, i) => i % step === 0)
    // Always include last point
    if (sampled[sampled.length - 1] !== routePoints[routePoints.length - 1]) {
      sampled.push(routePoints[routePoints.length - 1])
    }
  }

  const locations = sampled.map(([lat, lng]) => ({
    latitude: lat,
    longitude: lng,
  }))

  try {
    const { data } = await elevationClient.post('/lookup', {
      locations,
    })

    if (data && data.results) {
      return data.results.map((r, i) => ({
        latitude: r.latitude,
        longitude: r.longitude,
        elevation: r.elevation,
        index: i,
        // Calculate cumulative distance
        distanceFromStart: i === 0 ? 0 : calculateCumulativeDistance(sampled, i),
      }))
    }
    return []
  } catch (e) {
    console.warn('Elevation profile API failed:', e.message)
    return []
  }
}

/**
 * Get elevation stats for a route
 * @param {Array<{elevation: number}>} profile
 */
export function getElevationStats(profile) {
  if (!profile || profile.length === 0) return null

  const elevations = profile.map(p => p.elevation).filter(e => e != null)
  if (elevations.length === 0) return null

  let totalAscent = 0
  let totalDescent = 0

  for (let i = 1; i < elevations.length; i++) {
    const diff = elevations[i] - elevations[i - 1]
    if (diff > 0) totalAscent += diff
    else totalDescent += Math.abs(diff)
  }

  return {
    min: Math.round(Math.min(...elevations)),
    max: Math.round(Math.max(...elevations)),
    start: Math.round(elevations[0]),
    end: Math.round(elevations[elevations.length - 1]),
    totalAscent: Math.round(totalAscent),
    totalDescent: Math.round(totalDescent),
    avg: Math.round(elevations.reduce((s, e) => s + e, 0) / elevations.length),
  }
}

// ── Helpers ──────────────────────────

function calculateCumulativeDistance(points, toIndex) {
  let total = 0
  for (let i = 1; i <= toIndex; i++) {
    total += haversineDistance(
      points[i - 1][0], points[i - 1][1],
      points[i][0], points[i][1]
    )
  }
  return Math.round(total) // meters
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default { getElevation, getElevationProfile, getElevationStats }
