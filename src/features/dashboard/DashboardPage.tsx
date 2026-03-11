import { useAuthStore } from '@/store/authStore'
import { useDashboardSummary } from './hooks/useDashboardSummary'
import { useRecentActivity } from './hooks/useRecentActivity'
import { SummaryCards } from './components/SummaryCards'
import { PlanUsageBanner } from './components/PlanUsageBanner'
import { RecentTasksWidget } from './components/RecentTasksWidget'
import { UpcomingEventsWidget } from './components/UpcomingEventsWidget'
import { QuickActionsWidget } from './components/QuickActionsWidget'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary()
  const { recentTasks, upcomingEvents, isLoading: activityLoading } = useRecentActivity()

  const greeting = user?.first_name ? `Hola, ${user.first_name}` : 'Bienvenido'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mi Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{greeting}</p>
      </div>

      <SummaryCards summary={summary} isLoading={summaryLoading} />

      <PlanUsageBanner usage={summary?.usage} isLoading={summaryLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTasksWidget tasks={recentTasks} isLoading={activityLoading} />
        <UpcomingEventsWidget events={upcomingEvents} isLoading={activityLoading} />
      </div>

      <QuickActionsWidget />
    </div>
  )
}
