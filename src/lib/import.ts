/**
 * Client-side parsers for the import feature — inverses of `src/lib/export.ts`.
 *
 * Each parser turns a file's text into rows of create-request shapes. They are
 * lenient (skip blanks, ignore unknown columns); the backend re-validates every
 * row, so these never need to be exhaustive. Use the `parseContacts` /
 * `parseBookmarks` dispatchers to pick a parser by file extension/content.
 */

export interface ParsedContact {
  name: string
  email?: string
  phone?: string
  company?: string
  job_title?: string
  notes?: string
}

export interface ParsedBookmark {
  url: string
  title: string
  description?: string
  tags?: string[]
}

/** RFC 4180 CSV parser → array of rows of string cells. Inverse of `toCSV`. */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  let i = 0
  while (i < text.length) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += c
      i++
      continue
    }
    if (c === '"') {
      inQuotes = true
      i++
      continue
    }
    if (c === ',') {
      row.push(field)
      field = ''
      i++
      continue
    }
    if (c === '\r') {
      i++
      continue
    }
    if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i++
      continue
    }
    field += c
    i++
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function unescapeVCard(value: string): string {
  return value.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\')
}

/** Parse a vCard (.vcf) string into contacts. */
export function parseVCard(text: string): ParsedContact[] {
  const contacts: ParsedContact[] = []
  const blocks = text.split(/BEGIN:VCARD/i).slice(1)
  for (const block of blocks) {
    const contact: ParsedContact = { name: '' }
    for (const rawLine of block.split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line || /^END:VCARD/i.test(line)) continue
      const colon = line.indexOf(':')
      if (colon === -1) continue
      const key = line.slice(0, colon).split(';')[0].toUpperCase()
      const value = unescapeVCard(line.slice(colon + 1).trim())
      if (!value) continue
      if (key === 'FN') contact.name = value
      else if (key === 'EMAIL') contact.email ??= value
      else if (key === 'TEL') contact.phone ??= value
      else if (key === 'ORG') contact.company ??= value.split(';')[0]
      else if (key === 'TITLE') contact.job_title ??= value
      else if (key === 'NOTE') contact.notes ??= value
    }
    if (contact.name || contact.email) contacts.push(contact)
  }
  return contacts
}

const CONTACT_HEADER_MAP: Record<string, keyof ParsedContact> = {
  nombre: 'name',
  name: 'name',
  'nombre completo': 'name',
  email: 'email',
  correo: 'email',
  'e-mail': 'email',
  telefono: 'phone',
  teléfono: 'phone',
  phone: 'phone',
  empresa: 'company',
  company: 'company',
  cargo: 'job_title',
  puesto: 'job_title',
  job_title: 'job_title',
  title: 'job_title',
  notas: 'notes',
  notes: 'notes',
}

function normHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/** Parse a contacts CSV (with header row) into contacts. */
export function parseContactsCSV(text: string): ParsedContact[] {
  const rows = parseCSV(text).filter((r) => r.some((c) => c.trim() !== ''))
  if (rows.length < 1) return []
  const header = rows[0].map((h) => CONTACT_HEADER_MAP[normHeader(h)])
  const out: ParsedContact[] = []
  for (const row of rows.slice(1)) {
    const c: ParsedContact = { name: '' }
    header.forEach((field, idx) => {
      if (field && row[idx] != null && row[idx].trim() !== '') {
        c[field] = row[idx].trim()
      }
    })
    if (c.name || c.email) out.push(c)
  }
  return out
}

/** Parse a Netscape bookmarks HTML file into bookmarks. */
export function parseBookmarksHTML(text: string): ParsedBookmark[] {
  const doc = new DOMParser().parseFromString(text, 'text/html')
  const out: ParsedBookmark[] = []
  doc.querySelectorAll('a[href]').forEach((a) => {
    const url = a.getAttribute('href')?.trim()
    if (!url) return
    const title = (a.textContent ?? '').trim() || url
    const tagsAttr = a.getAttribute('tags') ?? a.getAttribute('TAGS')
    const tags = tagsAttr ? tagsAttr.split(',').map((t) => t.trim()).filter(Boolean) : undefined
    out.push({ url, title, tags })
  })
  return out
}

const BOOKMARK_HEADER_MAP: Record<string, keyof ParsedBookmark> = {
  titulo: 'title',
  título: 'title',
  title: 'title',
  url: 'url',
  enlace: 'url',
  descripcion: 'description',
  descripción: 'description',
  description: 'description',
  tags: 'tags',
  etiquetas: 'tags',
}

