import { endpoints, http } from './client'

export type AuthUser = {
  id?: number
  username?: string
  email?: string
  [key: string]: unknown
}

export type AuthLoginPayload = {
  username?: string
  email?: string
  password: string
}

export type AuthRegisterPayload = {
  username: string
  email: string
  password: string
  password_confirm: string
}

export async function login(payload: AuthLoginPayload) {
  // Response shape depends on backend; cookies are handled via credentials: 'include'.
  return http.post<unknown>(endpoints.authLogin, payload)
}

export async function register(payload: AuthRegisterPayload) {
  return http.post<unknown>(endpoints.authRegister, payload)
}

export async function refresh() {
  return http.post<unknown>(endpoints.authRefresh, {})
}

export async function me() {
  return http.get<AuthUser>(endpoints.authMe)
}
