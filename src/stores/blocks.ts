import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { http, endpoints } from '../api/client'
import type { Block, Paginated } from '../types'

export const useBlocksStore = defineStore('blocks', () => {
  const items = ref<Block[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sortedByDate = computed(() => {
    return [...items.value].sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    )
  })

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const res = await http.get<Paginated<Block> | Block[]>(endpoints.blocks)
      items.value = Array.isArray(res) ? res : (res?.results ?? [])
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function create(payload: Partial<Block>) {
    const created = await http.post<Block>(endpoints.blocks, payload)
    items.value.unshift(created)
    return created
  }

  async function update(id: number, payload: Partial<Block>) {
    const updated = await http.patch<Block>(`${endpoints.blocks}${id}/`, payload)
    const idx = items.value.findIndex((b) => b.id === id)
    if (idx >= 0) items.value[idx] = updated
    return updated
  }

  async function remove(id: number) {
    await http.delete<void>(`${endpoints.blocks}${id}/`)
    items.value = items.value.filter((b) => b.id !== id)
  }

  function clear() {
    items.value = []
    loading.value = false
    error.value = null
  }

  return {
    items,
    loading,
    error,
    sortedByDate,
    fetchAll,
    create,
    update,
    remove,
    clear,
  }
})
