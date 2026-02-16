import { computed } from 'vue'
import { useDarkMode } from './useDarkMode'

/**
 * Provides reactive Chart.js theme options that adapt to dark mode.
 * Merge the returned defaults into your chart options.
 */
export function useChartTheme() {
  const { isDark } = useDarkMode()

  const chartColors = computed(() => ({
    text: isDark.value ? '#d1d5db' : '#374151',       // gray-300 / gray-700
    grid: isDark.value ? '#374151' : '#e5e7eb',       // gray-700 / gray-200
    tooltip: isDark.value ? '#1f2937' : '#ffffff',     // gray-800 / white
    tooltipText: isDark.value ? '#f3f4f6' : '#111827', // gray-100 / gray-900
  }))

  /** Base scale config for dark-mode-aware charts */
  const scaleDefaults = computed(() => ({
    ticks: { color: chartColors.value.text },
    grid: { color: chartColors.value.grid },
    title: { color: chartColors.value.text },
  }))

  /** Base plugin config */
  const pluginDefaults = computed(() => ({
    legend: {
      labels: { color: chartColors.value.text },
    },
    tooltip: {
      backgroundColor: chartColors.value.tooltip,
      titleColor: chartColors.value.tooltipText,
      bodyColor: chartColors.value.tooltipText,
      borderColor: chartColors.value.grid,
      borderWidth: 1,
    },
  }))

  /**
   * Build chart options merging user opts with dark mode defaults.
   * Call this as a computed so it's reactive.
   */
  function buildOptions(userOpts = {}) {
    const sd = scaleDefaults.value
    const pd = pluginDefaults.value

    const scales = {}
    if (userOpts.scales) {
      for (const [key, val] of Object.entries(userOpts.scales)) {
        scales[key] = {
          ...val,
          ticks: { ...sd.ticks, ...val.ticks },
          grid: { ...sd.grid, ...val.grid },
          title: val.title ? { ...sd.title, ...val.title } : undefined,
        }
      }
    } else {
      scales.x = { ...sd }
      scales.y = { ...sd }
    }

    const plugins = {
      ...pd,
      ...userOpts.plugins,
      legend: { ...pd.legend, ...userOpts.plugins?.legend },
      tooltip: { ...pd.tooltip, ...userOpts.plugins?.tooltip },
    }

    return {
      ...userOpts,
      scales,
      plugins,
    }
  }

  return { isDark, chartColors, scaleDefaults, pluginDefaults, buildOptions }
}
