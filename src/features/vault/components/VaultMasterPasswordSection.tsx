import { useState } from 'react'
import { CheckCircle, Vault } from 'lucide-react'
import { useVaultStatus } from '../hooks/useVaultStatus'
import {
  useChangeMasterPassword,
  useRecoverVault,
  useSetupMasterPassword,
} from '../hooks/useMasterPassword'
import { RecoveryCodeDisplay } from './RecoveryCodeDisplay'

const inputCls =
  'mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'

export function VaultMasterPasswordSection() {
  const { data: status, isLoading } = useVaultStatus()
  const setup = useSetupMasterPassword()
  const change = useChangeMasterPassword()
  const recover = useRecoverVault()

  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [current, setCurrent] = useState('')
  const [recoveryInput, setRecoveryInput] = useState('')
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null)
  const [mode, setMode] = useState<'change' | 'recover'>('change')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const reset = () => {
    setNewPass('')
    setConfirm('')
    setCurrent('')
    setRecoveryInput('')
  }

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPass.length < 8) return setError('Mínimo 8 caracteres.')
    if (newPass !== confirm) return setError('Las contraseñas no coinciden.')
    setup.mutate(newPass, {
      onSuccess: (data) => {
        setRecoveryCode(data.recovery_code)
        reset()
      },
    })
  }

  const handleChange = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (newPass.length < 8) return setError('Mínimo 8 caracteres.')
    if (newPass !== confirm) return setError('Las contraseñas no coinciden.')
    change.mutate(
      { current, next: newPass },
      {
        onSuccess: () => {
          setSuccess('Contraseña maestra actualizada.')
          reset()
        },
        onError: () => setError('Contraseña maestra actual incorrecta.'),
      },
    )
  }

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (newPass.length < 8) return setError('Mínimo 8 caracteres.')
    if (newPass !== confirm) return setError('Las contraseñas no coinciden.')
    recover.mutate(
      { recoveryCode: recoveryInput, next: newPass },
      {
        onSuccess: (data) => {
          setRecoveryCode(data.recovery_code)
          setSuccess('Acceso recuperado. Guarda tu nuevo código.')
          reset()
        },
        onError: () => setError('Código de recuperación inválido.'),
      },
    )
  }

  if (isLoading) return null

  return (
    <div className="rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Vault className="h-5 w-5 text-gray-500" />
        <h3 className="text-base font-medium text-gray-900">Contraseña maestra de la Bóveda</h3>
      </div>

      {recoveryCode && <RecoveryCodeDisplay code={recoveryCode} />}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      {!status?.is_configured ? (
        <form onSubmit={handleSetup} className="space-y-4" data-testid="vault-setup-form">
          <p className="text-sm text-gray-500">
            Crea una contraseña maestra (distinta de la de tu cuenta) para proteger tus datos.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña maestra</label>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className={inputCls} aria-label="Contraseña maestra" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar contraseña maestra</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} aria-label="Confirmar contraseña maestra" />
          </div>
          <button type="submit" disabled={setup.isPending} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
            {setup.isPending ? 'Creando...' : 'Crear contraseña maestra'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => setMode('change')} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${mode === 'change' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}>
              Cambiar
            </button>
            <button type="button" onClick={() => setMode('recover')} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${mode === 'recover' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}>
              Recuperar con código
            </button>
          </div>

          {mode === 'change' ? (
            <form onSubmit={handleChange} className="space-y-4" data-testid="vault-change-form">
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña maestra actual</label>
                <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputCls} aria-label="Contraseña maestra actual" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nueva contraseña maestra</label>
                <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className={inputCls} aria-label="Nueva contraseña maestra" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar nueva contraseña</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} aria-label="Confirmar nueva contraseña maestra" />
              </div>
              <button type="submit" disabled={change.isPending} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
                {change.isPending ? 'Guardando...' : 'Cambiar contraseña maestra'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRecover} className="space-y-4" data-testid="vault-recover-form">
              <div>
                <label className="block text-sm font-medium text-gray-700">Código de recuperación</label>
                <input type="text" value={recoveryInput} onChange={(e) => setRecoveryInput(e.target.value)} className={inputCls} aria-label="Código de recuperación" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nueva contraseña maestra</label>
                <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className={inputCls} aria-label="Nueva contraseña maestra (recuperación)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar nueva contraseña</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} aria-label="Confirmar nueva contraseña (recuperación)" />
              </div>
              <button type="submit" disabled={recover.isPending} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
                {recover.isPending ? 'Recuperando...' : 'Recuperar acceso'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
