import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { SharedVaultItem, SharedVaultItemRevealed, VaultShare } from '../types'

// ── Owner side: who is this item shared with ────────────────────────────────

export function useItemShares(itemId: string | undefined) {
  return useQuery({
    queryKey: ['vault-item-shares', itemId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ shares: VaultShare[] }>(
        `/app/vault/items/${itemId}/share/`,
      )
      return data.shares
    },
    enabled: !!itemId,
  })
}

export function useShareVaultItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ itemId, email }: { itemId: string; email: string }) => {
      const { data } = await apiClient.post<VaultShare>(`/app/vault/items/${itemId}/share/`, {
        shared_with_email: email,
      })
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vault-item-shares', variables.itemId] })
    },
  })
}

export function useRevokeVaultShare() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ itemId, shareId }: { itemId: string; shareId: string }) => {
      await apiClient.delete(`/app/vault/items/${itemId}/share/${shareId}/`)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vault-item-shares', variables.itemId] })
    },
  })
}

// ── Recipient side: items shared with me ────────────────────────────────────

export function useSharedVaultItems(enabled = true) {
  return useQuery({
    queryKey: ['vault-shared-with-me'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: SharedVaultItem[] }>(
        '/app/vault/shared-with-me/',
      )
      return data.items
    },
    enabled,
    staleTime: 30_000,
  })
}

export function useRevealSharedVaultItem() {
  return useMutation({
    mutationFn: async (shareId: string) => {
      const { data } = await apiClient.get<SharedVaultItemRevealed>(
        `/app/vault/shared-with-me/${shareId}/`,
      )
      return data
    },
  })
}
