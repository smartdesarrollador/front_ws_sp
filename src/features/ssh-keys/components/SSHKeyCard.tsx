import { useState } from 'react'
import { Edit2, Trash2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { AlgorithmBadge } from './AlgorithmBadge'
import type { SSHKey } from '../types'

interface Props {
  sshKey: SSHKey
  onEdit: () => void
  onDelete: () => void
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}

function isExpiringSoon(expiresAt: string): boolean {
  const thirtyDays = 30 * 24 * 60 * 60 * 1000
  const expDate = new Date(expiresAt)
  const now = new Date()
  return expDate > now && expDate.getTime() - now.getTime() < thirtyDays
}

export function SSHKeyCard({ sshKey, onEdit, onDelete }: Props) {
  const [fingerprintCopied, setFingerprintCopied] = useState(false)
  const [publicKeyCopied, setPublicKeyCopied] = useState(false)
  const [showPublicKey, setShowPublicKey] = useState(false)

  const handleCopyFingerprint = () => {
    navigator.clipboard.writeText(sshKey.fingerprint)
    setFingerprintCopied(true)
    setTimeout(() => setFingerprintCopied(false), 2000)
  }

  const handleCopyPublicKey = () => {
    navigator.clipboard.writeText(sshKey.public_key)
    setPublicKeyCopied(true)
    setTimeout(() => setPublicKeyCopied(false), 2000)
  }

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar la clave SSH "${sshKey.name}"?`)) {
      onDelete()
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {sshKey.name}
          </h3>
          <AlgorithmBadge algorithm={sshKey.algorithm} />
          {sshKey.expires_at && isExpired(sshKey.expires_at) && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Expirada
            </span>
          )}
          {sshKey.expires_at && !isExpired(sshKey.expires_at) && isExpiringSoon(sshKey.expires_at) && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              Expira pronto
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            aria-label="Editar clave SSH"
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            aria-label="Eliminar clave SSH"
            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fingerprint */}
      <div className="flex items-center gap-2">
        <code className="text-xs font-mono text-gray-600 dark:text-gray-400 truncate flex-1 min-w-0">
          {sshKey.fingerprint}
        </code>
        <button
          onClick={handleCopyFingerprint}
          aria-label="Copiar fingerprint"
          className="flex-shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
        >
          {fingerprintCopied ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Public key collapsible */}
      <div>
        <button
          onClick={() => setShowPublicKey((v) => !v)}
          className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
        >
          {showPublicKey ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Ocultar clave pública
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Mostrar clave pública
            </>
          )}
        </button>
        {showPublicKey && (
          <div className="mt-2 flex items-start gap-2">
            <code className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all flex-1">
              {sshKey.public_key}
            </code>
            <button
              onClick={handleCopyPublicKey}
              aria-label="Copiar clave pública"
              className="flex-shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
            >
              {publicKeyCopied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {sshKey.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{sshKey.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 pt-1 border-t border-gray-100 dark:border-gray-700">
        <span>Creada: {formatShortDate(sshKey.created_at)}</span>
        {sshKey.last_used_at && (
          <span>Último uso: {formatShortDate(sshKey.last_used_at)}</span>
        )}
      </div>
    </div>
  )
}
