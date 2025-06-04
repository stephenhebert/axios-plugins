import axios from 'axios'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterEach, beforeEach, expect, test } from 'vitest'
import { install } from '../src/getAllPages'
import delay from './utils/delay'

const server = setupServer(
  http.get('http://some-cool-server/api/data', async (config) => {
    const page = new URL(config.request.url).searchParams.get('page') || '1'
    await delay(500) // Simulate a delay to mimic a slow request
    switch (page) {
      case '1':
        return HttpResponse.json({
          results: [{ id: 1, name: 'Item 1' }],
          next: `http://some-cool-server/api/data?page=2`,
          page_size: 1,
          count: 5,
        })
      case '2':
        return HttpResponse.json({
          results: [{ id: 2, name: 'Item 2' }],
          next: 'http://some-cool-server/api/data?page=3',
          page_size: 1,
          count: 5,
        })
      case '3':
        return HttpResponse.json({
          results: [{ id: 3, name: 'Item 3' }],
          next: 'http://some-cool-server/api/data?page=4',
          page_size: 1,
          count: 5,
        })
      case '4':
        return HttpResponse.json({
          results: [{ id: 4, name: 'Item 4' }],
          next: 'http://some-cool-server/api/data?page=5',
          page_size: 1,
          count: 5,
        })
      case '5':
        return HttpResponse.json({
          results: [{ id: 5, name: 'Item 5' }],
          next: null,
          page_size: 1,
          count: 5,
        })
    }
  }),
)

const client = axios.create({
  plugins: {
    getAllPages: true, // Allow 404 responses by default
  },
})
install(client)

beforeEach(() => {
  server.listen() // Start the server before each test
})

test('If enabled, should return all results', async () => {
  const response = await client.get('http://some-cool-server/api/data', { params: { page: 1 } })
  expect(response.status).toBe(200)
  expect(response.data.length).toBe(5) // Expect 5 items in the data array
})

// test('Should support custom results key', async () => {
// // TODO
// })

test('If disabled, should return only 1 page', async () => {
  const response = await client.get('http://some-cool-server/api/data', { params: { page: 1 }, plugins: { getAllPages: false } })
  expect(response.status).toBe(200)
  expect(response.data.results.length).toBe(1) // Expect 1 item in the data array
})

test('Should support abort signal', async () => {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), 500) // Abort after 1 second
  try {
    await client.get('http://some-cool-server/api/data', { params: { page: 1 }, signal: controller.signal, plugins: { getAllPages: true } })
  }
  catch (error) {
    expect(error.name).toBe('CanceledError') // Expect an AbortError
  }
})

afterEach(() => {
  server.close() // Stop the server after each test
})
