import { useState } from 'react'
import { AlertTriangle, Copy, Check } from 'lucide-react'

export function RecoveryCodeDisplay({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-4 space-y-2">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
        <AlertTriangle className="h-4 w-4" />
        <p className="text-sm font-medium">Guarda tu código de recuperación</p>
      </div>
      <p className="text-xs text-amber-700 dark:text-amber-300">
        Es la única forma de recuperar el acceso si olvidas tu contraseña maestra. No se volverá a mostrar.
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 select-all rounded bg-white dark:bg-gray-800 px-3 py-2 font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
          {code}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label="Copiar código de recuperación"
          className="rounded-lg border border-amber-300 p-2 text-amber-700 hover:bg-amber-100"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
