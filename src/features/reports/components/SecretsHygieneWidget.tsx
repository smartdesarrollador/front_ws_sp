import { KeyRound, TerminalSquare, Lock, RotateCcw } from 'lucide-react'
import type { DevOpsReport, StaleSecret, StaleSecretType } from '../types'

interface Props {
  devops: DevOpsReport | undefined
  isLoading: boolean
}

const TYPE_META: Record<StaleSecretType, { label: string; icon: React.ReactNode }> = {
  env_var: { label: 'Env Var', icon: <TerminalSquare className="h-4 w-4 text-gray-500" /> },
  ssh_key: { label: 'SSH Key', icon: <KeyRound className="h-4 w-4 text-gray-500" /> },
  vault_item: { label: 'Bóveda', icon: <Lock className="h-4 w-4 text-gray-500" /> },
}

function ageInDays(updatedAt: string): number {
  const then = new Date(updatedAt).getTime()
  if (Number.isNaN(then)) return 0
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24))
}

function CountStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2 text-center">
      <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  )
}

function SecretRow({ secret }: { secret: StaleSecret }) {
  const meta = TYPE_META[secret.type]
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        {meta.icon}
        <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
          {secret.label}
        </span>
      </div>
      <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {meta.label} · {ageInDays(secret.updated_at)}d
      </span>
    </li>
  )
}

export function SecretsHygieneWidget({ devops, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-48 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl" />
  }

  const secrets = devops?.secrets
  const total = (secrets?.env_vars ?? 0) + (secrets?.ssh_keys ?? 0) + (secrets?.vault_items ?? 0)

  if (!secrets || total === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        Sin secretos registrados
      </p>
    )
  }

  const stale = secrets.stale

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <CountStat label="Env Vars" value={secrets.env_vars} />
        <CountStat label="SSH Keys" value={secrets.ssh_keys} />
        <CountStat label="Bóveda" value={secrets.vault_items} />
      </div>

      <div
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
          stale > 0
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
        }`}
      >
        <RotateCcw className="h-4 w-4 shrink-0" />
        <span>
          {stale > 0
            ? `${stale} sin rotar hace más de ${secrets.stale_days} días`
            : `Todo rotado en los últimos ${secrets.stale_days} días 🎉`}
        </span>
      </div>

      {secrets.oldest.length > 0 && (
        <ul className="space-y-2">
          {secrets.oldest.map((secret) => (
            <SecretRow key={`${secret.type}-${secret.label}`} secret={secret} />
          ))}
        </ul>
      )}
    </div>
  )
}
