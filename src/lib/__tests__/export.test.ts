import { describe, it, expect } from 'vitest'
import {
  slugify,
  toCSV,
  toJSON,
  toVCard,
  toICS,
  toBookmarksHTML,
  toMarkdownZip,
  toCodeZip,
} from '../export'

describe('toCSV', () => {
  it('escapes commas, quotes and newlines (RFC 4180)', () => {
    const rows = [{ name: 'Doe, Jane', note: 'say "hi"', extra: 'line1\nline2' }]
    const csv = toCSV(rows, [
      { label: 'Name', value: (r) => r.name },
      { label: 'Note', value: (r) => r.note },
      { label: 'Extra', value: (r) => r.extra },
    ])
    const [header, body] = csv.split('\r\n')
    expect(header).toBe('Name,Note,Extra')
    expect(body).toBe('"Doe, Jane","say ""hi""","line1\nline2"')
  })

  it('leaves plain values unquoted', () => {
    const csv = toCSV([{ a: 'x', b: 'y' }], [
      { label: 'A', value: (r) => r.a },
      { label: 'B', value: (r) => r.b },
    ])
    expect(csv).toBe('A,B\r\nx,y')
  })

  it('renders null/undefined as empty cells', () => {
    const csv = toCSV([{ a: null, b: undefined }], [
      { label: 'A', value: (r) => r.a },
      { label: 'B', value: (r) => r.b },
    ])
    expect(csv).toBe('A,B\r\n,')
  })
})

describe('slugify', () => {
  it('normalizes accents, spaces and punctuation', () => {
    expect(slugify('Café del Día!')).toBe('cafe-del-dia')
  })
  it('falls back to "untitled" for empty input', () => {
    expect(slugify('!!!')).toBe('untitled')
  })
})

describe('toVCard', () => {
  it('produces a valid vCard with escaped fields', () => {
    const vcf = toVCard([{ name: 'Jane Doe', email: 'j@x.com', company: 'Acme; Inc' }])
    expect(vcf).toContain('BEGIN:VCARD')
    expect(vcf).toContain('VERSION:3.0')
    expect(vcf).toContain('FN:Jane Doe')
    expect(vcf).toContain('EMAIL;TYPE=INTERNET:j@x.com')
    expect(vcf).toContain('ORG:Acme\\; Inc')
    expect(vcf).toContain('END:VCARD')
  })
})

describe('toICS', () => {
  it('produces a VCALENDAR with a timed VEVENT', () => {
    const ics = toICS([
      {
        id: 'e1',
        title: 'Standup',
        start_date: '2026-06-01T09:00:00Z',
        end_date: '2026-06-01T09:30:00Z',
      },
    ])
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('UID:e1@rbac-workspace')
    expect(ics).toContain('DTSTART:20260601T090000Z')
    expect(ics).toContain('SUMMARY:Standup')
    expect(ics).toContain('END:VCALENDAR')
  })

  it('uses DATE value for all-day events', () => {
    const ics = toICS([
      { id: 'e2', title: 'Holiday', start_date: '2026-06-01T00:00:00Z', end_date: '2026-06-02T00:00:00Z', all_day: true },
    ])
    expect(ics).toContain('DTSTART;VALUE=DATE:20260601')
  })
})

describe('toBookmarksHTML', () => {
  it('produces Netscape bookmark format and escapes HTML', () => {
    const html = toBookmarksHTML([{ title: 'A & B', url: 'https://x.com?a=1&b=2' }])
    expect(html).toContain('<!DOCTYPE NETSCAPE-Bookmark-file-1>')
    expect(html).toContain('A &amp; B')
    expect(html).toContain('HREF="https://x.com?a=1&amp;b=2"')
  })
})

describe('toJSON', () => {
  it('pretty-prints', () => {
    expect(toJSON({ a: 1 })).toBe('{\n  "a": 1\n}')
  })
})

describe('zip exports', () => {
  it('toMarkdownZip returns a non-empty Blob', async () => {
    const blob = await toMarkdownZip([
      { title: 'Note one', content: 'hello', category: 'work', tags: ['a'] },
      { title: 'Note one', content: 'dup title', category: 'work' },
    ])
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.size).toBeGreaterThan(0)
  })

  it('toCodeZip returns a non-empty Blob', async () => {
    const blob = await toCodeZip([{ title: 'Hello', code: 'print(1)', language: 'python' }])
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.size).toBeGreaterThan(0)
  })
})
