import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { UpdateSSLCertRequest, SSLCertificate } from '../types'

interface UpdateSSLCertVariables extends UpdateSSLCertRequest {
  id: string
}

export function useUpdateSSLCert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateSSLCertVariables) => {
      const res = await apiClient.patch<SSLCertificate>(`/app/ssl-certs/${id}/`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ssl-certs'] })
    },
  })
}
