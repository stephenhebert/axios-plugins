import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect, test } from 'vitest'

test('MSW should mock API responses', async () => {
  const server = setupServer(
    http.get('http://some-cool-server/api/data', () => {
      return HttpResponse.json({ message: 'Hello, world!' })
    }),
  )
  // Start the server before running the test
  server.listen()

  const response = await fetch('http://some-cool-server/api/data')
  const data = await response.json()

  expect(response.status).toBe(200)
  expect(data).toEqual({ message: 'Hello, world!' })

  // Stop the server after the test
  server.close()
})
