<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu } from 'lucide-vue-next'
import { useAuthStore } from './stores/auth'

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
    <el-header class="app-header" height="56px">
      <div class="header-inner">
        <RouterLink class="brand" :to="isAuthed ? '/' : '/login'">LMA</RouterLink>

        <el-menu
          v-if="isAuthed"
          class="app-menu app-menu--desktop"
          mode="horizontal"
          :default-active="activePath"
          router
        >
          <el-menu-item index="/">Dashboard</el-menu-item>
          <el-menu-item index="/notes">Notes</el-menu-item>
          <el-menu-item index="/focus-log">Focus Log</el-menu-item>
          <el-menu-item index="/time">Timeline</el-menu-item>
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

    <el-drawer v-model="mobileNavOpen" direction="ltr" size="280px" :with-header="false">
      <div class="drawer-inner">
        <RouterLink
          class="brand brand--drawer"
          :to="isAuthed ? '/' : '/login'"
          @click="mobileNavOpen = false"
        >LMA</RouterLink>

        <el-menu
          v-if="isAuthed"
          class="app-menu app-menu--mobile"
          :default-active="activePath"
          router
          @select="mobileNavOpen = false"
        >
          <el-menu-item index="/">Dashboard</el-menu-item>
          <el-menu-item index="/notes">Notes</el-menu-item>
          <el-menu-item index="/focus-log">Focus Log</el-menu-item>
          <el-menu-item index="/time">Timeline</el-menu-item>
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
  height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand {
  font-weight: 700;
  text-decoration: none;
  padding: 0 4px;
}

.app-menu {
  flex: 1;
  min-width: 0;
}

.nav-toggle {
  display: none;
}

.drawer-inner {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.brand--drawer {
  display: inline-flex;
  align-items: center;
  height: 40px;
}

.app-main {
  padding: 0;
  overflow-x: hidden;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

@media (max-width: 768px) {
  .app-menu--desktop {
    display: none;
  }

  .nav-toggle {
    display: inline-flex;
    margin-left: auto;
  }

  .header-inner {
    gap: 8px;
  }
}
</style>
