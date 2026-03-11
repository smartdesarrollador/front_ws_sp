import { useState } from 'react'
import { Shield, Plus, XCircle, AlertTriangle } from 'lucide-react'
import FeatureGate from '@/components/shared/FeatureGate'
import UpgradePrompt from '@/components/shared/UpgradePrompt'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useSSLCerts } from './hooks/useSSLCerts'
import { useDeleteSSLCert } from './hooks/useDeleteSSLCert'
import { SSLCertCard } from './components/SSLCertCard'
import { SSLCertModal } from './components/SSLCertModal'
import { getCertStatus } from './types'
import type { SSLCertificate, CertStatus } from './types'

const SSL_CERTS_FREE_LIMIT = 1

const FILTER_LABELS: Record<'all' | CertStatus, string> = {
  all: 'Todos',
  valid: 'Válidos',
  expiring: 'Por vencer',
  expired: 'Expirados',
}

export default function SSLCertsPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | CertStatus>('all')
  const [showModal, setShowModal] = useState(false)
  const [certToEdit, setCertToEdit] = useState<SSLCertificate | null>(null)

  const { data, isLoading } = useSSLCerts()
  const deleteCert = useDeleteSSLCert()
  const { getLimit } = useFeatureGate()

  const certs = data?.certs ?? []
  const total = data?.total ?? 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawLimit: number | null = (getLimit as unknown as (key: string) => number | null)(
    'ssl_certs',
  )
  const limit = rawLimit ?? SSL_CERTS_FREE_LIMIT

  const filteredCerts = certs.filter(
    (c) => statusFilter === 'all' || getCertStatus(c) === statusFilter,
  )

  const expiredCount = certs.filter((c) => getCertStatus(c) === 'expired').length
  const expiringCount = certs.filter((c) => getCertStatus(c) === 'expiring').length

  const handleEdit = (cert: SSLCertificate) => {
    setCertToEdit(cert)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setCertToEdit(null)
  }

  return (
    <FeatureGate
      feature="ssl_certs"
      fallback={
        <UpgradePrompt
          feature="Certificados SSL"
          message="Gestiona tus certificados SSL con un plan de pago."
        />
      }
    >
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Certificados SSL</h1>
            {!isLoading && (
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-full font-medium">
                {total}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Certificado
          </button>
        </div>

        {/* Alert banners */}
        {expiredCount > 0 && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            <XCircle className="w-4 h-4 shrink-0" />
            {expiredCount} certificado{expiredCount > 1 ? 's' : ''} expirado
            {expiredCount > 1 ? 's' : ''}
          </div>
        )}
        {expiringCount > 0 && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {expiringCount} certificado{expiringCount > 1 ? 's' : ''} por vencer pronto
          </div>
        )}

        {/* Plan limit banner */}
        {!isLoading && total >= limit * 0.8 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            Has usado {total} de {limit} certificados SSL disponibles en tu plan.
          </div>
        )}

        {/* Status filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(Object.keys(FILTER_LABELS) as Array<'all' | CertStatus>).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredCerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Shield className="w-12 h-12 mb-3" />
              <p className="text-sm">No hay certificados SSL</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredCerts.map((cert) => (
                <SSLCertCard
                  key={cert.id}
                  cert={cert}
                  onEdit={() => handleEdit(cert)}
                  onDelete={() => deleteCert.mutate(cert.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && <SSLCertModal cert={certToEdit} onClose={handleCloseModal} />}
    </FeatureGate>
  )
}
