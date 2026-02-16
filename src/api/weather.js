import axios from 'axios'
import { markApiSuccess, markApiFailure } from '../composables/useApiHealth'

/**
 * Open-Meteo Weather API (free, no API key required)
 * https://open-meteo.com/
 */

const weatherClient = axios.create({
  baseURL: 'https://api.open-meteo.com/v1',
  timeout: 10000,
})

weatherClient.interceptors.response.use(
  (response) => {
    markApiSuccess('weather')
    return response
  },
  (error) => {
    markApiFailure('weather')
    return Promise.reject(error)
  }
)

// WMO Weather interpretation codes → labels + icons
const weatherCodes = {
  0:  { cs: 'Jasno',                    en: 'Clear sky',              icon: '☀️' },
  1:  { cs: 'Převážně jasno',           en: 'Mainly clear',           icon: '🌤️' },
  2:  { cs: 'Polojasno',                en: 'Partly cloudy',          icon: '⛅' },
  3:  { cs: 'Zataženo',                 en: 'Overcast',               icon: '☁️' },
  45: { cs: 'Mlha',                     en: 'Fog',                    icon: '🌫️' },
  48: { cs: 'Námraza',                  en: 'Rime fog',               icon: '🌫️' },
  51: { cs: 'Mrholení',                 en: 'Light drizzle',          icon: '🌦️' },
  53: { cs: 'Mrholení',                 en: 'Moderate drizzle',       icon: '🌦️' },
  55: { cs: 'Silné mrholení',           en: 'Dense drizzle',          icon: '🌧️' },
  61: { cs: 'Slabý déšť',              en: 'Light rain',             icon: '🌦️' },
  63: { cs: 'Déšť',                     en: 'Moderate rain',          icon: '🌧️' },
  65: { cs: 'Silný déšť',              en: 'Heavy rain',             icon: '🌧️' },
  66: { cs: 'Mrznoucí déšť',           en: 'Light freezing rain',    icon: '🌨️' },
  67: { cs: 'Silný mrznoucí déšť',     en: 'Heavy freezing rain',    icon: '🌨️' },
  71: { cs: 'Slabé sněžení',           en: 'Light snow',             icon: '🌨️' },
  73: { cs: 'Sněžení',                 en: 'Moderate snow',          icon: '❄️' },
  75: { cs: 'Silné sněžení',           en: 'Heavy snow',             icon: '❄️' },
  77: { cs: 'Sněhové zrno',            en: 'Snow grains',            icon: '❄️' },
  80: { cs: 'Slabé přeháňky',          en: 'Light showers',          icon: '🌦️' },
  81: { cs: 'Přeháňky',                en: 'Moderate showers',       icon: '🌧️' },
  82: { cs: 'Silné přeháňky',          en: 'Violent showers',        icon: '⛈️' },
  85: { cs: 'Sněhové přeháňky',        en: 'Light snow showers',     icon: '🌨️' },
  86: { cs: 'Silné sněhové přeháňky',  en: 'Heavy snow showers',     icon: '🌨️' },
  95: { cs: 'Bouřka',                  en: 'Thunderstorm',           icon: '⛈️' },
  96: { cs: 'Bouřka s krupobitím',     en: 'Thunderstorm with hail', icon: '⛈️' },
  99: { cs: 'Silná bouřka',            en: 'Severe thunderstorm',    icon: '⛈️' },
}

function getLocale() {
  try {
    return localStorage.getItem('fleetview-locale') || 'cs'
  } catch {
    return 'cs'
  }
}

function parseWeatherResponse(cw, locale) {
  const lang = locale || getLocale()
  const info = weatherCodes[cw.weathercode] || { cs: 'Neznámé', en: 'Unknown', icon: '❓' }

  return {
    temperature: Math.round(cw.temperature),
    windSpeed: Math.round(cw.windspeed),
    weatherCode: cw.weathercode,
    label: info[lang] || info.cs,
    icon: info.icon,
    isDay: cw.is_day === 1,
  }
}

/**
 * Get current weather for a given location
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} [locale] - 'cs' or 'en', defaults to stored locale
 */
export async function getWeather(latitude, longitude, locale) {
  const { data } = await weatherClient.get('/forecast', {
    params: {
      latitude,
      longitude,
      current_weather: true,
      timezone: 'auto',
    },
  })

  return parseWeatherResponse(data.current_weather, locale)
}

/**
 * Get weather for multiple locations (batched)
 * Open-Meteo supports comma-separated lat/lon for batch
 * @param {Array} locations - [{latitude, longitude}]
 * @param {string} [locale] - 'cs' or 'en'
 */
export async function getWeatherBatch(locations, locale) {
  if (!locations || locations.length === 0) return []

  const lats = locations.map(l => l.latitude).join(',')
  const lons = locations.map(l => l.longitude).join(',')

  try {
    const { data } = await weatherClient.get('/forecast', {
      params: {
        latitude: lats,
        longitude: lons,
        current_weather: true,
        timezone: 'auto',
      },
    })

    const results = Array.isArray(data) ? data : [data]
    return results.map(item => parseWeatherResponse(item.current_weather, locale))
  } catch (e) {
    console.warn('Weather batch fetch failed:', e)
    return locations.map(() => null)
  }
}

export default { getWeather, getWeatherBatch }
