import axios, { AxiosError } from 'axios'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterEach, beforeEach, expect, test } from 'vitest'
import { withAbortController } from '../src/utils/withAbortController'
import delay from './utils/delay'

const server = setupServer(
  http.get('http://test-server/api/slow', async () => {
    await delay(1000) // Simulate a slow request
    return HttpResponse.json({ data: 'success' })
  }),
  http.get('http://test-server/api/fast', async () => {
    await delay(100) // Simulate a fast request
    return HttpResponse.json({ data: 'fast-response' })
  }),
)

const client = axios.create()

beforeEach(() => {
  server.listen() // Start the server before each test
})

test('Should abort first request when second request is made', async () => {
  const wrappedRequest = withAbortController(async (signal) => {
    return await client.get('http://test-server/api/slow', { signal })
  })

  // Start first request
  const firstRequest = wrappedRequest()

  // Start second request immediately (should abort first)
  await delay(100) // Small delay to ensure first request has started
  const secondRequest = wrappedRequest()

  // First request should be aborted
  try {
    await firstRequest
    expect.fail('First request should have been aborted')
  }
  catch (error) {
    expect((error as AxiosError).name).toBe('CanceledError')
  }

  // Second request should succeed
  const result = await secondRequest
  expect(result.data).toEqual({ data: 'success' })
})

test('Should complete request when no subsequent request is made', async () => {
  const wrappedRequest = withAbortController(async (signal) => {
    return await client.get('http://test-server/api/fast', { signal })
  })

  const result = await wrappedRequest()
  expect(result.data).toEqual({ data: 'fast-response' })
})

test('Should abort multiple previous requests', async () => {
  const wrappedRequest = withAbortController(async (signal) => {
    return await client.get('http://test-server/api/slow', { signal })
  })

  // Start three requests in quick succession
  wrappedRequest().then(() => {
    expect.fail('First request should have been aborted')
  }).catch((error) => {
    expect((error as AxiosError).name).toBe('CanceledError')
  })
  await delay(50)
  wrappedRequest().then(() => {
    expect.fail('Second request should have been aborted')
  }).catch((error) => {
    expect((error as AxiosError).name).toBe('CanceledError')
  })
  await delay(50)
  const thirdRequest = wrappedRequest()

  // Third request should succeed
  const result = await thirdRequest
  expect(result.data).toEqual({ data: 'success' })
})

test('Should handle errors from callback', async () => {
  const wrappedRequest = withAbortController(async () => {
    throw new Error('Callback error')
  })

  try {
    await wrappedRequest()
    expect.fail('Should have thrown an error')
  }
  catch (error) {
    expect((error as Error).message).toBe('Callback error')
  }
})

test('Should work with different axios requests', async () => {
  const wrappedSlowRequest = withAbortController(async (signal) => {
    return await client.get('http://test-server/api/slow', { signal })
  })

  const wrappedFastRequest = withAbortController(async (signal) => {
    return await client.get('http://test-server/api/fast', { signal })
  })

  // Each wrapped function should have its own abort controller
  const slowRequest = wrappedSlowRequest()
  const fastResult = await wrappedFastRequest()

  expect(fastResult.data).toEqual({ data: 'fast-response' })

  // The slow request should still complete since it has its own controller
  const slowResult = await slowRequest
  expect(slowResult.data).toEqual({ data: 'success' })
})

afterEach(() => {
  server.close() // Stop the server after each test
})
