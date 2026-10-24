import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

const TOKEN_STORAGE_KEY = 'sms.auth.token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

async function request<T>(run: () => Promise<{ data: T }>): Promise<T> {
  try {
    const response = await run()
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError
    const status = axiosError.response?.status ?? 0
    throw new ApiError(status, axiosError.message)
  }
}

export const api = {
  get: <T>(path: string, config?: AxiosRequestConfig) =>
    request<T>(() => apiClient.get<T>(path, config)),

  post: <T>(path: string, body?: unknown, config?: AxiosRequestConfig) =>
    request<T>(() => apiClient.post<T>(path, body, config)),

  put: <T>(path: string, body?: unknown, config?: AxiosRequestConfig) =>
    request<T>(() => apiClient.put<T>(path, body, config)),

  patch: <T>(path: string, body?: unknown, config?: AxiosRequestConfig) =>
    request<T>(() => apiClient.patch<T>(path, body, config)),

  delete: <T>(path: string, config?: AxiosRequestConfig) =>
    request<T>(() => apiClient.delete<T>(path, config)),
}
