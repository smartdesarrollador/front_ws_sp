import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { SSLCertificate } from '../types'

interface SSLCertsResponse {
  results: SSLCertificate[]
  count: number
}

export function useSSLCerts() {
  return useQuery({
    queryKey: ['ssl-certs'],
    queryFn: async () => {
      const { data } = await apiClient.get<SSLCertsResponse>('/app/ssl-certs/')
      return data
    },
    staleTime: 30_000,
    select: (data) => ({ certs: data.results, total: data.count }),
  })
}
