<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import DaySummary from '@/components/DaySummary.vue'
</script>

<template>
  <div class="page-container">
    <el-space direction="vertical" size="large" fill>
      <el-row :gutter="16">
        <el-col :xs="24">
          <div class="section">
            <DaySummary />
          </div>
        </el-col>
      </el-row>
    </el-space>
  </div>
</template>

<style scoped>
.hero {
  border-radius: 12px;
}

.hero-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 18px;
  }
}
</style>
