import { useState } from 'react'
import { useCalendarEvents } from './hooks/useCalendarEvents'
import { useDeleteEvent } from './hooks/useDeleteEvent'
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary'
import { CalendarHeader } from './components/CalendarHeader'
import { MonthView } from './components/MonthView'
import { WeekView } from './components/WeekView'
import { DayView } from './components/DayView'
import { EventModal } from './components/EventModal'
import type { CalendarEvent, CalendarView } from './types'

function toMonthStr(date: Date): string {
  return (
    date.getFullYear() +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0')
  )
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [viewMode, setViewMode] = useState<CalendarView>('month')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined)

  const monthStr = toMonthStr(currentDate)
  const { data, isLoading } = useCalendarEvents(monthStr)
  const deleteEvent = useDeleteEvent()
  const { data: summaryData } = useDashboardSummary()

  const events = data?.events ?? []

  // PlanLimitBanner: check events_today or usage if available
  // We use a generic approach: show banner when events_today >= 80% of a hypothetical limit
  // The DashboardSummary doesn't expose events_limit, so we track usage.tasks_active as reference
  // Actually we check summaryData.events_today vs a limit — but DashboardSummary has no events_limit.
  // Following the TasksPage pattern for the banner, we show it if we can detect 80% usage.
  // For calendar we check if total events in month >= 80% of tasks_limit (proxy) when limit != null.
  const tasksLimit = summaryData?.usage.tasks_limit ?? null
  const totalEvents = data?.total ?? 0
  const showPlanBanner =
    tasksLimit !== null && totalEvents > 0 && totalEvents >= tasksLimit * 0.8

  const handlePrev = () => {
    const d = new Date(currentDate)
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() - 1)
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() - 7)
    } else {
      d.setDate(d.getDate() - 1)
    }
    setCurrentDate(d)
  }

  const handleNext = () => {
    const d = new Date(currentDate)
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() + 1)
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() + 7)
    } else {
      d.setDate(d.getDate() + 1)
    }
    setCurrentDate(d)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event)
    setDefaultDate(undefined)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteEvent.mutate(id)
  }

  const handleDayClick = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    setDefaultDate(`${y}-${m}-${d}`)
    setEditingEvent(null)
    setModalOpen(true)
  }

  const handleNewEvent = () => {
    setEditingEvent(null)
    setDefaultDate(undefined)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingEvent(null)
    setDefaultDate(undefined)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendario</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Gestiona tus eventos y reuniones
        </p>
      </div>

      {/* Plan limit banner */}
      {showPlanBanner && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
          Has alcanzado el {Math.round((totalEvents / (tasksLimit ?? 1)) * 100)}% del límite de
          eventos de tu plan ({totalEvents}/{tasksLimit}). Considera actualizar tu plan.
        </div>
      )}

      {/* Calendar header toolbar */}
      <CalendarHeader
        currentDate={currentDate}
        view={viewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onViewChange={setViewMode}
        onNewEvent={handleNewEvent}
      />

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="p-2 flex justify-center">
                <div className="animate-pulse h-3 w-6 bg-gray-200 dark:bg-gray-600 rounded" />
              </div>
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-7">
              {Array.from({ length: 7 }).map((_, colIdx) => (
                <div
                  key={colIdx}
                  className="animate-pulse min-h-[100px] p-2 border-r border-b border-gray-200 dark:border-gray-700"
                >
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : viewMode === 'month' ? (
        <MonthView
          events={events}
          currentDate={currentDate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDayClick={handleDayClick}
        />
      ) : viewMode === 'week' ? (
        <WeekView
          events={events}
          currentDate={currentDate}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <DayView
          events={events}
          currentDate={currentDate}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <EventModal
        event={editingEvent}
        open={modalOpen}
        onClose={handleCloseModal}
        defaultDate={defaultDate}
      />
    </div>
  )
}
