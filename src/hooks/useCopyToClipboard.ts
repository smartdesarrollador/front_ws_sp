import { useCallback, useState } from 'react'

function legacyCopy(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  let success = false
  try {
    success = document.execCommand('copy')
  } catch {
    success = false
  }
  document.body.removeChild(textarea)
  return success
}

/**
 * navigator.clipboard requiere un contexto seguro (https o "localhost" exacto).
 * Hosts como *.local.test servidos por http no califican, así que ahí hay que
 * caer al fallback de execCommand('copy').
 */
export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      let success = false

      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text)
          success = true
        } catch {
          success = legacyCopy(text)
        }
      } else {
        success = legacyCopy(text)
      }

      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), resetDelay)
      }

      return success
    },
    [resetDelay]
  )

  return [copied, copy] as const
}