/** Parse a bookmarks CSV (with header row) into bookmarks. */
export function parseBookmarksCSV(text: string): ParsedBookmark[] {
  const rows = parseCSV(text).filter((r) => r.some((c) => c.trim() !== ''))
  if (rows.length < 1) return []
  const header = rows[0].map((h) => BOOKMARK_HEADER_MAP[normHeader(h)])
  const out: ParsedBookmark[] = []
  for (const row of rows.slice(1)) {
    let url = ''
    let title = ''
    let description: string | undefined
    let tags: string[] | undefined
    header.forEach((field, idx) => {
      const v = (row[idx] ?? '').trim()
      if (!field || !v) return
      if (field === 'url') url = v
      else if (field === 'title') title = v
      else if (field === 'description') description = v
      else if (field === 'tags') tags = v.split(/[;,]/).map((t) => t.trim()).filter(Boolean)
    })
    if (url) out.push({ url, title: title || url, description, tags })
  }
  return out
}

/** Parse a bookmarks JSON export into bookmarks. */
export function parseBookmarksJSON(text: string): ParsedBookmark[] {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return []
  }
  if (!Array.isArray(data)) return []
  const out: ParsedBookmark[] = []
  for (const raw of data) {
    if (raw && typeof raw === 'object' && 'url' in raw && typeof (raw as { url: unknown }).url === 'string') {
      const r = raw as { url: string; title?: string; description?: string; tags?: string[] }
      out.push({
        url: r.url,
        title: r.title || r.url,
        description: r.description,
        tags: Array.isArray(r.tags) ? r.tags : undefined,
      })
    }
  }
  return out
}

/** Dispatch to the right contact parser by filename extension / content sniff. */
export function parseContacts(text: string, filename: string): ParsedContact[] {
  if (/\.vcf$/i.test(filename)) return parseVCard(text)
  if (/\.csv$/i.test(filename)) return parseContactsCSV(text)
  if (text.includes('BEGIN:VCARD')) return parseVCard(text)
  return parseContactsCSV(text)
}

/** Dispatch to the right bookmark parser by filename extension / content sniff. */
export function parseBookmarks(text: string, filename: string): ParsedBookmark[] {
  if (/\.html?$/i.test(filename)) return parseBookmarksHTML(text)
  if (/\.json$/i.test(filename)) return parseBookmarksJSON(text)
  if (/\.csv$/i.test(filename)) return parseBookmarksCSV(text)
  const trimmed = text.trimStart()
  if (trimmed.startsWith('[')) return parseBookmarksJSON(text)
  if (trimmed.startsWith('<') || text.includes('<A ') || text.includes('<a ')) return parseBookmarksHTML(text)
  return parseBookmarksCSV(text)
}

// ── Notes / Tasks / Calendar ─────────────────────────────────────────────────

export interface ParsedNote {
  title: string
  content?: string
  category?: string
  tags?: string[]
  is_pinned?: boolean
}

export interface ParsedTask {
  title: string
  description?: string
  status?: string
  priority?: string
  due_date?: string | null
}

export interface ParsedEvent {
  title: string
  start_datetime: string
  end_datetime: string
  is_all_day?: boolean
  location?: string
  description?: string
}

/** Read a File as text. */
export function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

/** Read a File as an ArrayBuffer (for ZIPs). */
export function readFileArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

/** Parse a notes JSON export into notes. */
export function parseNotesJSON(text: string): ParsedNote[] {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return []
  }
  if (!Array.isArray(data)) return []
  const out: ParsedNote[] = []
  for (const raw of data) {
    if (raw && typeof raw === 'object' && typeof (raw as { title?: unknown }).title === 'string') {
      const r = raw as { title: string; content?: string; category?: string; tags?: string[]; is_pinned?: boolean }
      out.push({
        title: r.title,
        content: r.content ?? '',
        category: r.category,
        tags: Array.isArray(r.tags) ? r.tags : undefined,
        is_pinned: r.is_pinned,
      })
    }
  }
  return out
}

/** Parse a Markdown ZIP (from `toMarkdownZip`) into notes — one .md per note. */
export async function parseNotesZip(buffer: ArrayBuffer): Promise<ParsedNote[]> {
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const out: ParsedNote[] = []
  const entries = Object.values(zip.files).filter((f) => !f.dir && /\.md$/i.test(f.name))
  for (const entry of entries) {
    const text = await entry.async('string')
    out.push(parseMarkdownNote(text, entry.name))
  }
  return out
}

