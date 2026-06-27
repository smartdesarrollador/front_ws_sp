import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type {
  CreateVaultItemRequest,
  UpdateVaultItemRequest,
  VaultItem,
  VaultItemRevealed,
} from '../types'

export function useRevealVaultItem() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.get<VaultItemRevealed>(`/app/vault/items/${id}/`)
      return data
    },
  })
}

export function useCreateVaultItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateVaultItemRequest) => {
      const { data } = await apiClient.post<VaultItem>('/app/vault/items/', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vault-items'] }),
  })
}

export function useUpdateVaultItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateVaultItemRequest }) => {
      const { data } = await apiClient.patch<VaultItem>(`/app/vault/items/${id}/`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vault-items'] }),
  })
}

export function useDeleteVaultItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/app/vault/items/${id}/`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vault-items'] }),
  })
}
