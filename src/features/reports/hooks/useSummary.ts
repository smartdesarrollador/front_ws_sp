import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { SummaryData } from '../types'

export function useSummary() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['ws-reports-summary'],
    queryFn: () => apiClient.get<SummaryData>('/app/reports/summary/').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

  return { summary, isLoading }
}
