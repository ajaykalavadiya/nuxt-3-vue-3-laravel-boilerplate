import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, http, onUnauthorized, tokenStorage } from './http'

function mockFetch(status: number, body?: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), { status }),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('http', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.unstubAllGlobals())

  it('sends JSON with the bearer token and query string', async () => {
    tokenStorage.set('abc')
    const fetchMock = mockFetch(200, { ok: true })

    await http('/products', { method: 'POST', body: { name: 'x' }, query: { page: 2, search: '' } })

    const [url, init] = fetchMock.mock.calls[0]!
    expect(String(url)).toMatch(/\/products\?page=2$/) // empty values are dropped
    expect(init.headers.Authorization).toBe('Bearer abc')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(init.body).toBe('{"name":"x"}')
  })

  it('returns undefined for 204 responses', async () => {
    mockFetch(204)
    await expect(http('/logout', { method: 'POST' })).resolves.toBeUndefined()
  })

  it('throws ApiError carrying Laravel validation errors on 422', async () => {
    mockFetch(422, { message: 'Invalid', errors: { sku: ['taken'] } })

    const error = await http('/products').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 422, message: 'Invalid', errors: { sku: ['taken'] } })
  })

  it('calls the unauthorized handler on 401 only when a token was sent', async () => {
    const handler = vi.fn()
    onUnauthorized(handler)

    mockFetch(401, { message: 'Unauthenticated.' })
    await http('/me').catch(() => {})
    expect(handler).not.toHaveBeenCalled()

    tokenStorage.set('expired')
    await http('/me').catch(() => {})
    expect(handler).toHaveBeenCalledOnce()
  })
})
