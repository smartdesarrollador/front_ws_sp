import { useRef, useState } from 'react'
import { X, UploadCloud, FileText, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'

export interface ImportSummary {
  created: number
  skipped: number
  errors: { index: number; errors: unknown }[]
}

export interface ImportColumn<T> {
  label: string
  value: (item: T) => string
}

interface Props<T> {
  title: string
  /** `accept` attribute for the file input, e.g. ".vcf,.csv". */
  accept: string
  /** Hint about accepted formats, shown under the drop zone. */
  formatsHint?: string
  /** Synchronous text parser. Provide this OR `parseFile`. */
  parse?: (text: string, filename: string) => T[]
  /** Async file parser (handles its own reading; needed for binary/ZIP). Takes precedence over `parse`. */
  parseFile?: (file: File) => Promise<T[]>
  columns: ImportColumn<T>[]
  onImport: (items: T[]) => Promise<ImportSummary>
  onClose: () => void
}

const MAX_FILE_BYTES = 5 * 1024 * 1024
const PREVIEW_ROWS = 10

export default function ImportModal<T>({
  title,
  accept,
  formatsHint,
  parse,
  parseFile,
  columns,
  onImport,
  onClose,
}: Props<T>) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, true)

  const [items, setItems] = useState<T[]>([])
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [summary, setSummary] = useState<ImportSummary | null>(null)

  const applyParsed = (parsed: T[], name: string) => {
    setFileName(name)
    setItems(parsed)
    if (parsed.length === 0) {
      setParseError('No se reconocieron filas en el archivo. Revisa el formato.')
    }
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setParseError('')
    setSummary(null)
    setItems([])
    if (file.size > MAX_FILE_BYTES) {
      setParseError('El archivo supera los 5 MB.')
      return
    }
    setIsParsing(true)
    try {
      if (parseFile) {
        applyParsed(await parseFile(file), file.name)
      } else if (parse) {
        const reader = new FileReader()
        const text: string = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(String(reader.result ?? ''))
          reader.onerror = () => reject(reader.error)
          reader.readAsText(file)
        })
        applyParsed(parse(text, file.name), file.name)
      }
    } catch {
      setParseError('No se pudo leer el archivo.')
      setItems([])
    } finally {
      setIsParsing(false)
    }
  }

  const handleImport = async () => {
    setIsImporting(true)
    try {
      const result = await onImport(items)
      setSummary(result)
    } catch {
      setParseError('Ocurrió un error al importar. Intenta de nuevo.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-modal-title"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 id="import-modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Step 3: summary */}
          {summary ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Importación completada</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{summary.created}</div>
                  <div className="text-xs text-gray-500">Creados</div>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{summary.skipped}</div>
                  <div className="text-xs text-gray-500">Omitidos (límite)</div>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{summary.errors.length}</div>
                  <div className="text-xs text-gray-500">Con error</div>
                </div>
              </div>
              {summary.skipped > 0 && (
                <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Algunas filas no se importaron por el límite de tu plan.
                </p>
              )}
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: file picker */}
              <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 cursor-pointer hover:border-primary-400 transition-colors">
                <UploadCloud className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Haz clic para elegir un archivo
                </span>
                {formatsHint && <span className="text-xs text-gray-500">{formatsHint}</span>}
                <input
                  type="file"
                  accept={accept}
                  className="sr-only"
                  aria-label="Seleccionar archivo a importar"
                  data-testid="import-file-input"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </label>

              {isParsing && (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Procesando archivo…
                </p>
              )}

              {parseError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg p-3 text-sm">
                  {parseError}
                </div>
              )}

              {/* Step 2: preview */}
              {items.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>
                      <strong>{items.length}</strong> filas detectadas en{' '}
                      <span className="font-mono">{fileName}</span>
                    </span>
                  </p>
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          {columns.map((c) => (
                            <th
                              key={c.label}
                              className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                            >
                              {c.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {items.slice(0, PREVIEW_ROWS).map((item, i) => (
                          <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                            {columns.map((c) => (
                              <td key={c.label} className="px-3 py-2 text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                                {c.value(item)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {items.length > PREVIEW_ROWS && (
                    <p className="text-xs text-gray-500">
                      Mostrando {PREVIEW_ROWS} de {items.length} filas.
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={items.length === 0 || isImporting}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isImporting && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Importar{items.length > 0 ? ` ${items.length}` : ''}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
