import type { ShareAccessLevel } from '../types'

interface AccessConfig {
  label: string
  className: string
}

export const ACCESS_CONFIG: Record<ShareAccessLevel, AccessConfig> = {
  viewer: {
    label: 'Visualizador',
    className: 'bg-gray-100 text-gray-700',
  },
  editor: {
    label: 'Editor',
    className: 'bg-blue-100 text-blue-700',
  },
  admin: {
    label: 'Administrador',
    className: 'bg-purple-100 text-purple-700',
  },
}

interface Props {
  level: ShareAccessLevel
}

export function AccessLevelBadge({ level }: Props) {
  const config = ACCESS_CONFIG[level]

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
