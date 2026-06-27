import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import { useVaultStore } from '@/store/vaultStore'

export function useLockVault() {
  const queryClient = useQueryClient()
  const lock = useVaultStore((s) => s.lock)
  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/app/vault/lock/')
    },
    // Lock locally regardless of the network result.
    onSettled: () => {
      lock()
      queryClient.invalidateQueries({ queryKey: ['vault-status'] })
    },
  })
}
