import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

export function useDarkMode() {
  function toggle() {
    isDark.value = !isDark.value
  }

  function apply(dark) {
    if (dark) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark-body')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark-body')
    }
    localStorage.setItem('fleetview-dark', dark ? '1' : '0')
  }

  watch(isDark, apply)

  // Initialize from localStorage
  onMounted(() => {
    const saved = localStorage.getItem('fleetview-dark')
    if (saved === '1') {
      isDark.value = true
    } else if (saved === null) {
      // Respect OS preference on first visit
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    apply(isDark.value)
  })

  return { isDark, toggle }
}
