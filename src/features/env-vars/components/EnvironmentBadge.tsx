import type { EnvEnvironment } from '../types'

export const ENV_LABELS: Record<EnvEnvironment, string> = {
  dev: 'Development',
  staging: 'Staging',
  production: 'Production',
  all: 'All',
}

export const ENV_COLORS: Record<EnvEnvironment, string> = {
  dev: 'bg-blue-100 text-blue-700',
  staging: 'bg-yellow-100 text-yellow-700',
  production: 'bg-red-100 text-red-700',
  all: 'bg-green-100 text-green-700',
}

interface Props {
  environment: EnvEnvironment
}

export function EnvironmentBadge({ environment }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ENV_COLORS[environment]}`}
    >
      {ENV_LABELS[environment]}
    </span>
  )
}
