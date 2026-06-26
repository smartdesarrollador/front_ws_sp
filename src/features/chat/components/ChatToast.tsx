import { useEffect } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

export interface ToastState {
  message: string
  variant: 'success' | 'error'
}

interface ChatToastProps {
  toast: ToastState | null
  onDismiss: () => void
}

export function ChatToast({ toast, onDismiss }: ChatToastProps) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  if (!toast) return null

  const Icon = toast.variant === 'success' ? CheckCircle : AlertCircle
  const color =
    toast.variant === 'success'
      ? 'border-green-200 text-green-800 bg-green-50 dark:bg-green-900/30 dark:text-green-200'
      : 'border-red-200 text-red-800 bg-red-50 dark:bg-red-900/30 dark:text-red-200'

  return (
    <div
      role="status"
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg ${color}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm">{toast.message}</span>
      <button type="button" aria-label="Cerrar aviso" onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
