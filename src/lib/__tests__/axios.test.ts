import { describe, it, expect, beforeEach, vi } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { apiClient, publicClient } from '../axios'
import { useAuthStore } from '@/store/authStore'

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    accessToken: 'old-access-token',
    isAuthenticated: true,
    tenant: null,
  })
  localStorage.clear()
  vi.clearAllMocks()
  // Reset window.location mock
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { href: '' },
  })
})

describe('apiClient interceptors', () => {
  it('injects Authorization header when accessToken is set', async () => {
    const mockApi = new MockAdapter(apiClient)
    let capturedAuth = ''

    mockApi.onGet('/test').reply((config) => {
      capturedAuth = config.headers?.Authorization ?? ''
      return [200, { ok: true }]
    })

    await apiClient.get('/test')

    expect(capturedAuth).toBe('Bearer old-access-token')
    mockApi.restore()
  })

  it('retries original request with new token after successful refresh', async () => {
    const mockApi = new MockAdapter(apiClient)
    const mockPublic = new MockAdapter(publicClient)

    mockApi
      .onGet('/test')
      .replyOnce(401)
      .onGet('/test')
      .replyOnce(200, { ok: true })

    mockPublic
      .onPost('/auth/refresh-token')
      .replyOnce(200, { access_token: 'new-access-token', refresh_token: 'new-refresh-token' })

    localStorage.setItem('ws-refreshToken', 'valid-refresh-token')

    const response = await apiClient.get('/test')

    expect(response.data).toEqual({ ok: true })
    expect(useAuthStore.getState().accessToken).toBe('new-access-token')
    expect(localStorage.getItem('ws-refreshToken')).toBe('new-refresh-token')

    mockApi.restore()
    mockPublic.restore()
  })

  it('clears auth and rejects when refresh token is missing', async () => {
    const mockApi = new MockAdapter(apiClient)

    mockApi.onGet('/test').replyOnce(401)
    localStorage.removeItem('ws-refreshToken')

    await expect(apiClient.get('/test')).rejects.toBeDefined()

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().accessToken).toBeNull()

    mockApi.restore()
  })
})