/** Parse one Markdown note (front-matter + body) as written by `toMarkdownZip`. */
function parseMarkdownNote(text: string, filename: string): ParsedNote {
  const note: ParsedNote = { title: filename.replace(/\.md$/i, ''), content: text }
  const fm = text.match(/^---\n([\s\S]*?)\n---\n?/)
  if (fm) {
    for (const line of fm[1].split('\n')) {
      const idx = line.indexOf(':')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim()
      if (key === 'title') {
        try {
          note.title = JSON.parse(value)
        } catch {
          note.title = value
        }
      } else if (key === 'category') {
        note.category = value
      } else if (key === 'tags') {
        note.tags = value.replace(/^\[|\]$/g, '').split(',').map((t) => t.trim()).filter(Boolean)
      }
    }
    let body = text.slice(fm[0].length)
    body = body.replace(/^#\s.*\n+/, '') // drop the leading "# Title" heading
    note.content = body.trimEnd()
  }
  return note
}

const TASK_HEADER_MAP: Record<string, keyof ParsedTask> = {
  titulo: 'title',
  título: 'title',
  title: 'title',
  descripcion: 'description',
  descripción: 'description',
  description: 'description',
  estado: 'status',
  status: 'status',
  prioridad: 'priority',
  priority: 'priority',
  vencimiento: 'due_date',
  due_date: 'due_date',
}

/** Parse a tasks CSV (with header row) into tasks. */
export function parseTasksCSV(text: string): ParsedTask[] {
  const rows = parseCSV(text).filter((r) => r.some((c) => c.trim() !== ''))
  if (rows.length < 1) return []
  const header = rows[0].map((h) => TASK_HEADER_MAP[normHeader(h)])
  const out: ParsedTask[] = []
  for (const row of rows.slice(1)) {
    const t: ParsedTask = { title: '' }
    header.forEach((field, idx) => {
      const v = (row[idx] ?? '').trim()
      if (field && v) t[field] = v as never
    })
    if (t.title) out.push(t)
  }
  return out
}

/** Parse a tasks JSON export into tasks. */
export function parseTasksJSON(text: string): ParsedTask[] {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return []
  }
  if (!Array.isArray(data)) return []
  const out: ParsedTask[] = []
  for (const raw of data) {
    if (raw && typeof raw === 'object' && typeof (raw as { title?: unknown }).title === 'string') {
      const r = raw as ParsedTask
      out.push({
        title: r.title,
        description: r.description ?? undefined,
        status: r.status ?? undefined,
        priority: r.priority ?? undefined,
        due_date: r.due_date ?? undefined,
      })
    }
  }
  return out
}

function unescapeICS(value: string): string {
  return value.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\')
}

/** Convert an ICS date/datetime value to an ISO string. */
function icsToISO(value: string, isDate: boolean): string {
  const v = value.trim()
  const y = v.slice(0, 4)
  const mo = v.slice(4, 6)
  const d = v.slice(6, 8)
  if (isDate || v.length === 8) return `${y}-${mo}-${d}T00:00:00Z`
  const hh = v.slice(9, 11) || '00'
  const mi = v.slice(11, 13) || '00'
  const ss = v.slice(13, 15) || '00'
  // ICS times without a trailing Z are treated as UTC for simplicity.
  return `${y}-${mo}-${d}T${hh}:${mi}:${ss}Z`
}

/** Parse an iCalendar (.ics) string into events (backend write contract). */
export function parseICS(text: string): ParsedEvent[] {
  const out: ParsedEvent[] = []
  const blocks = text.split(/BEGIN:VEVENT/i).slice(1)
  for (const block of blocks) {
    const body = block.split(/END:VEVENT/i)[0]
    let title = ''
    let start = ''
    let end = ''
    let allDay = false
    let location: string | undefined
    let description: string | undefined
    for (const rawLine of body.split(/\r?\n/)) {
      const line = rawLine.trim()
      const colon = line.indexOf(':')
      if (colon === -1) continue
      const keyPart = line.slice(0, colon).toUpperCase()
      const value = line.slice(colon + 1).trim()
      const key = keyPart.split(';')[0]
      const isDate = keyPart.includes('VALUE=DATE')
      if (key === 'SUMMARY') title = unescapeICS(value)
      else if (key === 'DTSTART') {
        start = icsToISO(value, isDate)
        if (isDate) allDay = true
      } else if (key === 'DTEND') end = icsToISO(value, isDate)
      else if (key === 'LOCATION') location = unescapeICS(value)
      else if (key === 'DESCRIPTION') description = unescapeICS(value)
    }
    if (title && start) {
      out.push({ title, start_datetime: start, end_datetime: end || start, is_all_day: allDay, location, description })
    }
  }
  return out
}

// ── File-level dispatchers (async; handle text vs binary reads) ──────────────

/** Read + parse a notes file (.zip → Markdown bundle, otherwise JSON). */
export async function parseNotesFile(file: File): Promise<ParsedNote[]> {
  if (/\.zip$/i.test(file.name)) return parseNotesZip(await readFileArrayBuffer(file))
  return parseNotesJSON(await readFileText(file))
}

/** Read + parse a tasks file (CSV or JSON). */
export async function parseTasksFile(file: File): Promise<ParsedTask[]> {
  const text = await readFileText(file)
  if (/\.json$/i.test(file.name) || text.trimStart().startsWith('[')) return parseTasksJSON(text)
  return parseTasksCSV(text)
}

/** Read + parse a calendar file (ICS). */
export async function parseCalendarFile(file: File): Promise<ParsedEvent[]> {
  return parseICS(await readFileText(file))
}
