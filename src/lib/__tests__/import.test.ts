import { describe, it, expect } from 'vitest'
import { toCSV, toVCard, toBookmarksHTML, toICS, toMarkdownZip, toJSON } from '../export'
import {
  parseCSV,
  parseVCard,
  parseContactsCSV,
  parseBookmarksHTML,
  parseBookmarksJSON,
  parseContacts,
  parseBookmarks,
  parseICS,
  parseTasksCSV,
  parseNotesJSON,
  parseNotesZip,
} from '../import'

describe('parseCSV', () => {
  it('round-trips quoted fields from toCSV (commas, quotes, newlines)', () => {
    const rows = [{ a: 'Doe, Jane', b: 'say "hi"', c: 'l1\nl2' }]
    const csv = toCSV(rows, [
      { label: 'A', value: (r) => r.a },
      { label: 'B', value: (r) => r.b },
      { label: 'C', value: (r) => r.c },
    ])
    const parsed = parseCSV(csv)
    expect(parsed[0]).toEqual(['A', 'B', 'C'])
    expect(parsed[1]).toEqual(['Doe, Jane', 'say "hi"', 'l1\nl2'])
  })

  it('handles a trailing newline without an empty row', () => {
    expect(parseCSV('a,b\r\nx,y\r\n')).toEqual([
      ['a', 'b'],
      ['x', 'y'],
    ])
  })
})

describe('parseVCard', () => {
  it('parses the output of toVCard', () => {
    const vcf = toVCard([
      { name: 'Jane Doe', email: 'jane@x.com', phone: '+1 555', company: 'Acme', job_title: 'Eng' },
    ])
    const parsed = parseVCard(vcf)
    expect(parsed).toHaveLength(1)
    expect(parsed[0]).toMatchObject({
      name: 'Jane Doe',
      email: 'jane@x.com',
      phone: '+1 555',
      company: 'Acme',
      job_title: 'Eng',
    })
  })

  it('ignores property params on keys (EMAIL;TYPE=INTERNET)', () => {
    const vcf = 'BEGIN:VCARD\r\nVERSION:3.0\r\nFN:A B\r\nEMAIL;TYPE=INTERNET:a@b.com\r\nEND:VCARD'
    expect(parseVCard(vcf)[0]).toMatchObject({ name: 'A B', email: 'a@b.com' })
  })
})

describe('parseContactsCSV', () => {
  it('maps Spanish/English headers and recovers an escaped name', () => {
    const csv = toCSV([{ name: 'Doe, Jane', email: 'j@x.com', phone: '555' }], [
      { label: 'Nombre', value: (r) => r.name },
      { label: 'Email', value: (r) => r.email },
      { label: 'Teléfono', value: (r) => r.phone },
    ])
    const parsed = parseContactsCSV(csv)
    expect(parsed).toEqual([{ name: 'Doe, Jane', email: 'j@x.com', phone: '555' }])
  })
})

describe('parseBookmarksHTML', () => {
  it('parses anchors from the Netscape export', () => {
    const html = toBookmarksHTML([
      { title: 'A & B', url: 'https://x.com?a=1&b=2', tags: ['dev', 'tools'] },
    ])
    const parsed = parseBookmarksHTML(html)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].url).toBe('https://x.com?a=1&b=2')
    expect(parsed[0].title).toBe('A & B')
    expect(parsed[0].tags).toEqual(['dev', 'tools'])
  })
})

describe('parseBookmarksJSON', () => {
  it('maps an exported bookmarks JSON array', () => {
    const json = JSON.stringify([
      { url: 'https://a.com', title: 'A', description: 'd', tags: ['t'] },
      { title: 'no url' },
    ])
    const parsed = parseBookmarksJSON(json)
    expect(parsed).toHaveLength(1)
    expect(parsed[0]).toEqual({ url: 'https://a.com', title: 'A', description: 'd', tags: ['t'] })
  })

  it('returns [] on malformed JSON', () => {
    expect(parseBookmarksJSON('{not json')).toEqual([])
  })
})

describe('dispatchers', () => {
  it('parseContacts picks vCard by extension and content', () => {
    const vcf = toVCard([{ name: 'X Y', email: 'x@y.com' }])
    expect(parseContacts(vcf, 'export.vcf')).toHaveLength(1)
    expect(parseContacts(vcf, 'unknown.txt')[0].name).toBe('X Y') // sniffs BEGIN:VCARD
  })

  it('parseBookmarks picks JSON / HTML by content', () => {
    expect(parseBookmarks('[{"url":"https://a.com","title":"A"}]', 'x.json')).toHaveLength(1)
    const html = toBookmarksHTML([{ title: 'A', url: 'https://a.com' }])
    expect(parseBookmarks(html, 'x.html')).toHaveLength(1)
  })
})

describe('parseICS', () => {
  it('round-trips a timed event from toICS (backend datetime contract)', () => {
    const ics = toICS([
      {
        id: 'e1',
        title: 'Standup, daily',
        description: 'notes',
        start_date: '2026-06-01T09:00:00Z',
        end_date: '2026-06-01T09:30:00Z',
        location: 'Room 1',
      },
    ])
    const parsed = parseICS(ics)
    expect(parsed).toHaveLength(1)
    expect(parsed[0]).toMatchObject({
      title: 'Standup, daily',
      start_datetime: '2026-06-01T09:00:00Z',
      end_datetime: '2026-06-01T09:30:00Z',
      location: 'Room 1',
      is_all_day: false,
    })
  })

  it('marks all-day events from a VALUE=DATE DTSTART', () => {
    const ics = toICS([
      { id: 'e2', title: 'Holiday', start_date: '2026-06-01T00:00:00Z', end_date: '2026-06-02T00:00:00Z', all_day: true },
    ])
    const parsed = parseICS(ics)
    expect(parsed[0].is_all_day).toBe(true)
    expect(parsed[0].start_datetime).toBe('2026-06-01T00:00:00Z')
  })
})

describe('parseTasksCSV', () => {
  it('round-trips the tasks CSV columns', () => {
    const csv = toCSV([{ title: 'Fix bug', status: 'todo', priority: 'high', due: '2026-07-01' }], [
      { label: 'Título', value: (r) => r.title },
      { label: 'Estado', value: (r) => r.status },
      { label: 'Prioridad', value: (r) => r.priority },
      { label: 'Vencimiento', value: (r) => r.due },
    ])
    expect(parseTasksCSV(csv)).toEqual([
      { title: 'Fix bug', status: 'todo', priority: 'high', due_date: '2026-07-01' },
    ])
  })
})

describe('parseNotesJSON', () => {
  it('maps a notes JSON export array', () => {
    const json = toJSON([
      { id: 'n1', title: 'N1', content: 'hello', category: 'work', tags: ['a'], is_pinned: true },
    ])
    expect(parseNotesJSON(json)[0]).toMatchObject({
      title: 'N1',
      content: 'hello',
      category: 'work',
      tags: ['a'],
      is_pinned: true,
    })
  })
})

describe('parseNotesZip', () => {
  it('round-trips notes through toMarkdownZip (title + content recovered)', async () => {
    const blob = await toMarkdownZip([
      { title: 'My Note', content: 'line one\nline two', category: 'work', tags: ['x'] },
    ])
    const buf = await blob.arrayBuffer()
    const parsed = await parseNotesZip(buf)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].title).toBe('My Note')
    expect(parsed[0].content).toContain('line one')
    expect(parsed[0].content).toContain('line two')
  })
})
