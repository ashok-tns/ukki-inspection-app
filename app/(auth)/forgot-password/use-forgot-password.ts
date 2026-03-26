import { useMutation } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useRouter } from 'expo-router'
import { forgotPassword } from '@/services/auth.service'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { markSubmitted, markSuccess, resetForgotPassword, setEmail, setError } from './slice'

export function useForgotPassword() {
  const dispatch = useAppDispatch()
  const { email, error, isSubmitted, isSuccess } = useAppSelector((state) => state.forgotPassword)
  const router = useRouter()

  const { mutate, isPending } = useMutation({
    mutationFn: (email: string) => forgotPassword(email),
    onSuccess: () => {
      dispatch(markSuccess())
      // Brief delay so user sees the success state before navigating back
      setTimeout(() => {
        dispatch(resetForgotPassword())
        router.replace('/(auth)/login')
      }, 2000)
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

    if (
      !email ||
      !email.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    ) {
      dispatch(setError('Please enter a valid email address'))
      return
    }

    dispatch(setError(null))
    mutate(email)
  }, [email, mutate, dispatch])

  const handleBack = useCallback(() => {
    dispatch(resetForgotPassword())
    router.back()
  }, [dispatch, router])

  return {
    email,
    error,
    isSubmitted,
    isSuccess,
    isLoading: isPending,
    setEmail: (val: string) => dispatch(setEmail(val)),
    handleSubmit,
    handleBack,
  }
}
