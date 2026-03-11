import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import type { ProfileUpdateRequest } from '../types'

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser)
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: (data: ProfileUpdateRequest) =>
      apiClient.patch('/auth/profile/', data).then((r) => r.data),
    onSuccess: (_data, variables) => {
      if (user) {
        setUser({
          ...user,
          first_name: variables.firstName,
          last_name: variables.lastName,
        })
      }
    },
  })
}
