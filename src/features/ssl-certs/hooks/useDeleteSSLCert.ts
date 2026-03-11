import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export function useDeleteSSLCert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/app/ssl-certs/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ssl-certs'] })
    },
  })
}
