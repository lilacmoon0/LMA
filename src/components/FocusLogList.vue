<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFocusStore } from '@/stores/focusSessions'
import { useTasksStore } from '@/stores/tasks'

const auth = useAuthStore()
const focusStore = useFocusStore()
const tasksStore = useTasksStore()

const isAuthed = computed(() => auth.isAuthenticated)
const isLoading = ref(false)

function taskTitle(taskId: number) {
  const task = tasksStore.items.find((t) => t.id === taskId)
  return task?.title || `Task #${taskId}`
}

function fmtDateTime(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return ''
  return d.toLocaleString()
}

const sessionsSorted = computed(() => {
  return [...focusStore.sessions].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
  )
})

onMounted(async () => {
  if (!isAuthed.value) return
  isLoading.value = true
  try {
    if (!tasksStore.items.length) await tasksStore.fetchAll()
    await focusStore.fetchAll()
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <el-card class="focus-log" shadow="never">
    <template #header>
      <div class="focus-log__header">
        <div class="focus-log__title">Focus Log</div>
        <div class="focus-log__meta">{{ sessionsSorted.length }} sessions</div>
      </div>
    </template>

    <el-skeleton v-if="isLoading" :rows="6" animated />

    <el-empty v-else-if="sessionsSorted.length === 0" description="No focus sessions yet." />

    <el-table v-else :data="sessionsSorted" size="small" table-layout="fixed">
      <el-table-column label="Task" min-width="220">
        <template #default="{ row }">
          <span class="focus-log__task">{{ taskTitle(row.task) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Start" min-width="180">
        <template #default="{ row }">{{ fmtDateTime(row.started_at) }}</template>
      </el-table-column>

      <el-table-column label="End" min-width="180">
        <template #default="{ row }">{{ row.ended_at ? fmtDateTime(row.ended_at) : 'Active' }}</template>
      </el-table-column>

      <el-table-column label="Minutes" width="90" align="right">
        <template #default="{ row }">{{ row.duration_minutes || 0 }}</template>
      </el-table-column>

      <el-table-column label="Success" width="95" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.ended_at" :type="row.success ? 'success' : 'danger'" effect="light">
            {{ row.success ? 'Yes' : 'No' }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column label="Notes" min-width="240">
        <template #default="{ row }">
          <span class="focus-log__notes">{{ row.notes || '' }}</span>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style scoped>
.focus-log {
  margin-top: 12px;
}

.focus-log__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.focus-log__title {
  font-weight: 800;
}

.focus-log__meta {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.focus-log__task {
  font-weight: 600;
}

.focus-log__notes {
  color: var(--el-text-color-secondary);
}
</style>
