import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { useRouter, useSegments } from 'expo-router'
import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { Platform } from 'react-native'
import type { AuthResponse, User } from '@/models/auth'
import { checkToken } from '@/services/auth.service'
import { clearTokens, getStoredTokens, storeTokens } from '@/services/api-client'

// ─── Storage helpers ──────────────────────────────────────────────────────────

const USER_KEY = 'auth_user'

const storeUser = async (user: User): Promise<void> => {
  const raw = JSON.stringify(user)
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(USER_KEY, raw)
  } else {
    await SecureStore.setItemAsync(USER_KEY, raw)
  }
}

const loadUser = async (): Promise<User | null> => {
  try {
    let raw: string | null = null
    if (Platform.OS === 'web') {
      raw = await AsyncStorage.getItem(USER_KEY)
    } else {
      raw = await SecureStore.getItemAsync(USER_KEY)
    }
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const clearUser = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(USER_KEY)
  } else {
    await SecureStore.deleteItemAsync(USER_KEY)
  }
}

// ─── State & Reducer ─────────────────────────────────────────────────────────

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
}

type AuthAction =
  | { type: 'AUTH_LOADED'; payload: { user: User; accessToken: string } }
  | { type: 'AUTH_CLEARED' }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_LOADED':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'AUTH_CLEARED':
      return { user: null, accessToken: null, isAuthenticated: false, isLoading: false }
    default:
      return state
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login: (response: AuthResponse) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const router = useRouter()
  const segments = useSegments()

  // Bootstrap: restore session on app start
  useEffect(() => {
    async function restoreSession() {
      try {
        const tokens = await getStoredTokens()
        if (!tokens?.accessToken) {
          dispatch({ type: 'AUTH_CLEARED' })
          return
        }

        const valid = await checkToken()
        if (valid) {
          const user = await loadUser()
          if (user) {
            dispatch({ type: 'AUTH_LOADED', payload: { user, accessToken: tokens.accessToken } })
            return
          }
        }

        await clearTokens()
        await clearUser()
        dispatch({ type: 'AUTH_CLEARED' })
      } catch {
        dispatch({ type: 'AUTH_CLEARED' })
      }
    }

    restoreSession()
  }, [])

  // Navigation guard: redirect based on auth state
  useEffect(() => {
    if (state.isLoading) return

    const inAuth = segments[0] === '(auth)'
    if (!state.isAuthenticated && !inAuth) {
      router.replace('/(auth)/login')
    } else if (state.isAuthenticated && inAuth) {
      router.replace('/(tabs)')
    }
  }, [state.isAuthenticated, state.isLoading, segments])

  const login = async (response: AuthResponse) => {
    await storeTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken })
    await storeUser(response.user)
    dispatch({ type: 'AUTH_LOADED', payload: { user: response.user, accessToken: response.accessToken } })
  }

  const logout = async () => {
    await clearTokens()
    await clearUser()
    dispatch({ type: 'AUTH_CLEARED' })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
