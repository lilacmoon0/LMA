<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { Calendar } from 'v-calendar'
import 'v-calendar/style.css'
import { useFocusStore } from '../stores/focusSessions'

// Props
interface Range { start: Date; end: Date }
const props = defineProps<{
  modelValue?: Date | Date[] | Range | null
  attributes?: Array<Record<string, unknown>>
  expanded?: boolean
}>()

// Emits v-model updates
const emit = defineEmits<{
  (e: 'update:modelValue', value: Date | Date[] | Range | null): void
}>()

const value = ref<Date | Date[] | Range | null>(props.modelValue ?? new Date())
watch(() => props.modelValue, (v) => { value.value = v ?? null })
watch(value, (v) => emit('update:modelValue', v))

const attributes = ref(props.attributes ?? [])
const isExpanded = props.expanded ?? true

// Pull focus sessions and build day attributes
const focusStore = useFocusStore()
onMounted(() => {
  if (!focusStore.sessions.length) {
    focusStore.fetchAll().catch(() => {})
  }
})

type DayAgg = { minutes: number; count: number }
const focusByDay = computed<Record<string, DayAgg>>(() => {
  const map: Record<string, DayAgg> = {}
  for (const s of focusStore.sessions) {
    if (!s.started_at) continue
    const d = new Date(s.started_at)
    // Use local date string YYYY-MM-DD
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!map[key]) map[key] = { minutes: 0, count: 0 }
    map[key].minutes += s.duration_minutes || 0
    map[key].count += 1
  }
  return map
})

function intensityColor(mins: number) {
  if (mins <= 0) return null
  if (mins <= 10) return '#e66666' // abandoned/red
  if (mins <= 30) return '#A5D6A7' // medium/green-light
  if (mins <= 180) return '#66BB6A' // high/green
  return '#2E7D32' // intense/green-dark
}

const focusAttributes = computed(() => {
  const list: Array<Record<string, unknown>> = []
  for (const [dateStr, agg] of Object.entries(focusByDay.value)) {
    const color = intensityColor(agg.minutes)
    if (!color) continue
    list.push({
      key: `focus-${dateStr}`,
      dates: new Date(`${dateStr}T00:00:00`),
      dot: { color },
      popover: { label: `${agg.count} sessions · ${agg.minutes} min` },
    })
  }
  return list
})

const mergedAttributes = computed(() => [
  ...(attributes.value ?? []),
  ...focusAttributes.value,
])
</script>

<template>
  <div class="calendar-wrap">
    <Calendar
      v-model="value"
      :attributes="mergedAttributes"
      :is-expanded="isExpanded"

    />
  </div>
</template>

<style scoped>
.calendar-wrap {
  width: 100%;
  transform: scale(2);
  transform-origin: top left;
}
</style>