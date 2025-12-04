<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import type { Task } from '../types'
import { useFocusStore } from '../stores/focusSessions'
import FocusWidget from './FocusWidget.vue'
import { useTasksStore } from '../stores/tasks'

const props = defineProps<{ task: Task }>()

const emit = defineEmits<{
  (e: 'edit', task: Task): void
  (e: 'remove', id: number): void
}>()

const focusStore = useFocusStore()
const tasksStore = useTasksStore()

const focusedMinutes = computed(() => focusStore.totalMinutesForTask(props.task.id))

const progressStyle = computed(() => ({
  width: `${Math.min(100, Math.max(0, props.task.progress))}%`,
}))

// Edit modal state
const editing = ref(false)
const editTitle = ref('')
const editDescription = ref('')
const editProgress = ref<number>(0)
const editEstimated = ref<number>(0)
const saving = ref(false)
const editError = ref('')
const titleRef = ref<HTMLInputElement | null>(null)

watch(
  () => props.task,
  (t) => {
    if (!t) return
    editTitle.value = t.title || ''
    editDescription.value = t.description || ''
    editProgress.value = t.progress ?? 0
    editEstimated.value = t.estimated_minutes ?? 0
  },
  { immediate: true },
)

function openEdit() {
  editError.value = ''
  editing.value = true
  nextTick(() => titleRef.value?.focus())
}

function closeEdit() {
  editing.value = false
}

async function saveEdit() {
  if (!props.task) return
  saving.value = true
  editError.value = ''
  try {
    const updated = await tasksStore.update(props.task.id, {
      title: editTitle.value.trim(),
      description: editDescription.value.trim(),
      progress: Number(editProgress.value) || 0,
      estimated_minutes: Number(editEstimated.value) || 0,
    })
    emit('edit', updated)
    editing.value = false
  } catch (e: any) {
    editError.value = e?.message ?? String(e)
  } finally {
    saving.value = false
  }
}

function onDragStart(e: DragEvent) {
  if (!e.dataTransfer) return
  e.dataTransfer.setData('text/task-id', String(props.task.id))
  e.dataTransfer.effectAllowed = 'move'
}
</script>

<template>
  <div class="card" draggable="true" @dragstart="onDragStart">
    <div class="card-header">
      <h4 class="title">
        <router-link :to="`/tasks/${task.id}`">{{ task.title }}</router-link>
      </h4>
      <div class="actions">
        <button class="icon" title="Edit" @click="openEdit">✏️</button>
        <button class="icon" title="Delete" @click="emit('remove', task.id)">X</button>
      </div>
    </div>
    <p class="desc" v-if="task.description">{{ task.description }}</p>

    <div class="progress">
      <div class="bar" :style="progressStyle"></div>
    </div>
    <div class="meta">
      <span>Progress: {{ task.progress }}%</span>
      <span>Est: {{ task.estimated_minutes }}m</span>
      <span>Focused: {{ focusedMinutes }}m</span>
    </div>

    <FocusWidget :task-id="task.id" />

    <div v-if="editing" class="edit-panel">
      <div class="edit-panel-inner">
        <div class="edit-row">
          <div class="edit-col">
            <label class="lbl">Title</label>
            <input ref="titleRef" v-model="editTitle" class="small-input" />
          </div>
        </div>

        <div class="edit-row">
          <label class="lbl">Description</label>
          <textarea v-model="editDescription" rows="2" class="small-textarea"></textarea>
        </div>

        <div class="edit-row fields-row">
          <div class="edit-col small">
            <label class="lbl">Progress %</label>
            <input
              type="number"
              v-model.number="editProgress"
              min="0"
              max="100"
              class="small-input"
            />
          </div>
          <div class="edit-col small">
            <label class="lbl">Est. minutes</label>
            <input type="number" v-model.number="editEstimated" min="0" class="small-input" />
          </div>
        </div>

        <div class="edit-actions">
          <button class="btn-save" @click="saveEdit" :disabled="saving">Save</button>
          <button class="btn-cancel" @click="closeEdit">Cancel</button>
        </div>
        <p v-if="editError" class="error">{{ editError }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.title {
  margin: 0;
  font-size: 14px;
  cursor: pointer;
}
.actions {
  display: flex;
  gap: 4px;
}
.icon {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
}
.desc {
  color: #4b5563;
  font-size: 12px;
  margin: 0;
}
.progress {
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}
.bar {
  height: 100%;
  background: linear-gradient(90deg, #34d399, #10b981);
}
.meta {
  display: flex;
  gap: 12px;
  color: #6b7280;
  font-size: 12px;
}
</style>
<style scoped>
.card {
  width: 100%;
  box-sizing: border-box;
  transition:
    box-shadow 0.12s ease,
    transform 0.08s ease;
}
.card:hover {
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.08);
  transform: translateY(-2px);
}
.desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-header .title a {
  color: inherit;
  text-decoration: none;
}
.card-header .title a:hover {
  text-decoration: underline;
}
.progress {
  height: 8px;
}
.meta {
  align-items: center;
}
/* edit modal overlay */
.card {
  position: relative;
}
.edit-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.28);
  border-radius: 8px;
  padding: 8px;
  box-sizing: border-box;
}
.edit-content {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 8px 32px rgba(2, 6, 23, 0.12);
}
.edit-content .field {
  margin-bottom: 8px;
}
.edit-content label {
  display: block;
  font-size: 12px;
  color: #374151;
  margin-bottom: 4px;
}
.edit-content input,
.edit-content textarea {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.fields-row {
  display: flex;
  gap: 8px;
}
.field.small {
  flex: 1;
}
.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
/* inline edit panel styles */
.edit-panel {
  background: #ffffff;
  border: 1px solid #eaeef2;
  border-radius: 8px;
  padding: 10px;
  margin-top: 8px;
}
.edit-panel-inner {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.edit-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.edit-col {
  flex: 1;
}
.lbl {
  font-size: 12px;
  color: #374151;
  margin-bottom: 4px;
  display: block;
}
.small-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
}
.small-textarea {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
}
.btn-save {
  background: #10b981;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-cancel {
  background: transparent;
  border: 1px solid #e5e7eb;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}
</style>
<style>
.card {
  cursor: grab;
}
.card:active {
  cursor: grabbing;
}
</style>
