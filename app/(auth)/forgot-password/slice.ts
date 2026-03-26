import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface ForgotPasswordState {
  email: string
  error: string | null
  isSubmitted: boolean
  isSuccess: boolean
}

const initialState: ForgotPasswordState = {
  email: '',
  error: null,
  isSubmitted: false,
  isSuccess: false,
}

const forgotPasswordSlice = createSlice({
  name: 'forgotPassword',
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    markSubmitted: (state) => {
      state.isSubmitted = true
    },
    markSuccess: (state) => {
      state.isSuccess = true
    },
    resetForgotPassword: () => initialState,
  },
})

export const { setEmail, setError, markSubmitted, markSuccess, resetForgotPassword } =
  forgotPasswordSlice.actions
export default forgotPasswordSlice.reducer
