import { configureStore } from '@reduxjs/toolkit'
import loginReducer from '@/app/(auth)/login/slice'
import forgotPasswordReducer from '@/app/(auth)/forgot-password/slice'

export const store = configureStore({
  reducer: {
    login: loginReducer,
    forgotPassword: forgotPasswordReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
