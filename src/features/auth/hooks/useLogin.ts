import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'

export function useLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: (result) => {
      if ('ok' in result) navigate('/')
    },
  })
}
