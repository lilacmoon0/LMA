<script setup lang="ts">
import type { Task, TaskStatus } from '../types'
import TaskCard from './TaskCard.vue'
import { useTasksStore } from '../stores/tasks'
import { ref, computed, watch } from 'vue'
import { useColumnsStore } from '../stores/columns'
import { MoreVertical, RotateCcw, X, Plus } from 'lucide-vue-next'
import Draggable from 'vuedraggable'

const props = defineProps<{
  title: string
  status: TaskStatus
  tasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'edit', task: Task): void
  (e: 'remove', id: number): void
  (e: 'card-color', title: string): void
}>()

const tasksStore = useTasksStore()
const columnsStore = useColumnsStore()

const menuOpen = ref(false)
const addOpen = ref(false)
const newTitle = ref('')
const newDescription = ref('')
const creating = ref(false)
const addErr = ref('')

const localTasks = ref<Task[]>([])
const sorting = ref(false)

const columnColor = computed(() => columnsStore.getColor(props.status).value || '')

const palette = ['#ffffff', '#fef3c7', '#fee2e2', '#ecfccb', '#e0f2fe', '#ede9fe', '#f3f4f6']

function pickColor(color: string) {
  columnsStore.setColor(props.status, color)
  closeMenu()
}

function resetColor() {
  columnsStore.setColor(props.status, null)
  closeMenu()
}

function closeMenu() {
  menuOpen.value = false
}

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

watch(
  () => props.tasks,
  (next) => {
    if (sorting.value) return
    localTasks.value = [...(next || [])]
  },
  { immediate: true, deep: true },
)

function onSortStart() {
  sorting.value = true
}

function onSortEnd() {
  sorting.value = false
  // Re-sync to the store-derived order in case it changed during drag.
  localTasks.value = [...(props.tasks || [])]
}

async function onDragChange(evt: any) {
  // VueDraggable emits { added, removed, moved }.
  // We only need to update the store when an item is added to this column
  // or moved within this column.
  if (evt?.added?.element?.id != null) {
    await tasksStore.moveOrReorder(Number(evt.added.element.id), props.status, Number(evt.added.newIndex ?? 0))
    return
  }
  if (evt?.moved?.element?.id != null) {
    await tasksStore.moveOrReorder(Number(evt.moved.element.id), props.status, Number(evt.moved.newIndex ?? 0))
  }
}
</script>

<template>
  <el-card
    class="column"
    shadow="never"
    :body-style="{ padding: '12px' }"
    :style="columnColor ? { background: columnColor } : {}"
  >
    <template #header>
      <div class="column-header">
        <div class="col-title">
          <span class="col-title-text">{{ title }}</span>
        </div>

        <el-popover v-model:visible="menuOpen" placement="bottom-end" trigger="click" width="220">
          <template #reference>
            <el-button text circle aria-label="Column menu" title="Column menu">
              <MoreVertical :size="18" />
            </el-button>
          </template>

          <div class="menu-popover">
            <div class="color-palette">
              <template v-for="c in palette" :key="c">
                <button
                  class="swatch"
                  :style="{
                    background: c,
                    border:
                      columnColor === c
                        ? '2px solid rgba(0,0,0,0.12)'
                        : '1px solid rgba(0,0,0,0.06)',
                  }"
                  @click="pickColor(c)"
                  :title="c"
                />
              </template>
            </div>

            <div class="menu-actions">
              <el-button
                size="small"
                @click="resetColor"
                aria-label="Reset color"
                title="Reset color"
              >
                <RotateCcw :size="16" />
              </el-button>
              <el-button size="small" @click="closeMenu" aria-label="Close menu" title="Close menu">
                <X :size="16" />
              </el-button>
            </div>
          </div>
        </el-popover>
      </div>
    </template>

    <Draggable
      class="list"
      :list="localTasks"
      item-key="id"
      group="tasks"
      :animation="150"
      :delay="220"
      :delay-on-touch-only="true"
      :force-fallback="true"
      @start="onSortStart"
      @end="onSortEnd"
      @change="onDragChange"
    >
      <template #item="{ element }">
        <div class="card-row">
          <TaskCard :task="element" @edit="emit('edit', $event)" @remove="emit('remove', $event)" />
        </div>
      </template>

      <template #footer>
        <div class="add-area">
          <div v-if="addOpen" class="add-form">
            <el-card shadow="never" class="add-inner">
              <el-space direction="vertical" size="small" fill>
                <el-input v-model="newTitle" placeholder="Task title" />
                <el-input v-model="newDescription" placeholder="Description (optional)" />

                <div class="add-actions">
                  <el-button type="primary" :loading="creating" @click="createTask">
                    <Plus :size="16" />
                    <span style="margin-left: 6px">Add</span>
                  </el-button>
                  <el-button @click="addOpen = false">
                    <X :size="16" />
                    <span style="margin-left: 6px">Cancel</span>
                  </el-button>
                </div>

                <el-alert v-if="addErr" :title="addErr" type="error" show-icon />
              </el-space>
            </el-card>
          </div>

          <div v-else class="add-inner">
            <el-button text class="add-new" @click="toggleAdd">
              <Plus :size="16" />
              <span style="margin-left: 6px">Add new task</span>
            </el-button>
          </div>
        </div>
      </template>
    </Draggable>
  </el-card>
</template>

<style scoped>
.column {
  background: var(--el-fill-color-lighter);
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
}

.column.is-drop-target {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}
.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.col-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.col-title-text {
  font-weight: 700;
  line-height: 1.2;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-height: 0;
  overflow: auto;
  max-height: 70vh;
  touch-action: pan-y;
}

.card-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.add-area {
  width: 100%;
  margin-top: auto;
  margin-bottom: 4px;
}

.add-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.add-inner {
  box-sizing: border-box;
  width: 100%;
}
.menu-popover {
  display: flex;
  flex-direction: column;
}
.color-palette {
  display: flex;
  gap: 6px;
}
.menu-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}
.swatch {
  width: 28px;
  height: 20px;
  border-radius: 4px;
  cursor: pointer;
}

:deep(.el-card__header) {
  padding: 10px 12px;
}
</style>
