import axios from 'axios'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect, test } from 'vitest'

const server = setupServer(
  http.get('http://some-cool-server/api/data', () => {
    return HttpResponse.json({ message: 'Hello, world!' })
  }),
)
const client = axios.create({})

test('MSW should mock API responses with Axios', async () => {
  // Start the server before running the test
  server.listen()

  const response = await client.get('http://some-cool-server/api/data')

  expect(response.status).toBe(200)
  expect(response.data).toEqual({ message: 'Hello, world!' })

  // Stop the server after the test
  server.close()
})
