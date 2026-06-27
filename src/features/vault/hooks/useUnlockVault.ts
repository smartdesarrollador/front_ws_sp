import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import { useVaultStore } from '@/store/vaultStore'
import type { UnlockResponse } from '../types'

export function useUnlockVault() {
  const queryClient = useQueryClient()
  const unlock = useVaultStore((s) => s.unlock)
  return useMutation({
    mutationFn: async (masterPassword: string) => {
      const { data } = await apiClient.post<UnlockResponse>('/app/vault/unlock/', {
        master_password: masterPassword,
      })
      return data
    },
    onSuccess: (data) => {
      unlock(data.unlock_token, data.expires_in)
      queryClient.invalidateQueries({ queryKey: ['vault-status'] })
    },
  })
}
