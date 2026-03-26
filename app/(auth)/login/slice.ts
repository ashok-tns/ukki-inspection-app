import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface LoginFormState {
  email: string
  password: string
  error: string | null
  isSubmitted: boolean
}

const initialState: LoginFormState = {
  email: '',
  password: '',
  error: null,
  isSubmitted: false,
}

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    markSubmitted: (state) => {
      state.isSubmitted = true
    },
    resetLogin: () => initialState,
  },
})

export const { setEmail, setPassword, setError, markSubmitted, resetLogin } = loginSlice.actions
export default loginSlice.reducer
