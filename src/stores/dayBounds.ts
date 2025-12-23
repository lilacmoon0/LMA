import { defineStore } from 'pinia'
import { ref } from 'vue'

export type DayBounds = {
  wake: string // HH:MM
  sleep: string // HH:MM
}

export const useDayBoundsStore = defineStore('day-bounds', () => {
  const bounds = ref<DayBounds | null>(null)

  function get(): DayBounds | null {
    return bounds.value
  }

  function set(next: DayBounds) {
    bounds.value = next
  }

  function clear() {
    bounds.value = null
  }

  return {
    bounds,
    get,
    set,
    clear,
  }
})
