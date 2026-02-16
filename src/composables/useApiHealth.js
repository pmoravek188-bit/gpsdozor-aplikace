import { reactive, computed } from 'vue'

const defaultStatus = () => ({
  ok: null, // null = unknown, true = healthy, false = failing
  lastOkAt: null,
  lastFailAt: null,
})

const apiHealth = reactive({
  gpsdozor: defaultStatus(),
  weather: defaultStatus(),
  geocoding: defaultStatus(),
  routing: defaultStatus(),
  overpass: defaultStatus(),
  elevation: defaultStatus(),
})

function markApiSuccess(key) {
  if (!apiHealth[key]) return
  apiHealth[key].ok = true
  apiHealth[key].lastOkAt = Date.now()
}

function markApiFailure(key) {
  if (!apiHealth[key]) return
  apiHealth[key].ok = false
  apiHealth[key].lastFailAt = Date.now()
}

export function useApiHealth() {
  const apiList = computed(() => ([
    { key: 'gpsdozor', label: 'GPS Dozor API', ...apiHealth.gpsdozor },
    { key: 'weather', label: 'Open-Meteo', ...apiHealth.weather },
    { key: 'geocoding', label: 'Nominatim', ...apiHealth.geocoding },
    { key: 'routing', label: 'OSRM', ...apiHealth.routing },
    { key: 'overpass', label: 'Overpass', ...apiHealth.overpass },
    { key: 'elevation', label: 'Elevation', ...apiHealth.elevation },
  ]))

  return { apiHealth, apiList }
}

export { markApiSuccess, markApiFailure }
