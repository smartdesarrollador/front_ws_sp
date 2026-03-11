export type SSHKeyAlgorithm = 'RSA' | 'Ed25519' | 'ECDSA' | 'DSA'

export interface SSHKey {
  id: string
  name: string
  algorithm: SSHKeyAlgorithm
  public_key: string
  private_key?: string
  fingerprint: string
  description?: string
  last_used_at?: string
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface SSHKeyFilters {
  search?: string
}

export interface CreateSSHKeyRequest {
  name: string
  algorithm: SSHKeyAlgorithm
  public_key: string
  private_key?: string
  description?: string
  expires_at?: string
}

export type UpdateSSHKeyRequest = Partial<CreateSSHKeyRequest>
