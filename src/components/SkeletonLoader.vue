<template>
  <div class="animate-pulse space-y-4">
    <!-- Stat cards skeleton -->
    <div v-if="type === 'stats'" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in count" :key="i" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center justify-between">
          <div class="space-y-2 flex-1">
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div class="h-7 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div class="h-2.5 bg-gray-100 dark:bg-gray-700 rounded w-24"></div>
          </div>
          <div class="w-11 h-11 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    </div>

    <!-- Table skeleton -->
    <div v-else-if="type === 'table'" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
        <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>
      <div class="divide-y divide-gray-100 dark:divide-gray-700">
        <div v-for="i in count" :key="i" class="px-5 py-4 flex gap-4">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div class="h-4 bg-gray-100 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    </div>

    <!-- Map skeleton -->
    <div v-else-if="type === 'map'" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="h-[500px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <div class="text-center">
          <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">{{ t('common.loadingMap') }}</p>
        </div>
      </div>
    </div>

    <!-- Cards skeleton -->
    <div v-else-if="type === 'cards'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="i in count" :key="i" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
        <div class="flex justify-between">
          <div class="space-y-2">
            <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div class="h-3 bg-gray-100 dark:bg-gray-700 rounded w-20"></div>
          </div>
          <div class="h-6 w-14 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div class="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <div class="h-3 bg-gray-100 dark:bg-gray-700 rounded w-12"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
          <div class="space-y-1">
            <div class="h-3 bg-gray-100 dark:bg-gray-700 rounded w-16"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-14"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart skeleton -->
    <div v-else-if="type === 'chart'" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
      <div class="h-[280px] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-end justify-center gap-2 p-6">
        <div v-for="i in 12" :key="i" class="flex-1 bg-gray-200 dark:bg-gray-600 rounded-t" :style="{ height: (20 + Math.random() * 60) + '%' }"></div>
      </div>
    </div>

    <!-- Generic line skeleton -->
    <div v-else class="space-y-3">
      <div v-for="i in count" :key="i" class="h-4 bg-gray-200 dark:bg-gray-700 rounded" :style="{ width: (40 + Math.random() * 40) + '%' }"></div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

defineProps({
  type: { type: String, default: 'line' }, // stats | table | map | cards | chart | line
  count: { type: Number, default: 4 },
})
</script>
