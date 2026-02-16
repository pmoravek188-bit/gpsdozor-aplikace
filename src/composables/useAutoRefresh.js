import { ref, onUnmounted, computed } from 'vue'

/**
 * Auto-refresh composable with visual countdown
 * @param {Function} callback - function to call on each refresh
 * @param {number} defaultInterval - default interval in seconds (0 = off)
 */
export function useAutoRefresh(callback, defaultInterval = 0) {
  const intervalSeconds = ref(defaultInterval)
  const secondsLeft = ref(0)
  const isActive = computed(() => intervalSeconds.value > 0)
  let countdownId = null

  function start() {
    stop()
    if (intervalSeconds.value <= 0) return

    secondsLeft.value = intervalSeconds.value

    countdownId = setInterval(() => {
      secondsLeft.value--
      if (secondsLeft.value <= 0) {
        secondsLeft.value = intervalSeconds.value
        callback()
      }
    }, 1000)
  }

  function stop() {
    if (countdownId) clearInterval(countdownId)
    countdownId = null
    secondsLeft.value = 0
  }

  function setInterval_(seconds) {
    intervalSeconds.value = seconds
    if (seconds > 0) {
      start()
    } else {
      stop()
    }
  }

  function refresh() {
    callback()
    if (isActive.value) {
      secondsLeft.value = intervalSeconds.value
    }
  }

  onUnmounted(() => stop())

  return {
    intervalSeconds,
    secondsLeft,
    isActive,
    start,
    stop,
    setInterval: setInterval_,
    refresh,
  }
}
