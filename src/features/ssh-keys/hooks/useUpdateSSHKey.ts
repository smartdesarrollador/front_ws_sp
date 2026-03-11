import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { UpdateSSHKeyRequest, SSHKey } from '../types'

export function useUpdateSSHKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & UpdateSSHKeyRequest) => {
      const response = await apiClient.patch<SSHKey>(`/app/ssh-keys/${id}/`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ssh-keys'] })
    },
  })
}
