import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { CertStatus } from '../types'

export const STATUS_LABELS: Record<CertStatus, string> = {
  valid: 'Válido',
  expiring: 'Por vencer',
  expired: 'Expirado',
}

export const STATUS_COLORS: Record<CertStatus, string> = {
  valid: 'bg-green-100 text-green-700',
  expiring: 'bg-yellow-100 text-yellow-700',
  expired: 'bg-red-100 text-red-700',
}

export const STATUS_ICONS: Record<CertStatus, LucideIcon> = {
  valid: CheckCircle,
  expiring: AlertTriangle,
  expired: XCircle,
}

interface CertStatusBadgeProps {
  status: CertStatus
}

export function CertStatusBadge({ status }: CertStatusBadgeProps) {
  const Icon = STATUS_ICONS[status]
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}
    >
      <Icon className="w-3 h-3" />
      {STATUS_LABELS[status]}
    </span>
  )
}
