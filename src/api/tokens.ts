export type AuthTokens = {
  access: string | null
  refresh: string | null
}

const STORAGE_KEY = 'lma_auth_tokens'

let cached: AuthTokens | null = null

function safeParse(raw: string | null): AuthTokens | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<AuthTokens>
    const access = typeof parsed.access === 'string' ? parsed.access : null
    const refresh = typeof parsed.refresh === 'string' ? parsed.refresh : null
    return { access, refresh }
  } catch {
    return null
  }
}

export function getTokens(): AuthTokens {
  if (cached) return cached
  if (typeof localStorage === 'undefined') {
    cached = { access: null, refresh: null }
    return cached
  }
  cached = safeParse(localStorage.getItem(STORAGE_KEY)) ?? { access: null, refresh: null }
  return cached
}

export function setTokens(tokens: AuthTokens): void {
  cached = { access: tokens.access ?? null, refresh: tokens.refresh ?? null }
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cached))
}

export function clearTokens(): void {
  cached = { access: null, refresh: null }
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function getAccessToken(): string | null {
  return getTokens().access
}

export function getRefreshToken(): string | null {
  return getTokens().refresh
}

export function setAccessToken(access: string | null): void {
  const current = getTokens()
  setTokens({ ...current, access: access ?? null })
}

export function setRefreshToken(refresh: string | null): void {
  const current = getTokens()
  setTokens({ ...current, refresh: refresh ?? null })
}
