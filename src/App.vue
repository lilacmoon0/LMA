<script setup lang="ts"></script>

<template>
  <div class="app">
    <nav class="nav">
      <RouterLink class="brand" to="/">LMA</RouterLink>

      <RouterLink class="nav-link" to="/">Dashboard</RouterLink>
      <RouterLink class="nav-link" to="/focus-log">Focus Log</RouterLink>
      <RouterLink class="nav-link" to="/day-summary">Day Summary</RouterLink>
    </nav>

    <main class="main">
      <Suspense>
        <RouterView />
        <template #fallback>
          <div>Loading…</div>
        </template>
      </Suspense>
    </main>
  </div>
</template>

<style scoped>
.nav {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
}
.brand {
  font-weight: 700;
  margin-right: 8px;
}
.nav-link {
  background: transparent;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
}
.main {
  max-width: 1500px;
  margin: 0 auto;
}
</style>
