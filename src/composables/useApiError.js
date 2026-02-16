import { useI18n } from 'vue-i18n'
import { useToast } from './useToast'

export function useApiError() {
  const { t } = useI18n()
  const { showToast } = useToast()

  function handleApiError(error, i18nKey = 'errors.generic', fallback = 'Request failed') {
    const message = t(i18nKey) || fallback
    showToast(message, 'error')
    console.error(fallback, error)
  }

  return { handleApiError }
}
