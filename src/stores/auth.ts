import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as authApi from '../api/auth'
import type { AuthLoginPayload, AuthRegisterPayload, AuthUser } from '../api/auth'
import { clearTokens, getTokens, setTokens } from '../api/tokens'
import { useTasksStore } from './tasks'
import { useBlocksStore } from './blocks'
import { useDaySummaryStore } from './daySummaries'
import { useFocusStore } from './focusSessions'

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  return String(err)
}

function isHttpStatus(err: unknown, status: number): boolean {
  return getErrorMessage(err).includes(`HTTP ${status} `)
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  function applyTokens(tokens: { access?: unknown; refresh?: unknown }) {
    const access = typeof tokens.access === 'string' ? tokens.access : null
    const refresh = typeof tokens.refresh === 'string' ? tokens.refresh : null
    accessToken.value = access
    refreshToken.value = refresh
    setTokens({ access, refresh })
  }

  function logout() {
    // Clear user-scoped state so we don't show stale data
    // if the user logs out/in without a full page refresh.
    useTasksStore().clear()
    useBlocksStore().clear()
    useDaySummaryStore().clear()
    useFocusStore().clear()

    user.value = null
    accessToken.value = null
    refreshToken.value = null
    clearTokens()
  }

  async function hydrate() {
    const tokens = getTokens()
    accessToken.value = tokens.access
    refreshToken.value = tokens.refresh
    if (tokens.access) {
      await fetchMe().catch(() => null)
    }
  }

  async function fetchMe() {
    loading.value = true
    error.value = null
    try {
      const me = await authApi.me()
      user.value = me
      return me
    } catch (e: unknown) {
      if (isHttpStatus(e, 401)) {
        user.value = null
        // Token may be expired/invalid and refresh could fail; keep tokens as-is here.
        return null
      }
      error.value = getErrorMessage(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function login(payload: AuthLoginPayload) {
    loading.value = true
    error.value = null
    try {
      const res = await authApi.login(payload)
      applyTokens(res)
      if (res.user) user.value = res.user
      else await fetchMe()
      return user.value
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(payload: AuthRegisterPayload) {
    loading.value = true
    error.value = null
    try {
      const res = await authApi.register(payload)
      applyTokens(res)
      if (res.user) user.value = res.user
      else await fetchMe()
      return user.value
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    try {
      await authApi.refresh()
      return true
    } catch {
      return false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    isAuthenticated,
    hydrate,
    fetchMe,
    login,
    register,
    refresh,
    logout,
    clearError,
  }
})
