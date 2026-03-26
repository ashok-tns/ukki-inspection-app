import { useMutation } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useAuth } from '@/provider/auth-provider'
import { loginInspector } from '@/services/auth.service'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { markSubmitted, resetLogin, setEmail, setError, setPassword } from './slice'

export function useLogin() {
  const dispatch = useAppDispatch()
  const { email, password, error, isSubmitted } = useAppSelector((state) => state.login)
  const { login } = useAuth()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginInspector(email, password),
    onSuccess: async (response) => {
      dispatch(resetLogin())
      await login(response)
    },
    onError: (err: unknown) => {
      const axiosError = err as { response?: { data?: { message?: string } }; message?: string }
      const message =
        axiosError?.response?.data?.message ||
        axiosError?.message ||
        'An error occurred, please try again'
      dispatch(setError(message))
    },
  })

  const handleSubmit = useCallback(() => {
    dispatch(markSubmitted())

    if (!email || !email.match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )) {
      dispatch(setError('Please enter an valid email'))
      return
    }
    if (password === '') {
      dispatch(setError('Please enter the password'))
      return
    }

    dispatch(setError(null))
    mutate({ email, password })
  }, [email, password, mutate, dispatch])

  return {
    email,
    password,
    error,
    isSubmitted,
    isLoading: isPending,
    setEmail: (val: string) => dispatch(setEmail(val)),
    setPassword: (val: string) => dispatch(setPassword(val)),
    handleSubmit,
  }
}
