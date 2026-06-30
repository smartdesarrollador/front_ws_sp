import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { ActivityReport } from '../types'

export type ActivityPeriod = '7d' | '30d' | '90d'

export function useActivityReport(period: ActivityPeriod) {
  const days = period.replace('d', '') // backend expects an integer
  const { data: activity, isLoading } = useQuery({
    queryKey: ['ws-reports-activity', period],
    queryFn: () =>
      apiClient
        .get<ActivityReport>(`/app/reports/activity/?period=${days}`)
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

  return { activity, isLoading }
}
