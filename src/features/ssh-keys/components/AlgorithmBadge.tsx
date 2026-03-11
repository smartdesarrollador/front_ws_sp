import type { SSHKeyAlgorithm } from '../types'

export const ALGORITHM_LABELS: Record<SSHKeyAlgorithm, string> = {
  RSA: 'RSA',
  Ed25519: 'Ed25519',
  ECDSA: 'ECDSA',
  DSA: 'DSA',
}

export const ALGORITHM_COLORS: Record<SSHKeyAlgorithm, string> = {
  RSA: 'bg-blue-100 text-blue-700',
  Ed25519: 'bg-green-100 text-green-700',
  ECDSA: 'bg-purple-100 text-purple-700',
  DSA: 'bg-gray-100 text-gray-600',
}

interface Props {
  algorithm: SSHKeyAlgorithm
}

export function AlgorithmBadge({ algorithm }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ALGORITHM_COLORS[algorithm]}`}
    >
      {ALGORITHM_LABELS[algorithm]}
    </span>
  )
}
