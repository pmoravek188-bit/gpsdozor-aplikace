import axios from 'axios'
import { markApiSuccess, markApiFailure } from '../composables/useApiHealth'

/**
 * Overpass API (OpenStreetMap) — Find Points of Interest near a location
 * https://overpass-api.de/
 * Free, no API key needed, rate limit ~2 req/s
 */

const overpassClient = axios.create({
  baseURL: 'https://overpass-api.de/api',
  timeout: 15000,
})

overpassClient.interceptors.response.use(
  (response) => {
    markApiSuccess('overpass')
    return response
  },
  (error) => {
    markApiFailure('overpass')
    return Promise.reject(error)
  }
)

/**
 * Find POIs near a given coordinate within a radius
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} radiusMeters - Search radius in meters (default 2000m)
 * @param {string[]} amenities - OSM amenity types to search for
 * @returns {Promise<Array>} Array of POI objects
 */
export async function findNearbyPOIs(lat, lon, radiusMeters = 2000, amenities = ['fuel', 'parking', 'car_repair']) {
  if (!lat || !lon) return []

  // Build Overpass QL query — each amenity needs its own filter
  const amenityUnion = amenities.map(a =>
    `node["amenity"="${a}"](around:${radiusMeters},${lat},${lon});` +
    `way["amenity"="${a}"](around:${radiusMeters},${lat},${lon});`
  ).join('\n      ')

  const query = `
    [out:json][timeout:10];
    (
      ${amenityUnion}
    );
    out center body qt 30;
  `

  const originLat = lat
  const originLon = lon

  try {
    const { data } = await overpassClient.post('/interpreter', `data=${encodeURIComponent(query)}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (!data || !data.elements) return []

    return data.elements.map(el => {
      const elLat = el.lat || el.center?.lat
      const elLon = el.lon || el.center?.lon
      const tags = el.tags || {}

      return {
        id: el.id,
        type: tags.amenity || 'unknown',
        name: tags.name || tags['name:cs'] || tags['name:en'] || getDefaultName(tags.amenity),
        brand: tags.brand || '',
        latitude: elLat,
        longitude: elLon,
        address: buildAddress(tags),
        openingHours: tags.opening_hours || '',
        phone: tags.phone || tags['contact:phone'] || '',
        website: tags.website || tags['contact:website'] || '',
        fuel: {
          diesel: tags['fuel:diesel'] === 'yes',
          lpg: tags['fuel:lpg'] === 'yes',
          electric: tags['fuel:electricity'] === 'yes' || tags.amenity === 'charging_station',
        },
        icon: getIcon(tags.amenity),
        distance: calculateDistance(originLat, originLon, elLat, elLon),
      }
    }).filter(p => p.latitude && p.longitude)
      .sort((a, b) => a.distance - b.distance)
  } catch (e) {
    console.warn('Overpass API failed:', e.message)
    return []
  }
}

/**
 * Find gas stations near a location
 */
export async function findNearbyGasStations(lat, lon, radiusMeters = 3000) {
  return findNearbyPOIs(lat, lon, radiusMeters, ['fuel'])
}

/**
 * Find parking near a location
 */
export async function findNearbyParking(lat, lon, radiusMeters = 2000) {
  return findNearbyPOIs(lat, lon, radiusMeters, ['parking'])
}

/**
 * Find all useful fleet POIs (gas, parking, repair, charging)
 */
export async function findFleetPOIs(lat, lon, radiusMeters = 2000) {
  return findNearbyPOIs(lat, lon, radiusMeters, ['fuel', 'parking', 'car_repair', 'charging_station'])
}

// ── Helpers ──────────────────────────

function getDefaultName(amenity) {
  const locale = (() => { try { return localStorage.getItem('fleetview-locale') || 'cs' } catch { return 'cs' } })()
  const names = {
    fuel:             { cs: 'Čerpací stanice',   en: 'Gas Station' },
    parking:          { cs: 'Parkoviště',         en: 'Parking' },
    car_repair:       { cs: 'Autoservis',         en: 'Car Service' },
    charging_station: { cs: 'Nabíjecí stanice',   en: 'Charging Station' },
  }
  const entry = names[amenity]
  return entry ? (entry[locale] || entry.cs) : (amenity || 'POI')
}

function getIcon(amenity) {
  const icons = {
    fuel: '⛽',
    parking: '🅿️',
    car_repair: '🔧',
    charging_station: '🔌',
  }
  return icons[amenity] || '📍'
}

function buildAddress(tags) {
  const parts = []
  if (tags['addr:street']) {
    parts.push(tags['addr:housenumber']
      ? `${tags['addr:street']} ${tags['addr:housenumber']}`
      : tags['addr:street']
    )
  }
  if (tags['addr:city']) parts.push(tags['addr:city'])
  return parts.join(', ')
}

/**
 * Haversine distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default { findNearbyPOIs, findNearbyGasStations, findNearbyParking, findFleetPOIs }
