import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as authApi from '../api/auth'
import type { AuthLoginPayload, AuthRegisterPayload, AuthUser } from '../api/auth'

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  return String(err)
}

function isHttpStatus(err: unknown, status: number): boolean {
  return getErrorMessage(err).includes(`HTTP ${status} `)
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => user.value !== null)

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
      await authApi.login(payload)
      await fetchMe()
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
      await authApi.register(payload)
      await fetchMe()
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
    loading,
    error,
    isAuthenticated,
    fetchMe,
    login,
    register,
    refresh,
    clearError,
  }
})
