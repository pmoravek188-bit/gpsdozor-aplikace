<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
    <!-- Vehicle selection -->
    <div>
      <label for="vehicle-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('selector.vehicle') }}</label>
      <select
        id="vehicle-select"
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
        class="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="">{{ t('selector.selectVehicle') }}</option>
        <option v-for="v in fleetStore.vehicles" :key="v.vehicleCode" :value="v.vehicleCode">
          {{ v.name || v.vehicleCode }} ({{ v.licensePlate }})
        </option>
      </select>
    </div>

    <!-- Date From -->
    <div>
      <label for="date-from" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('selector.from') }}</label>
      <input
        type="datetime-local"
        id="date-from"
        :value="formatDateForInput(from)"
        @change="$emit('update:from', $event.target.value)"
        class="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>

    <!-- Date To -->
    <div>
      <label for="date-to" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('selector.to') }}</label>
      <input
        type="datetime-local"
        id="date-to"
        :value="formatDateForInput(to)"
        @change="$emit('update:to', $event.target.value)"
        class="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>

    <!-- Load button -->
    <button
      @click="$emit('load')"
      :disabled="!modelValue || loading"
      class="w-full inline-flex items-center justify-center gap-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {{ loading ? t('app.loading') : t('selector.load') }}
    </button>
  </div>
</template>

<script setup>
import { useFleetStore } from '../stores/fleet'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'

const fleetStore = useFleetStore()
const { t } = useI18n()

const props = defineProps({
  modelValue: { type: String, default: '' },
  from: { type: String, default: '' },
  to: { type: String, default: '' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'update:from', 'update:to', 'load'])

function formatDateForInput(dateString) {
  if (!dateString) return ''
  // Format for datetime-local input (YYYY-MM-DDTHH:mm)
  // Note: datetime-local doesn't support seconds, but we'll normalize when sending to API
  return dayjs(dateString).format('YYYY-MM-DDTHH:mm')
}
</script>
