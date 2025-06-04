import axios, { AxiosError } from 'axios'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { install } from '../src/allow404'
import delay from './utils/delay'

describe('Enabled by default', () => {
  const server = setupServer(
    http.get('http://some-cool-server/api/data', async () => {
      await delay(500) // Simulate a delay to mimic a slow request
      return new HttpResponse(null, { status: 404 })
    }),
  )
  const client = axios.create({
    plugins: {
      allow404: true, // Allow 404 responses by default
    },
  })
  install(client)

  beforeEach(() => {
    server.listen() // Start the server before each test
  })

  test('Should allow 404 if enabled', async () => {
    const response = await client.get('http://some-cool-server/api/data')
    expect(response.status).toBe(404)
  })

  test('Should allow 404 if disabled', async () => {
    let errorThrown = false
    try {
      await client.get('http://some-cool-server/api/data', { plugins: { allow404: false } })
    }
    catch (error) {
      errorThrown = true
      expect((error as AxiosError).response?.status).toBe(404) // Expect the error to have a 404 status
    }
    expect(errorThrown).toBe(true) // Ensure that an error was thrown
  })

  afterEach(() => {
    server.close() // Stop the server after each test
  })
})

describe('Disabled by default', () => {
  const server = setupServer(
    http.get('http://some-cool-server/api/data', async () => {
      await delay(500) // Simulate a delay to mimic a slow request
      return new HttpResponse(null, { status: 404 })
    }),
  )
  const client = axios.create({})
  install(client)

  beforeEach(() => {
    server.listen() // Start the server before each test
  })

  test('Should allow 404 if enabled', async () => {
    const response = await client.get('http://some-cool-server/api/data', { plugins: { allow404: true } })
    expect(response.status).toBe(404)
  })

  test('Should allow 404 if disabled', async () => {
    let errorThrown = false
    try {
      await client.get('http://some-cool-server/api/data')
    }
    catch (error) {
      errorThrown = true
      expect((error as AxiosError).response?.status).toBe(404) // Expect the error to have a 404 status
    }
    expect(errorThrown).toBe(true) // Ensure that an error was thrown
  })

  afterEach(() => {
    server.close() // Stop the server after each test
  })
})
