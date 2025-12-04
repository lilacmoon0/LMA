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
  <div class="board">
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
      title="Today Doing"
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
.board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  width: 100%;
  padding: 0 12px;
  box-sizing: border-box;
}
</style>
*** End Patch
