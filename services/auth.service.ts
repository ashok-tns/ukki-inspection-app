import type { AuthResponse } from '@/models/auth'
import apiClient from './api-client'

export const loginInspector = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login/inspector', { email, password })
  return data
}

export const forgotPassword = async (email: string): Promise<void> => {
  await apiClient.post('/auth/forgot-password', { email })
}

export const checkToken = async (): Promise<boolean> => {
  try {
    await apiClient.get('/auth/check-token')
    return true
  } catch {
    return false
  }
}
