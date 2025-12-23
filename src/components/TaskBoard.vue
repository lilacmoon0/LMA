<script setup lang="ts">
import { onMounted } from 'vue'
import TaskColumn from './TaskColumn.vue'
import { useTasksStore } from '../stores/tasks'
import { useFocusStore } from '../stores/focusSessions'
import { useAuthStore } from '../stores/auth'

const tasksStore = useTasksStore()
const focusStore = useFocusStore()
const authStore = useAuthStore()

onMounted(() => {
  if (!tasksStore.items.length) tasksStore.fetchAll()
  if (authStore.isAuthenticated && !focusStore.sessions.length) focusStore.fetchAll()
})
</script>

<template>
  <div class="board-wrap" aria-label="Task board">
    <TaskColumn
      title="To Do"
      status="todo"
      :tasks="tasksStore.byStatus('todo').value"
      @edit="$emit('edit', $event)"
      @remove="tasksStore.remove($event)"
      default-color="#ede9fe"
    />

    <TaskColumn
      title="Doing"
      status="doing"
      :tasks="tasksStore.byStatus('doing').value"
      @edit="$emit('edit', $event)"
      @remove="tasksStore.remove($event)"
      default-color="#e0f2fe"
    />

    <TaskColumn
      title="Today"
      status="today"
      :tasks="tasksStore.byStatus('today').value"
      @edit="$emit('edit', $event)"
      @remove="tasksStore.remove($event)"
      default-color="#fee2e2"
    />

    <TaskColumn
      title="Done"
      status="done"
      :tasks="tasksStore.byStatus('done').value"
      @edit="$emit('edit', $event)"
      @remove="tasksStore.remove($event)"
      default-color="#ecfccb"
    />
  </div>
</template>

<style scoped>
.board-wrap {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 6px 2px 12px;
  box-sizing: border-box;
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
  width: 100%;
}

.board-wrap > :deep(.column) {
  flex: 1 1 0;
  min-width: 320px;
}

@media (max-width: 768px) {
  .board-wrap {
    padding: 2px 0 10px;
  }

  .board-wrap > :deep(.column) {
    flex: 0 0 92vw;
    min-width: 92vw;
    max-width: 92vw;
  }
}
</style>
