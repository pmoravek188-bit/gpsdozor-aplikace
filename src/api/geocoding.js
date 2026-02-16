import axios from 'axios'
import { markApiSuccess, markApiFailure } from '../composables/useApiHealth'

/**
 * Nominatim Reverse Geocoding API (OpenStreetMap)
 * https://nominatim.org/release-docs/develop/api/Reverse/
 *
 * Rate limit: max 1 request/second — we use caching + debounce
 */

const geocodeClient = axios.create({
  baseURL: 'https://nominatim.openstreetmap.org',
  timeout: 10000,
})

// Dynamically set Accept-Language header based on current locale
geocodeClient.interceptors.request.use(config => {
  const locale = localStorage.getItem('fleetview-locale') || 'cs'
  config.headers['Accept-Language'] = locale === 'en' ? 'en,cs' : 'cs,en'
  return config
})

geocodeClient.interceptors.response.use(
  (response) => {
    markApiSuccess('geocoding')
    return response
  },
  (error) => {
    markApiFailure('geocoding')
    return Promise.reject(error)
  }
)

// Simple in-memory cache to avoid repeated lookups
const cache = new Map()
const CACHE_STORAGE_KEY = 'fleetview-geocoding-cache-v1'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

function cacheKey(lat, lon) {
  // Round to 3 decimal places (~111m precision) for caching
  return `${lat.toFixed(3)},${lon.toFixed(3)}`
}

/**
 * Reverse geocode coordinates to a human-readable address
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{address: string, city: string, country: string, full: object}>}
 */
export async function reverseGeocode(latitude, longitude) {
  if (!latitude || !longitude) return null

  const key = cacheKey(latitude, longitude)
  if (cache.size === 0) hydrateCache()
  if (cache.has(key)) return cache.get(key)

  try {
    const { data } = await geocodeClient.get('/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        zoom: 16,          // Street-level detail
        addressdetails: 1,
      },
    })

    const addr = data.address || {}
    const result = {
      displayName: data.display_name || '',
      street: addr.road || addr.pedestrian || addr.footway || '',
      houseNumber: addr.house_number || '',
      city: addr.city || addr.town || addr.village || addr.municipality || '',
      district: addr.city_district || addr.suburb || '',
      postcode: addr.postcode || '',
      country: addr.country || '',
      short: buildShortAddress(addr),
    }

    cache.set(key, result)
    persistCache()
    return result
  } catch (e) {
    console.warn('Reverse geocode failed:', e.message)
    return null
  }
}

function buildShortAddress(addr) {
  const parts = []
  const street = addr.road || addr.pedestrian || ''
  if (street) {
    parts.push(addr.house_number ? `${street} ${addr.house_number}` : street)
  }
  const city = addr.city || addr.town || addr.village || addr.municipality || ''
  if (city) parts.push(city)
  if (parts.length > 0) return parts.join(', ')
  // Localized fallback
  try {
    const locale = localStorage.getItem('fleetview-locale') || 'cs'
    return locale === 'en' ? 'Unknown location' : 'Neznámá poloha'
  } catch {
    return 'Neznámá poloha'
  }
}

/**
 * Batch reverse geocode for multiple locations
 * Respects 1 req/sec rate limit using sequential calls with delay
 */
export async function reverseGeocodeBatch(locations) {
  const results = []

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i]
    const key = cacheKey(loc.latitude, loc.longitude)

    if (cache.has(key)) {
      results.push(cache.get(key))
    } else {
      // Delay between API calls to respect rate limit
      if (i > 0) await sleep(1100)
      const result = await reverseGeocode(loc.latitude, loc.longitude)
      results.push(result)
    }
  }

  return results
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Get cached address if available, otherwise return null (non-blocking)
 */
export function getCachedAddress(latitude, longitude) {
  if (!latitude || !longitude) return null
  if (cache.size === 0) hydrateCache()
  const key = cacheKey(latitude, longitude)
  return cache.get(key) || null
}

function hydrateCache() {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return
    const now = Date.now()
    for (const [key, value] of Object.entries(parsed)) {
      if (!value?.storedAt || (now - value.storedAt > CACHE_TTL_MS)) continue
      if (value?.data) cache.set(key, value.data)
    }
  } catch {
    // ignore corrupted cache
  }
}

function persistCache() {
  try {
    const out = {}
    for (const [key, value] of cache.entries()) {
      out[key] = { data: value, storedAt: Date.now() }
    }
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(out))
  } catch {
    // localStorage full/disabled
  }
}

export default { reverseGeocode, reverseGeocodeBatch, getCachedAddress }
