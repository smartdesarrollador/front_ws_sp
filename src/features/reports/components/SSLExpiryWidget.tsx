import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'
import type { DevOpsReport, ExpiringCert } from '../types'

interface Props {
  devops: DevOpsReport | undefined
  isLoading: boolean
}

function StatChip({
  label,
  value,
  icon,
  colorClass,
}: {
  label: string
  value: number
  icon: React.ReactNode
  colorClass: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2">
      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${colorClass}`}>
        {icon}
      </span>
      <div>
        <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
}

function CertRow({ cert }: { cert: ExpiringCert }) {
  const days = cert.days_until_expiry
  const expired = days !== null && days < 0
  const badgeClass = expired
    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  const label =
    days === null
      ? 'sin fecha'
      : expired
        ? `vencido hace ${Math.abs(days)}d`
        : `en ${days}d`

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2">
      <span className="truncate text-sm font-medium text-gray-900 dark:text-white">{cert.domain}</span>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
        {label}
      </span>
    </li>
  )
}

export function SSLExpiryWidget({ devops, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-48 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl" />
  }

  const ssl = devops?.ssl
  const total = (ssl?.valid ?? 0) + (ssl?.expiring ?? 0) + (ssl?.expired ?? 0)

  if (!ssl || total === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        Sin certificados SSL
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <StatChip
          label="Vigentes"
          value={ssl.valid}
          icon={<ShieldCheck className="h-4 w-4 text-white" />}
          colorClass="bg-green-500"
        />
        <StatChip
          label="Por vencer"
          value={ssl.expiring}
          icon={<ShieldAlert className="h-4 w-4 text-white" />}
          colorClass="bg-amber-500"
        />
        <StatChip
          label="Vencidos"
          value={ssl.expired}
          icon={<ShieldX className="h-4 w-4 text-white" />}
          colorClass="bg-red-500"
        />
      </div>

      {ssl.expiring_soon.length > 0 ? (
        <ul className="space-y-2">
          {ssl.expiring_soon.map((cert) => (
            <CertRow key={cert.id} cert={cert} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Ningún certificado próximo a vencer 🎉
        </p>
      )}
    </div>
  )
}
