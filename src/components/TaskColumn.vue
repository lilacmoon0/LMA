<script setup lang="ts">
import type { Task, TaskStatus } from '../types'
import TaskCard from './TaskCard.vue'
import { useTasksStore } from '../stores/tasks'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  title: string
  status: TaskStatus
  tasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'edit', task: Task): void
  (e: 'remove', id: number): void
  (e: 'edit-column', title: string): void
}>()

const tasksStore = useTasksStore()

const menuOpen = ref(false)
const headerRef = ref<HTMLElement | null>(null)
const addOpen = ref(false)
const newTitle = ref('')
const newDescription = ref('')
const creating = ref(false)
const addErr = ref('')

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function onDocClick(e: MouseEvent) {
  const target = e.target as Node
  if (headerRef.value && !headerRef.value.contains(target)) {
    closeMenu()
  }
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

function toggleAdd() {
  addOpen.value = !addOpen.value
}

async function createTask() {
  if (!newTitle.value.trim()) return
  creating.value = true
  addErr.value = ''
  try {
    await tasksStore.create({
      title: newTitle.value.trim(),
      description: newDescription.value.trim(),
      status: props.status,
      progress: 0,
      estimated_minutes: 0,
    })
    newTitle.value = ''
    newDescription.value = ''
    addOpen.value = false
  } catch (e: unknown) {
    addErr.value = e instanceof Error ? e.message : String(e)
  } finally {
    creating.value = false
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  e.dataTransfer && (e.dataTransfer.dropEffect = 'move')
}

async function onDrop(e: DragEvent) {
  e.preventDefault()
  const idStr = e.dataTransfer?.getData('text/task-id')
  const id = idStr ? Number(idStr) : NaN
  if (!isNaN(id)) {
    await tasksStore.moveTo(id, props.status)
  }
}
</script>

<template>
  <section class="column" @dragover="onDragOver" @drop="onDrop">
    <header class="column-header" ref="headerRef">
      <h3>{{ title }}</h3>
      <div style="display: flex; align-items: center; justify-content: center">
        <div class="col-menu">
          <button
            class="menu-toggle"
            @click.stop="toggleMenu"
            aria-haspopup="true"
            :aria-expanded="menuOpen"
          >
            …
          </button>
          <div v-if="menuOpen" class="menu-popover">
            <button class="menu-item" @click="() => (closeMenu(), emit('edit-column', title))">
              Edit
            </button>
          </div>
        </div>
      </div>
    </header>
    <div class="list">
      <TaskCard
        v-for="t in tasks"
        :key="t.id"
        :task="t"
        @edit="emit('edit', $event)"
        @remove="emit('remove', $event)"
      />
      <div class="add-area">
        <div v-if="addOpen" class="add-form">
          <input v-model="newTitle" placeholder="Task title" />
          <input v-model="newDescription" placeholder="Description (optional)" />
          <div class="add-actions">
            <button @click="createTask" :disabled="creating">Add</button>
            <button @click="() => (addOpen = false)">Cancel</button>
          </div>
          <p v-if="addErr" class="error">{{ addErr }}</p>
        </div>
        <button v-else class="add-new" @click="toggleAdd">+ Add new task</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.column {
  background: #f9fafb;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
  min-width: 220px;
  width: 100%;
}
.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.count {
  color: #6b7280;
  font-size: 12px;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1 1 auto;
  min-height: 0; /* allow proper scrolling inside flex */
  overflow: auto;
}

.add-area {
  margin-top: 6px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 4px;
  /* stay at the bottom of the column when there's extra space */
  margin-top: auto;
}
.add-new {
  width: 100%;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px dashed #d1d5db;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
}
.add-form input {
  width: 100%;
  padding: 6px 8px;
  margin-bottom: 6px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  height: 34px;
  line-height: 1.2;
}

/* ensure inputs/buttons don't exceed card/column width */
.add-area,
.add-form,
.add-new,
.add-form input,
.add-actions button {
  box-sizing: border-box;
  max-width: 100%;
}
.add-actions {
  display: flex;
  gap: 8px;
}
.add-actions button:first-child {
  background: #10b981;
  color: white;
  border: none;
  padding: 5px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.add-actions button:last-child {
  background: transparent;
  border: 1px solid #d1d5db;
  padding: 5px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.error {
  color: #b91c1c;
  margin-top: 6px;
}

.col-menu {
  position: relative;
}
.menu-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}
.menu-popover {
  position: absolute;
  right: 0;
  top: 28px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.06);
  padding: 6px;
  z-index: 20;
  display: flex;
  flex-direction: column;
}
.menu-item {
  background: transparent;
  border: none;
  padding: 6px 10px;
  text-align: left;
  cursor: pointer;
}
</style>
