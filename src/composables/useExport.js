/**
 * Composable for exporting data to CSV format.
 */
export function useExport() {
  /**
   * Export an array of objects to CSV and trigger download.
   * @param {Array<Object>} data - Array of objects to export
   * @param {string} filename - File name (without .csv extension)
   * @param {Object} [headerMap] - Optional mapping of object keys to display headers
   */
  function exportCSV(data, filename, headerMap = null) {
    if (!data || data.length === 0) return

    const keys = Object.keys(data[0])
    const headers = keys.map(k => headerMap?.[k] || k)

    const csvLines = [
      headers.join(';'),
      ...data.map(row =>
        keys.map(k => {
          const val = row[k] ?? ''
          // Escape values with quotes if they contain separator, newline, or quotes
          const str = String(val)
          if (str.includes(';') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        }).join(';')
      ),
    ]

    const csvContent = '\uFEFF' + csvLines.join('\n') // BOM for UTF-8
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  return { exportCSV }
}
