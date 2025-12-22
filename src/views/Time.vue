<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Timeline from '@/components/Timeline.vue'
import { useTasksStore } from '@/stores/tasks'
import { useFocusStore } from '@/stores/focusSessions'

const tasksStore = useTasksStore()
const focusStore = useFocusStore()
const { activeByTask } = storeToRefs(focusStore)

const selectedTaskId = ref<number | null>(null)
const focusNotes = ref('')

const activeSession = computed(() => {
  if (selectedTaskId.value == null) return null
  return activeByTask.value[selectedTaskId.value] || null
})

const nowMs = ref(Date.now())
let ticker: number | null = null

function startTicker() {
  stopTicker()
  ticker = window.setInterval(() => {
    nowMs.value = Date.now()
  }, 1000)
}

function stopTicker() {
  if (ticker != null) {
    window.clearInterval(ticker)
    ticker = null
  }
}

const elapsedSec = computed(() => {
  if (!activeSession.value) return 0
  const started = new Date(activeSession.value.started_at).getTime()
  return Math.max(0, Math.floor((nowMs.value - started) / 1000))
})

const elapsedText = computed(() => {
  const total = elapsedSec.value
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

watch(
  () => activeSession.value?.id,
  (id) => {
    if (id) {
      nowMs.value = Date.now()
      startTicker()
    } else {
      stopTicker()
    }
  },
  { immediate: true },
)

// If there is an active session and nothing is selected, auto-select it.
watch(
  () => activeByTask.value,
  (map) => {
    if (selectedTaskId.value != null) return
    const firstActive = Object.entries(map).find(([, s]) => s)
    if (firstActive) selectedTaskId.value = Number(firstActive[0])
  },
  { immediate: true, deep: true },
)

async function startFocus() {
  if (selectedTaskId.value == null) return
  await focusStore.start(selectedTaskId.value, focusNotes.value.trim())
}

async function endFocus(success: boolean) {
  if (!activeSession.value) return
  await focusStore.stop(activeSession.value.id, success)
}

onMounted(async () => {
  if (!tasksStore.items.length) await tasksStore.fetchAll()
  await focusStore.fetchAll()
})

onBeforeUnmount(() => {
  stopTicker()
})
</script>

<template>
  <div class="page-container">
    <el-card shadow="never" class="focus-bar">
      <div class="focus-bar-inner">
        <div class="focus-bar-title">Focus</div>

        <el-select
          v-model="selectedTaskId"
          placeholder="Select a task"
          filterable
          clearable
          class="focus-select"
        >
          <el-option v-for="t in tasksStore.items" :key="t.id" :label="t.title" :value="t.id" />
        </el-select>

        <el-input
          v-model="focusNotes"
          placeholder="Notes (optional)"
          class="focus-notes"
          :disabled="!!activeSession"
        />

        <div v-if="activeSession" class="focus-status">
          <span class="focus-time">{{ elapsedText }}</span>
          <el-button type="success" @click="endFocus(true)">End</el-button>
          <el-button type="danger" plain @click="endFocus(false)">Fail</el-button>
        </div>

        <div v-else class="focus-status">
          <el-button type="primary" :disabled="selectedTaskId == null" @click="startFocus">
            Start
          </el-button>
        </div>
      </div>
    </el-card>

    <Timeline />
  </div>
</template>

<style scoped>
.focus-bar {
  margin-bottom: 12px;
}

.focus-bar-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.focus-bar-title {
  font-weight: 800;
  color: var(--el-text-color-primary);
}

.focus-select {
  min-width: 240px;
  flex: 1 1 240px;
}

.focus-notes {
  min-width: 220px;
  flex: 2 1 280px;
}

.focus-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.focus-time {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: var(--el-text-color-primary);
}
</style>
