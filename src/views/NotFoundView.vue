<template>
  <div class="flex flex-col items-center justify-center py-24 text-center">
    <div class="text-8xl font-black text-gray-200 dark:text-gray-700 mb-4">404</div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ t('notFound.title') }}</h1>
    <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-md">{{ t('notFound.message') }}</p>
    <router-link
      to="/"
      class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      {{ t('notFound.backHome') }}
    </router-link>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
