<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDaySummaryStore } from '../stores/daySummaries'
import { Save } from 'lucide-vue-next'

const store = useDaySummaryStore()
const text = ref('')

onMounted(async () => {
  const s = await store.fetchToday()
  text.value = s?.summary_text || ''
})

async function save() {
  await store.saveToday(text.value)
}
</script>

<template>
  <el-card class="summary-card" shadow="never">
    <template #header>
      <div class="header">
        <div class="title">Day Summary</div>
        <el-tag size="small" type="info">{{ store.current?.total_focused_minutes ?? 0 }}m</el-tag>
      </div>
    </template>

    <el-space direction="vertical" size="small" fill>
      <el-form label-position="top">
        <el-form-item label="Summary">
          <el-input
            v-model="text"
            type="textarea"
            :rows="3"
            placeholder="How did your day go?"
          />
        </el-form-item>
      </el-form>

      <div class="actions">
        <el-button type="primary" @click="save">
          <Save :size="16" />
          <span style="margin-left: 6px">Save</span>
        </el-button>
      </div>
    </el-space>
  </el-card>
</template>

<style scoped>
.summary-card {
  width: 100%;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.title {
  font-weight: 700;
}

.actions {
  display: flex;
  justify-content: flex-end;
}
</style>
