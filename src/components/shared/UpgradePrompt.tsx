import { Lock } from 'lucide-react'

const HUB_URL = import.meta.env.VITE_HUB_URL ?? 'http://localhost:5175'

interface Props {
  feature: string
  title?: string
  message?: string
}

function UpgradePrompt({ feature, title, message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title ?? `Función no disponible: ${feature}`}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
        {message ?? 'Actualiza tu plan para acceder a esta función.'}
      </p>
      <a
        href={`${HUB_URL}/subscription`}
        className="btn btn-primary"
      >
        Actualizar plan
      </a>
    </div>
  )
}

export default UpgradePrompt
