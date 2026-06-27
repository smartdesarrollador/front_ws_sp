import { useState } from 'react'
import { Lock } from 'lucide-react'
import { useUnlockVault } from '../hooks/useUnlockVault'

export function UnlockPrompt() {
  const [password, setPassword] = useState('')
  const unlock = useUnlockVault()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password) unlock.mutate(password, { onSuccess: () => setPassword('') })
  }

  const errorStatus = (unlock.error as { response?: { status?: number } })?.response?.status

  const errorMessage =
    errorStatus === 429
      ? 'Demasiados intentos. Espera unos minutos.'
      : errorStatus === 401
        ? 'Contraseña maestra incorrecta.'
        : 'No se pudo desbloquear. Inténtalo de nuevo.'

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bóveda bloqueada</h2>
        <p className="mt-1 text-sm text-gray-500">
          Ingresa tu contraseña maestra para ver tus datos protegidos.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña maestra"
            aria-label="Contraseña maestra"
            autoFocus
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          {unlock.isError && <p className="text-xs text-red-600">{errorMessage}</p>}
          <button
            type="submit"
            disabled={unlock.isPending || !password}
            className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {unlock.isPending ? 'Desbloqueando...' : 'Desbloquear'}
          </button>
        </form>
      </div>
    </div>
  )
}
