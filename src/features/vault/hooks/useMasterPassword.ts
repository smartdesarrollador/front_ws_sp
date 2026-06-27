import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { SetupResponse } from '../types'

export function useSetupMasterPassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (masterPassword: string) => {
      const { data } = await apiClient.post<SetupResponse>('/app/vault/master-password/', {
        master_password: masterPassword,
      })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vault-status'] }),
  })
}

export function useChangeMasterPassword() {
  return useMutation({
    mutationFn: async (payload: { current: string; next: string }) => {
      await apiClient.put('/app/vault/master-password/', {
        current_master_password: payload.current,
        new_master_password: payload.next,
      })
    },
  })
}

export function useRecoverVault() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { recoveryCode: string; next: string }) => {
      const { data } = await apiClient.post<SetupResponse>('/app/vault/recover/', {
        recovery_code: payload.recoveryCode,
        new_master_password: payload.next,
      })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vault-status'] }),
  })
}
