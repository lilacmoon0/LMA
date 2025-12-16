<script setup lang="ts">
import { onMounted } from 'vue'
import TaskColumn from './TaskColumn.vue'
import { useTasksStore } from '../stores/tasks'

const tasksStore = useTasksStore()

onMounted(() => {
  if (!tasksStore.items.length) tasksStore.fetchAll()
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
    />

    <TaskColumn
      title="Doing"
      status="doing"
      :tasks="tasksStore.byStatus('doing').value"
      @edit="$emit('edit', $event)"
      @remove="tasksStore.remove($event)"
    />

    <TaskColumn
      title="Today"
      status="today"
      :tasks="tasksStore.byStatus('today').value"
      @edit="$emit('edit', $event)"
      @remove="tasksStore.remove($event)"
    />

    <TaskColumn
      title="Done"
      status="done"
      :tasks="tasksStore.byStatus('done').value"
      @edit="$emit('edit', $event)"
      @remove="tasksStore.remove($event)"
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
    scroll-snap-type: x mandatory;
    scroll-padding: 12px;
  }

  .board-wrap > :deep(.column) {
    flex: 0 0 92vw;
    min-width: 92vw;
    max-width: 92vw;
    scroll-snap-align: start;
  }
}
</style>
