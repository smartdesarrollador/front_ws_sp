/** Derive the WebSocket origin from the configured API URL. */
export function deriveWsUrl(path: string): string {
  const apiUrl = import.meta.env.VITE_API_URL ?? ''
  let origin = apiUrl
  if (!origin) {
    // Fall back to the current page origin (same host serving the API via proxy).
    origin = window.location.origin
  }
  const wsOrigin = origin.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:')
  return `${wsOrigin}${path}`
}
