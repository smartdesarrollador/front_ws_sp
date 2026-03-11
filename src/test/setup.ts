import '@testing-library/jest-dom'
import axios from 'axios'
import { server } from './server'
import { toHaveNoViolations } from 'jest-axe'
import type { RunOptions } from 'axe-core'

// MSW intercepta el módulo http de Node.js, no jsdom XHR
axios.defaults.adapter = 'http'

// ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// IntersectionObserver (audit infinite scroll)
globalThis.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  constructor() {}
} as unknown as typeof IntersectionObserver

expect.extend(toHaveNoViolations)

export const axeConfig: RunOptions = {
  rules: { 'color-contrast': { enabled: false } },
}

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
