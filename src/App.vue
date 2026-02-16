<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
    <!-- Top Navigation -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
      <div class="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-2">
            <div class="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span class="text-lg font-bold text-gray-900 dark:text-white">{{ t('app.title') }}</span>
          </router-link>

          <!-- Navigation links -->
          <nav class="hidden md:flex items-center gap-1">
            <router-link
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="isActive(link.to)
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'"
            >
              <span class="flex items-center gap-1.5">
                <component :is="link.icon" class="w-4 h-4" />
                {{ t(link.labelKey) }}
              </span>
            </router-link>
          </nav>

          <!-- Right side controls -->
          <div class="flex items-center gap-2">
            <!-- Dark mode toggle -->
            <button
              @click="toggle"
              class="p-2 rounded-lg transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
              :title="isDark ? 'Light mode' : 'Dark mode'"
              :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <!-- Language switcher -->
            <div class="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
              <button
                @click="switchLocale('cs')"
                :class="[
                  'px-2 py-1 rounded-md text-xs font-medium transition-all',
                  locale === 'cs'
                    ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                ]"
              >
                🇨🇿 CZ
              </button>
              <button
                @click="switchLocale('en')"
                :class="[
                  'px-2 py-1 rounded-md text-xs font-medium transition-all',
                  locale === 'en'
                    ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                ]"
              >
                🇬🇧 EN
              </button>
            </div>

            <!-- Group selector -->
            <select
              v-if="fleetStore.groups.length > 0"
              :value="fleetStore.activeGroupCode"
              @change="fleetStore.selectGroup($event.target.value)"
              class="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option v-for="g in fleetStore.groups" :key="g.groupCode" :value="g.groupCode">
                {{ g.name || g.groupCode }}
              </option>
            </select>

            <!-- Mobile menu button -->
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
              :title="mobileMenuOpen ? 'Close menu' : 'Open menu'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <Transition name="slide-down">
        <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div class="px-4 py-2 space-y-1">
            <router-link
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 rounded-lg text-sm font-medium"
              :class="isActive(link.to) ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'"
            >
              {{ t(link.labelKey) }}
            </router-link>
          </div>
        </div>
      </Transition>
    </header>

    <!-- Main content -->
    <main class="flex-1">
      <div class="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <!-- Loading state -->
        <div v-if="fleetStore.loading && fleetStore.vehicles.length === 0" class="flex items-center justify-center py-20">
          <div class="flex flex-col items-center gap-3">
            <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">{{ t('app.loading') }}</p>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="fleetStore.error && fleetStore.vehicles.length === 0" class="flex items-center justify-center py-20">
          <div class="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl text-sm">
            {{ fleetStore.error }}
          </div>
        </div>

        <!-- Router view with transitions -->
        <router-view v-else v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto transition-colors">
      <div class="max-w-[1600px] mx-auto px-4 sm:px-6 py-3">
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 dark:text-gray-500">
          <div class="flex items-center gap-3">
            <span class="font-medium text-gray-500 dark:text-gray-400">FleetView</span>
            <span>Vue 3 + Pinia + Leaflet + Chart.js</span>
          </div>
          <div class="flex items-center gap-3">
            <span v-for="api in apiList" :key="api.key" class="flex items-center gap-1">
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="api.ok === true ? 'bg-green-400' : api.ok === false ? 'bg-red-400' : 'bg-gray-300 dark:bg-gray-600'"
              ></span>
              {{ api.label }}
            </span>
          </div>
        </div>
      </div>
    </footer>

    <!-- Toast notifications -->
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, onMounted, h, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useFleetStore } from './stores/fleet'
import { useDarkMode } from './composables/useDarkMode'
import { useApiHealth } from './composables/useApiHealth'
import ToastContainer from './components/ToastContainer.vue'

const { t, locale } = useI18n({ useScope: 'global' })
const fleetStore = useFleetStore()
const route = useRoute()
const mobileMenuOpen = ref(false)
const { isDark, toggle } = useDarkMode()
const { apiList } = useApiHealth()

function switchLocale(lang) {
  locale.value = lang
  localStorage.setItem('fleetview-locale', lang)
  document.documentElement.lang = lang
}

// Dynamic page title
watch(() => route.name, (name) => {
  const titles = {
    Dashboard: t('nav.dashboard'),
    Vehicles: t('nav.vehicles'),
    VehicleDetail: t('nav.vehicles'),
    Trips: t('nav.trips'),
    EcoDriving: t('nav.ecoDriving'),
    Sensors: t('nav.sensors'),
  }
  document.title = (titles[name] || name || 'FleetView') + ' | FleetView'
}, { immediate: true })

// Simple SVG icon components
const IconDashboard = (_, { attrs }) => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', ...attrs },
  [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' })]
)
const IconTruck = (_, { attrs }) => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', ...attrs },
  [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z' }),
   h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' })]
)
const IconRoute = (_, { attrs }) => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', ...attrs },
  [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' })]
)
const IconChart = (_, { attrs }) => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', ...attrs },
  [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })]
)
const IconGauge = (_, { attrs }) => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', ...attrs },
  [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 10V3L4 14h7v7l9-11h-7z' })]
)

const navLinks = [
  { to: '/', labelKey: 'nav.dashboard', icon: IconDashboard },
  { to: '/vehicles', labelKey: 'nav.vehicles', icon: IconTruck },
  { to: '/trips', labelKey: 'nav.trips', icon: IconRoute },
  { to: '/eco-driving', labelKey: 'nav.ecoDriving', icon: IconChart },
  { to: '/sensors', labelKey: 'nav.sensors', icon: IconGauge },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

onMounted(async () => {
  document.documentElement.lang = locale.value
  await fleetStore.fetchGroups()
  if (fleetStore.activeGroupCode) {
    await fleetStore.fetchVehicles(fleetStore.activeGroupCode)
  }
})
</script>

<style>
/* Page transition */
.page-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Mobile menu slide */
.slide-down-enter-active {
  transition: all 0.2s ease-out;
}
.slide-down-leave-active {
  transition: all 0.15s ease-in;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
