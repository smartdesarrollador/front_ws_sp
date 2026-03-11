import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { CreateSSHKeyRequest, SSHKey } from '../types'

export function useCreateSSHKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateSSHKeyRequest) => {
      const response = await apiClient.post<SSHKey>('/app/ssh-keys/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ssh-keys'] })
    },
  })
}
