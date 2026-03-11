import { Pencil, Trash2, RefreshCw } from 'lucide-react'
import { CertStatusBadge } from './CertStatusBadge'
import { getCertStatus, getDaysLeft } from '../types'
import type { SSLCertificate } from '../types'

interface SSLCertCardProps {
  cert: SSLCertificate
  onEdit: () => void
  onDelete: () => void
}

export function SSLCertCard({ cert, onEdit, onDelete }: SSLCertCardProps) {
  const status = getCertStatus(cert)
  const daysLeft = getDaysLeft(cert)

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar el certificado para ${cert.domain}?`)) {
      onDelete()
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="flex items-start justify-between py-4 px-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-semibold text-sm text-gray-900">{cert.domain}</span>
          <CertStatusBadge status={status} />
          {cert.auto_renew && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              <RefreshCw className="w-3 h-3" />
              Auto-renew
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
          {cert.issuer && <span>{cert.issuer}</span>}
          <span>Vence: {formatDate(cert.expires_at)}</span>
        </div>

        <div className="mt-1 text-xs">
          {status === 'expired' ? (
            <span className="text-red-600 font-medium">
              Expirado hace {Math.abs(daysLeft)} días
            </span>
          ) : (
            <span className={status === 'expiring' ? 'text-yellow-600 font-medium' : 'text-green-600'}>
              {daysLeft} días restantes
            </span>
          )}
        </div>

        {cert.san && cert.san.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {cert.san.map((s) => (
              <code
                key={s}
                className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono"
              >
                {s}
              </code>
            ))}
          </div>
        )}

        {cert.notes && <p className="mt-1 text-xs text-gray-400">{cert.notes}</p>}
      </div>

      <div className="flex items-center gap-1 ml-4 shrink-0">
        <button
          onClick={onEdit}
          aria-label={`Editar ${cert.domain}`}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          aria-label={`Eliminar ${cert.domain}`}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
