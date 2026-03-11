import type { FormStatus } from '../types'

export const STATUS_CONFIG: Record<FormStatus, { label: string; classes: string }> = {
  draft: { label: 'Borrador', classes: 'bg-gray-100 text-gray-700' },
  active: { label: 'Activo', classes: 'bg-green-100 text-green-700' },
  closed: { label: 'Cerrado', classes: 'bg-red-100 text-red-700' },
}

interface Props {
  status: FormStatus
}

export default function FormStatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.classes}`}
    >
      {config.label}
    </span>
  )
}
