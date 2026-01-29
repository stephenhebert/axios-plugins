import axios from 'axios'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { install } from '../src/plugins/inflightCache'
import delay from './utils/delay'
let count = 0

describe('Enabled by default', () => {
  const server = setupServer(
    http.get('http://some-cool-server/api/data', async () => {
      const localCount = count += 1
      await delay(500) // Simulate a delay to mimic a slow request
      return HttpResponse.json({ count: localCount })
    }),
  )
  const client = axios.create({
    plugins: {
      inflightCache: true, // Enable inflight cache by default
    },
  })
  install(client)

  beforeEach(() => {
    count = 0 // Reset the count for the next test
    server.listen() // Start the server before each test
  })

  test('Should return duplicate response if subsequent matching requests are initiated before initial request is completed', async () => {
    const request1 = client.get('http://some-cool-server/api/data')
    const request2 = client.get('http://some-cool-server/api/data')
    const request3 = client.get('http://some-cool-server/api/data')
    const request4 = client.get('http://some-cool-server/api/data')
    const request5 = client.get('http://some-cool-server/api/data')
    const [response1,
      response2,
      response3,
      response4,
      response5] = await Promise.all([request1,
      request2,
      request3,
      request4,
      request5])

    expect(response1.status).toBe(200)
    expect(response1.data).toEqual({ count: 1 })
    expect(response2.status).toBe(200)
    expect(response2.data).toEqual({ count: 1 })
    expect(response3.status).toBe(200)
    expect(response3.data).toEqual({ count: 1 })
    expect(response4.status).toBe(200)
    expect(response4.data).toEqual({ count: 1 })
    expect(response5.status).toBe(200)
    expect(response5.data).toEqual({ count: 1 })
  })

  test('Should not be used if it is disabled', async () => {
    const request1 = client.get('http://some-cool-server/api/data', { plugins: { inflightCache: false } })
    const request2 = client.get('http://some-cool-server/api/data', { plugins: { inflightCache: false } })
    const request3 = client.get('http://some-cool-server/api/data', { plugins: { inflightCache: false } })
    const request4 = client.get('http://some-cool-server/api/data', { plugins: { inflightCache: false } })
    const request5 = client.get('http://some-cool-server/api/data', { plugins: { inflightCache: false } })
    const [response1,
      response2,
      response3,
      response4,
      response5] = await Promise.all([request1,
      request2,
      request3,
      request4,
      request5])

    expect(response1.status).toBe(200)
    expect(response1.data).toEqual({ count: 1 })
    expect(response2.status).toBe(200)
    expect(response2.data).toEqual({ count: 2 })
    expect(response3.status).toBe(200)
    expect(response3.data).toEqual({ count: 3 })
    expect(response4.status).toBe(200)
    expect(response4.data).toEqual({ count: 4 })
    expect(response5.status).toBe(200)
    expect(response5.data).toEqual({ count: 5 })
  })

  test('Should not persist after the request is completed', async () => {
    const response1 = await client.get('http://some-cool-server/api/data')
    const response2 = await client.get('http://some-cool-server/api/data')
    const response3 = await client.get('http://some-cool-server/api/data')
    const response4 = await client.get('http://some-cool-server/api/data')
    const response5 = await client.get('http://some-cool-server/api/data')
    expect(response1.status).toBe(200)
    expect(response1.data).toEqual({ count: 1 })
    expect(response2.status).toBe(200)
    expect(response2.data).toEqual({ count: 2 })
    expect(response3.status).toBe(200)
    expect(response3.data).toEqual({ count: 3 })
    expect(response4.status).toBe(200)
    expect(response4.data).toEqual({ count: 4 })
    expect(response5.status).toBe(200)
    expect(response5.data).toEqual({ count: 5 })
    // Ensure that the inflight cache is empty after the requests
    expect(client.inflightCache.size).toBe(0)
  })

  afterEach(() => {
    server.close() // Stop the server after each test
  })
})

describe('Disabled by default', () => {
  const server = setupServer(
    http.get('http://some-cool-server/api/data', async () => {
      const localCount = count += 1
      await delay(500) // Simulate a delay to mimic a slow request
      return HttpResponse.json({ count: localCount })
    }),
  )
  const client = axios.create({})
  install(client)

  beforeEach(() => {
    count = 0 // Reset the count for the next test
    server.listen() // Start the server before each test
  })

  test('Should return duplicate response if subsequent matching requests are initiated before initial request is completed', async () => {
    const request1 = client.get('http://some-cool-server/api/data', { plugins: { inflightCache: true } })
    const request2 = client.get('http://some-cool-server/api/data', { plugins: { inflightCache: true } })
    const request3 = client.get('http://some-cool-server/api/data', { plugins: { inflightCache: true } })
    const request4 = client.get('http://some-cool-server/api/data', { plugins: { inflightCache: true } })
    const request5 = client.get('http://some-cool-server/api/data', { plugins: { inflightCache: true } })
    const [response1,
      response2,
      response3,
      response4,
      response5] = await Promise.all([request1,
      request2,
      request3,
      request4,
      request5])

    expect(response1.status).toBe(200)
    expect(response1.data).toEqual({ count: 1 })
    expect(response2.status).toBe(200)
    expect(response2.data).toEqual({ count: 1 })
    expect(response3.status).toBe(200)
    expect(response3.data).toEqual({ count: 1 })
    expect(response4.status).toBe(200)
    expect(response4.data).toEqual({ count: 1 })
    expect(response5.status).toBe(200)
    expect(response5.data).toEqual({ count: 1 })
  })

  test('Should not be used if it is disabled', async () => {
    const request1 = client.get('http://some-cool-server/api/data')
    const request2 = client.get('http://some-cool-server/api/data')
    const request3 = client.get('http://some-cool-server/api/data')
    const request4 = client.get('http://some-cool-server/api/data')
    const request5 = client.get('http://some-cool-server/api/data')
    const [response1,
      response2,
      response3,
      response4,
      response5] = await Promise.all([request1,
      request2,
      request3,
      request4,
      request5])

    expect(response1.status).toBe(200)
    expect(response1.data).toEqual({ count: 1 })
    expect(response2.status).toBe(200)
    expect(response2.data).toEqual({ count: 2 })
    expect(response3.status).toBe(200)
    expect(response3.data).toEqual({ count: 3 })
    expect(response4.status).toBe(200)
    expect(response4.data).toEqual({ count: 4 })
    expect(response5.status).toBe(200)
    expect(response5.data).toEqual({ count: 5 })
  })

  afterEach(() => {
    server.close() // Stop the server after each test
  })
})
