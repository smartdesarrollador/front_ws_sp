import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { CreateSSLCertRequest, SSLCertificate } from '../types'

export function useCreateSSLCert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateSSLCertRequest) => {
      const res = await apiClient.post<SSLCertificate>('/app/ssl-certs/', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ssl-certs'] })
    },
  })
}
