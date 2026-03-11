import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { useMarkAsRead } from '../hooks/useMarkAsRead'
import { NotificationItem } from './NotificationItem'

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { notifications, unreadCount } = useNotifications()
  const markAsRead = useMarkAsRead()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-label="Notificaciones"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-xs font-bold leading-none">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Notificaciones</span>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 5).map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={(id) => markAsRead.mutate(id)}
                onDismiss={() => setOpen(false)}
              />
            ))}
            {notifications.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                No hay notificaciones
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => {
                navigate('/notifications')
                setOpen(false)
              }}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Ver todas →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
