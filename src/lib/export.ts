/**
 * Shared client-side export helpers for the Workspace.
 *
 * Generates downloadable files from already-loaded (and filtered) data, so most
 * exports require no backend call. CSV is escaped per RFC 4180; domain-native
 * formats (vCard, ICS, Netscape bookmarks) are produced so the output imports
 * cleanly into other tools. ZIP outputs (Markdown notes, code snippets) lazy-load
 * jszip to keep it out of the main bundle.
 *
 * NEVER pass secret/encrypted values to these helpers — exports are for
 * user-authored content only.
 */

/** Trigger a browser download for an in-memory blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Filesystem-safe slug for filenames. */
export function slugify(input: string): string {
  return (
    input
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'untitled'
  )
}

/** Escape a single CSV cell (RFC 4180): quote when it contains , " or newline. */
function csvCell(value: unknown): string {
  const s = value == null ? '' : String(value)
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export interface ExportColumn<T> {
  label: string
  value: (row: T) => unknown
}

/** Build an RFC 4180 CSV string from rows + column accessors. */
export function toCSV<T>(rows: T[], columns: ExportColumn<T>[]): string {
  const header = columns.map((c) => csvCell(c.label)).join(',')
  const body = rows.map((row) => columns.map((c) => csvCell(c.value(row))).join(','))
  return [header, ...body].join('\r\n')
}

/** Pretty-printed JSON string. */
export function toJSON(data: unknown): string {
  return JSON.stringify(data, null, 2)
}

// ── Domain-native formats ────────────────────────────────────────────────────

interface VCardContact {
  name: string
  email?: string
  phone?: string
  company?: string
  job_title?: string
  notes?: string
}

function vcardEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

/** Serialize contacts to a vCard 3.0 (.vcf) string. */
export function toVCard(contacts: VCardContact[]): string {
  return contacts
    .map((c) => {
      const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${vcardEscape(c.name)}`]
      if (c.email) lines.push(`EMAIL;TYPE=INTERNET:${vcardEscape(c.email)}`)
      if (c.phone) lines.push(`TEL:${vcardEscape(c.phone)}`)
      if (c.company || c.job_title) {
        lines.push(`ORG:${vcardEscape(c.company ?? '')}`)
        if (c.job_title) lines.push(`TITLE:${vcardEscape(c.job_title)}`)
      }
      if (c.notes) lines.push(`NOTE:${vcardEscape(c.notes)}`)
      lines.push('END:VCARD')
      return lines.join('\r\n')
    })
    .join('\r\n')
}

interface ICSEvent {
  id: string
  title: string
  description?: string | null
  start_date: string
  end_date: string
  all_day?: boolean
  location?: string | null
}

function icsDate(iso: string, allDay?: boolean): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`
  if (allDay) return `;VALUE=DATE:${date}`
  return `:${date}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
}

function icsEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

/** Serialize calendar events to an iCalendar (.ics) string. */
export function toICS(events: ICSEvent[]): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//RBAC Workspace//Export//EN']
  for (const e of events) {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${e.id}@rbac-workspace`)
    lines.push(`DTSTART${icsDate(e.start_date, e.all_day)}`)
    lines.push(`DTEND${icsDate(e.end_date, e.all_day)}`)
    lines.push(`SUMMARY:${icsEscape(e.title)}`)
    if (e.description) lines.push(`DESCRIPTION:${icsEscape(e.description)}`)
    if (e.location) lines.push(`LOCATION:${icsEscape(e.location)}`)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

interface HTMLBookmark {
  title: string
  url: string
  tags?: string[]
}

/** Serialize bookmarks to the Netscape bookmark file format (importable in browsers). */
export function toBookmarksHTML(bookmarks: HTMLBookmark[]): string {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const items = bookmarks
    .map((b) => {
      const tags = b.tags && b.tags.length ? ` TAGS="${escape(b.tags.join(','))}"` : ''
      return `    <DT><A HREF="${escape(b.url)}"${tags}>${escape(b.title)}</A>`
    })
    .join('\n')
  return [
    '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    '<TITLE>Bookmarks</TITLE>',
    '<H1>Bookmarks</H1>',
    '<DL><p>',
    items,
    '</DL><p>',
  ].join('\n')
}

// ── ZIP formats (lazy-load jszip) ────────────────────────────────────────────

interface MarkdownNote {
  title: string
  content: string
  category?: string
  tags?: string[]
  created_at?: string
}

/** Bundle notes as one Markdown file each, inside a ZIP blob. */
export async function toMarkdownZip(notes: MarkdownNote[]): Promise<Blob> {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const used = new Map<string, number>()
  for (const note of notes) {
    let base = slugify(note.title)
    const count = used.get(base) ?? 0
    used.set(base, count + 1)
    if (count > 0) base = `${base}-${count + 1}`
    const frontMatter = [
      '---',
      `title: ${JSON.stringify(note.title)}`,
      note.category ? `category: ${note.category}` : null,
      note.tags && note.tags.length ? `tags: [${note.tags.join(', ')}]` : null,
      note.created_at ? `created: ${note.created_at}` : null,
      '---',
      '',
    ]
      .filter((l) => l !== null)
      .join('\n')
    zip.file(`${base}.md`, `${frontMatter}\n# ${note.title}\n\n${note.content}\n`)
  }
  return zip.generateAsync({ type: 'blob' })
}

const LANG_EXT: Record<string, string> = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  bash: 'sh',
  sql: 'sql',
  html: 'html',
  css: 'css',
  json: 'json',
  yaml: 'yml',
  dockerfile: 'dockerfile',
  go: 'go',
  rust: 'rs',
  java: 'java',
  other: 'txt',
}

interface CodeSnippetExport {
  title: string
  code: string
  language: string
}

/** Bundle snippets as one source file each (extension by language), inside a ZIP blob. */
export async function toCodeZip(snippets: CodeSnippetExport[]): Promise<Blob> {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const used = new Map<string, number>()
  for (const snippet of snippets) {
    const ext = LANG_EXT[snippet.language] ?? 'txt'
    let base = slugify(snippet.title)
    const count = used.get(base) ?? 0
    used.set(base, count + 1)
    if (count > 0) base = `${base}-${count + 1}`
    zip.file(`${base}.${ext}`, snippet.code)
  }
  return zip.generateAsync({ type: 'blob' })
}
