<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ label }}</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1 stat-value">{{ value }}</p>
        <p v-if="subtitle" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ subtitle }}</p>
      </div>
      <div :class="['w-11 h-11 rounded-xl flex items-center justify-center', iconClasses]">
        <slot name="icon" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  subtitle: { type: String, default: '' },
  colorClass: { type: String, default: 'bg-blue-50 text-blue-600' },
})

// Auto-generate dark mode classes from the colorClass (e.g. bg-blue-50 → dark:bg-blue-900/20)
const iconClasses = computed(() => {
  const darkMap = {
    'bg-blue-50':   'dark:bg-blue-900/20',
    'bg-green-50':  'dark:bg-green-900/20',
    'bg-amber-50':  'dark:bg-amber-900/20',
    'bg-red-50':    'dark:bg-red-900/20',
    'bg-cyan-50':   'dark:bg-cyan-900/20',
    'bg-purple-50': 'dark:bg-purple-900/20',
    'bg-orange-50': 'dark:bg-orange-900/20',
  }
  let classes = props.colorClass
  for (const [light, dark] of Object.entries(darkMap)) {
    if (classes.includes(light)) {
      classes += ` ${dark}`
      break
    }
  }
  return classes
})
</script>
