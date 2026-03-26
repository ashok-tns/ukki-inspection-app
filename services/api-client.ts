import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import { ENV } from '@/constants/config'

const STORED_TOKENS_KEY = 'auth_tokens'

export const getStoredTokens = async (): Promise<{
  accessToken: string
  refreshToken: string
} | null> => {
  try {
    let raw: string | null = null
    if (Platform.OS === 'web') {
      raw = await AsyncStorage.getItem(STORED_TOKENS_KEY)
    } else {
      raw = await SecureStore.getItemAsync(STORED_TOKENS_KEY)
    }
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const storeTokens = async (tokens: {
  accessToken: string
  refreshToken: string
}): Promise<void> => {
  const raw = JSON.stringify(tokens)
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(STORED_TOKENS_KEY, raw)
  } else {
    await SecureStore.setItemAsync(STORED_TOKENS_KEY, raw)
  }
}

export const clearTokens = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(STORED_TOKENS_KEY)
  } else {
    await SecureStore.deleteItemAsync(STORED_TOKENS_KEY)
  }
}

const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach stored access token to every request
apiClient.interceptors.request.use(async (config) => {
  const tokens = await getStoredTokens()
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`
  }
  return config
})

// On 401: attempt one token refresh, then retry the original request
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const tokens = await getStoredTokens()
        if (!tokens?.refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(`${ENV.API_URL}/auth/refresh`, {
          refreshToken: tokens.refreshToken,
        })

        await storeTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(original)
      } catch {
        await clearTokens()
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
