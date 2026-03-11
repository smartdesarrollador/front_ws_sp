import { describe, it, expect } from 'vitest'
import axios from 'axios'

// El server MSW ya está activo (montado en setup.ts via beforeAll)
// Usar baseURL absoluta que coincide con los handlers
const client = axios.create({ baseURL: 'http://localhost:8000/api/v1' })

describe('MSW Handlers', () => {
  it('POST /auth/login returns tokens and user', async () => {
    const res = await client.post('/auth/login', { email: 'x', password: 'y' })
    expect(res.data.access_token).toBe('mock-access-token')
    expect(res.data.user.email).toBe('user@acme.com')
  })

  it('GET /features/ returns plan and features', async () => {
    const res = await client.get('/features/')
    expect(res.data.plan).toBe('professional')
    expect(res.data.features.analytics).toBe(true)
  })

  it('GET /app/tasks/ returns results array', async () => {
    const res = await client.get('/app/tasks/')
    expect(Array.isArray(res.data.results)).toBe(true)
  })

  it('POST /auth/refresh-token returns refreshed token', async () => {
    const res = await client.post('/auth/refresh-token')
    expect(res.data.access_token).toBe('refreshed')
  })
})
