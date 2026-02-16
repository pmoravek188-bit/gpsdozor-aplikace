import { reactive } from 'vue'

const toasts = reactive([])
let nextId = 0

export function useToast() {
  function addToast(message, type = 'info', duration = 3000) {
    const id = nextId++
    toasts.push({ id, message, type })

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  function removeToast(id) {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx >= 0) toasts.splice(idx, 1)
  }

  function success(message, duration = 3000) {
    return addToast(message, 'success', duration)
  }

  function error(message, duration = 5000) {
    return addToast(message, 'error', duration)
  }

  function info(message, duration = 3000) {
    return addToast(message, 'info', duration)
  }

  /**
   * Universal showToast(message, type) — used by views for CSV export etc.
   */
  function showToast(message, type = 'info', duration) {
    return addToast(message, type, duration)
  }

  return { toasts, showToast, success, error, info, removeToast }
}
