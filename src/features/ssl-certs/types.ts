export type CertStatus = 'valid' | 'expiring' | 'expired'

export interface SSLCertificate {
  id: string
  domain: string
  issuer?: string
  valid_from?: string
  expires_at: string
  auto_renew: boolean
  san?: string[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface SSLCertFilters {
  status?: CertStatus | 'all'
}

export interface CreateSSLCertRequest {
  domain: string
  issuer?: string
  valid_from?: string
  expires_at: string
  auto_renew?: boolean
  san?: string[]
  notes?: string
}

export type UpdateSSLCertRequest = Partial<CreateSSLCertRequest>

export function getCertStatus(cert: SSLCertificate): CertStatus {
  const now = new Date()
  const expires = new Date(cert.expires_at)
  const daysLeft = Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return 'expired'
  if (daysLeft <= 30) return 'expiring'
  return 'valid'
}

export function getDaysLeft(cert: SSLCertificate): number {
  const now = new Date()
  const expires = new Date(cert.expires_at)
  return Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
