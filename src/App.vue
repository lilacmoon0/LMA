<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu } from 'lucide-vue-next'
import { useAuthStore } from './stores/auth'
import FocusNow from './components/FocusNow.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const activePath = computed(() => route.path)
const isAuthed = computed(() => auth.isAuthenticated)

const mobileNavOpen = ref(false)

watch(
  () => route.path,
  () => {
    mobileNavOpen.value = false
  },
)

async function onLogout() {
  auth.logout()
  await router.push('/login')
}
</script>

<template>
  <el-container class="app-shell">
    <el-header class="app-header" height="3.5rem">
      <div class="header-inner">
        <RouterLink class="brand" :to="isAuthed ? '/' : '/login'">
          <img class="brand__logo" src="/mascot.png" />
        </RouterLink>

        <el-menu
          v-if="isAuthed"
          class="app-menu app-menu--desktop"
          mode="horizontal"
          :default-active="activePath"
          router
        >
          <el-menu-item index="/">Kanban</el-menu-item>
          <el-menu-item index="/time">Timeline</el-menu-item>
          <el-menu-item index="/notes">Notes</el-menu-item>
          <el-menu-item index="/focus-log">Focus Map</el-menu-item>
        </el-menu>

        <el-button v-if="isAuthed" text @click="onLogout">Logout</el-button>

        <el-button
          class="nav-toggle"
          circle
          text
          aria-label="Open navigation menu"
          @click="mobileNavOpen = true"
        >
          <Menu :size="20" />
        </el-button>
      </div>
    </el-header>

    <el-drawer
      v-model="mobileNavOpen"
      direction="ltr"
      size="min(90vw, 17.5rem)"
      :with-header="false"
    >
      <div class="drawer-inner">
        <RouterLink
          class="brand brand--drawer"
          :to="isAuthed ? '/' : '/login'"
          @click="mobileNavOpen = false"
          ><img class="brand__logo" src="/mascot.png"
        /></RouterLink>

        <el-menu
          v-if="isAuthed"
          class="app-menu app-menu--mobile"
          :default-active="activePath"
          router
          @select="mobileNavOpen = false"
        >
          <el-menu-item index="/">Kanban</el-menu-item>
          <el-menu-item index="/time">Timeline</el-menu-item>
          <el-menu-item index="/notes">Notes</el-menu-item>
          <el-menu-item index="/focus-log">Focus Log</el-menu-item>
        </el-menu>

        <el-button v-if="isAuthed" text @click="onLogout">Logout</el-button>
      </div>
    </el-drawer>

    <el-main class="app-main">
      <Suspense>
        <RouterView />
        <template #fallback>
          <div class="page-container">
            <el-skeleton :rows="6" animated />
          </div>
        </template>
      </Suspense>
    </el-main>

    <FocusNow />
  </el-container>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 clamp(0.75rem, 2vw, 1rem);
}

.brand {
  height: 100%;
  display: inline-flex;
  align-items: center;
}

.brand__logo {
  height: 100%;
  width: auto;
  max-height: 100%;
  object-fit: contain;
  flex: 0 0 auto;
}

.app-menu {
  flex: 1;
  min-width: 0;
  border-bottom: none;
}

.app-menu--desktop {
  height: 100%;
  display: flex;
  align-items: center;
}

/* Make the horizontal menu feel more modern (pill hover/active). */
.app-menu--desktop:deep(.el-menu-item) {
  border-bottom: none !important;
  display: inline-flex;
  align-items: center;
  border-radius: 0.625rem;
  margin: 0 0.125rem;
  height: 2.25rem;
  line-height: 2.25rem;
}

.app-menu--desktop:deep(.el-menu-item:hover) {
  background: var(--el-fill-color-light);
}

.app-menu--desktop:deep(.el-menu-item.is-active) {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.nav-toggle {
  display: none;
}

.drawer-inner {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.brand--drawer {
  display: inline-flex;
  align-items: center;
  height: 2.5rem;
  background: transparent;
  border: none;
  padding: 0;
  border-radius: 0;
}

.app-main {
  padding: 0;
  overflow-x: hidden;
  padding-bottom: env(safe-area-inset-bottom, 0rem);
}

@media (max-width: 48rem) {
  .app-menu--desktop {
    display: none;
  }

  .nav-toggle {
    display: inline-flex;
    margin-left: auto;
  }

  .header-inner {
    gap: 0.5rem;
  }
}
</style>
