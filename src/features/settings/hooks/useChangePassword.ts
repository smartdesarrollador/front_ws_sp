import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      apiClient.post('/auth/change-password/', data).then((r) => r.data),
  })
}
