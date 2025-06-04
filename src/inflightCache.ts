import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AxiosError } from 'axios'

declare module 'axios' {
  interface AxiosInstance {
    inflightCache: Map<string, Promise<AxiosResponse>>
  }
  interface AxiosRequestConfigPlugins {
    inflightCache?: boolean
  }
}

function settle(resolve: (value: AxiosResponse) => void, reject: (reason?: unknown) => void, response: AxiosResponse) {
  const validateStatus = response.config.validateStatus
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response)
  }
  else {
    reject(new AxiosError(
      'Request failed with status code ' + response.status,
      [
        AxiosError.ERR_BAD_REQUEST,
        AxiosError.ERR_BAD_RESPONSE,
      ][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response,
    ))
  }
}

function serializeRequest(requestConfig: AxiosRequestConfig): string {
  const { baseURL, url, params } = requestConfig
  const qs = new URLSearchParams(params).toString()
  return `${baseURL ? baseURL : ''}${url}${qs ? `?${qs}` : ''}`
}

// TODO: test how this works with other plugins

export function install(client: AxiosInstance): void {
  client.inflightCache = new Map<string, Promise<AxiosResponse>>()

  const customAxiosFetchAdapter = async (requestConfig: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    const { url, method = 'GET', headers, fetchOptions, signal } = requestConfig
    const request = new Request(url!, {
      ...fetchOptions,
      signal: signal as AbortSignal | undefined,
      method: method.toUpperCase(),
      headers,
    })

    try {
      const response = await fetch(request, fetchOptions)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      const responseData = await response.json()

      return await new Promise((resolve, reject) => {
        settle(resolve, reject, {
          data: responseData,
          headers,
          status: response.status,
          statusText: response.statusText,
          config: requestConfig,
          request,
        })
      })
    }
    catch (error: unknown) {
      if (error && (error as Error).name === 'TypeError' && /Load failed|fetch/i.test((error as Error).message)) {
        throw Object.assign(
          new AxiosError('Network Error', AxiosError.ERR_NETWORK, requestConfig, request),
          {
            cause: (error as AxiosError).cause || error,
          },
        )
      }
      throw AxiosError.from(error, (error as AxiosError)?.code, requestConfig, request)
    }
  }

  const inflightCacheAdapter = (requestConfig: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    // serialize request to get cache key
    const cacheKey = serializeRequest(requestConfig)
    // if cache key exists, use promise stored in cache key
    if (client.inflightCache.has(cacheKey)) return client.inflightCache.get(cacheKey)!
    // if cache key doesn't exist, store promise in cache key
    const requestPromise = customAxiosFetchAdapter(requestConfig)
    client.inflightCache.set(cacheKey, requestPromise)
    return requestPromise
      .finally(() => {
        client.inflightCache.delete(cacheKey)
      })
  }

  client.interceptors.request.use((requestConfig: InternalAxiosRequestConfig) => {
    if ((requestConfig.method ?? 'get').toUpperCase() === 'GET' && requestConfig.plugins?.inflightCache === true) {
      requestConfig.adapter = inflightCacheAdapter
    }
    return requestConfig
  })
}
