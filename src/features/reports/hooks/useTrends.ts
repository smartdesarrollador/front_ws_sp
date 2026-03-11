import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { TrendsData } from '../types'

export function useTrends(period: '7d' | '30d' | '90d') {
  const { data: trends, isLoading } = useQuery({
    queryKey: ['ws-reports-trends', period],
    queryFn: () =>
      apiClient
        .get<TrendsData>(`/app/reports/trends/?period=${period}`)
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

  return { trends, isLoading }
}
