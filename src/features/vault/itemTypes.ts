import { CreditCard, KeyRound, LogIn, StickyNote, type LucideIcon } from 'lucide-react'
import type { VaultItemType } from './types'

export interface VaultField {
  name: string
  label: string
  secret?: boolean // render masked + copy
  textarea?: boolean
}

interface VaultTypeMeta {
  label: string
  icon: LucideIcon
  color: string
  fields: VaultField[]
}

export const VAULT_TYPES: Record<VaultItemType, VaultTypeMeta> = {
  login: {
    label: 'Login',
    icon: LogIn,
    color: 'bg-blue-100 text-blue-700',
    fields: [
      { name: 'username', label: 'Usuario' },
      { name: 'url', label: 'URL' },
      { name: 'password', label: 'Contraseña', secret: true },
      { name: 'notes', label: 'Notas', textarea: true },
    ],
  },
  api_key: {
    label: 'API Key',
    icon: KeyRound,
    color: 'bg-purple-100 text-purple-700',
    fields: [
      { name: 'key', label: 'Clave / Token', secret: true },
      { name: 'notes', label: 'Notas', textarea: true },
    ],
  },
  secure_note: {
    label: 'Nota segura',
    icon: StickyNote,
    color: 'bg-amber-100 text-amber-700',
    fields: [{ name: 'note', label: 'Contenido', secret: true, textarea: true }],
  },
  card: {
    label: 'Tarjeta',
    icon: CreditCard,
    color: 'bg-emerald-100 text-emerald-700',
    fields: [
      { name: 'cardholder', label: 'Titular' },
      { name: 'number', label: 'Número', secret: true },
      { name: 'expiry', label: 'Vencimiento (MM/AA)' },
      { name: 'cvv', label: 'CVV', secret: true },
      { name: 'notes', label: 'Notas', textarea: true },
    ],
  },
}
