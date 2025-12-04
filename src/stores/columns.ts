import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { TaskStatus } from '../types'

const STORAGE_KEY = 'lma.columns.colors'

export const useColumnsStore = defineStore('columns', () => {
  // store colors keyed by status
  const colors = ref<Record<string, string>>({})

  // load from localStorage if present
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') colors.value = parsed
    }
  } catch (e) {
    // ignore JSON errors
    console.warn('Failed to load column colors from storage', e)
  }

  // persist changes
  watch(
    colors,
    (val) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
      } catch (e) {
        console.warn('Failed to save column colors to storage', e)
      }
    },
    { deep: true },
  )

  function setColor(status: TaskStatus | string, color: string | null) {
    if (color === null) {
      delete colors.value[String(status)]
    } else {
      colors.value[String(status)] = color
    }
  }

  function getColor(status: TaskStatus | string) {
    return computed(() => colors.value[String(status)] ?? '')
  }

  return { colors, setColor, getColor }
})
