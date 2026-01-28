import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

/**
 * Configuration options for the getAllPages plugin.
 */
interface getAllPagesConfig {
  resultsParam?: string
  pageParam?: string
  nextPageParam?: string
  pageSizeParam?: string
  totalResultsParam?: string
}

declare module 'axios' {
  interface AxiosRequestConfigPlugins {
    getAllPages?: boolean
    getAllPagesConfig?: getAllPagesConfig
  }
  interface AxiosRequestConfig {
    plugins?: AxiosRequestConfigPlugins
  }
}

/**
 * Generates an array of numbers within a specified range.
 * @param start - Starting number of the range.
 * @param end - Ending number of the range.
 * @returns An array of numbers from start to end.
 */
function arrayRange(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/**
 * Installs the getAllPages plugin into an Axios instance.
 * Automatically fetches all paginated API results.
 * @param client - Axios instance to install the plugin on.
 */
export function install(client: AxiosInstance): void {
  client.interceptors.request.use((request: InternalAxiosRequestConfig) => {
    const getAllPagesConfig = request.plugins?.getAllPagesConfig || {}
    const { pageSizeParam = 'page_size' } = getAllPagesConfig
    if (request.plugins?.getAllPages === true) {
      request.params = {
        ...request.params,
        [pageSizeParam]: request.params?.[pageSizeParam] || 100,
      }
    }
    return request
  })

  client.interceptors.response.use(async (response: AxiosResponse) => {
    const getAllPagesConfig = response.config.plugins?.getAllPagesConfig || {}
    const {
      resultsParam = 'results',
      pageParam = 'page',
      pageSizeParam = 'page_size',
      nextPageParam = 'next',
      totalResultsParam = 'count',
    } = getAllPagesConfig
    if (response.config.plugins?.getAllPages === true) {
      const signal = response.config.signal
      if (signal && signal.aborted) {
        return response
      }
      const results: unknown[] = []
      const currentPage = response.data[resultsParam] || []
      results.push(...currentPage)

      const page = response.data[pageParam] || 1
      const pageSize = response.data[pageSizeParam]
      const totalResults = response.data[totalResultsParam] || 0

      const totalPages = Math.ceil(totalResults / pageSize)
      const remainingPages = totalPages - page
      const nextPageUrl = response.data[nextPageParam]
      if (remainingPages > 0 && nextPageUrl) {
        const nextPage = page + 1
        const lastPage = page + remainingPages

        const headers = response.config.headers
        const { origin, pathname, search } = new URL(nextPageUrl)
        const url = `${origin}${pathname}`
        const params = new URLSearchParams(search)
        const remainingPageRequestPromises = arrayRange(nextPage, lastPage).map((pageNumber) => {
          params.set(pageParam, pageNumber.toString())
          return client.request({
            method: 'get',
            url: `${url}?${params.toString()}`,
            plugins: {
              getAllPages: false, // Disable getAllPages for subsequent requests
              getAllPagesConfig: response.config.plugins?.getAllPagesConfig || {},
            },
            headers,
            signal, // Pass the signal to subsequent requests
          })
        })
        const remainingPageResponses = await Promise.all(remainingPageRequestPromises)
        const remainingPageResponseData = remainingPageResponses.flatMap(res => res.data[resultsParam] || [])
        results.push(...remainingPageResponseData)
      }
      response.data = results
    }
    return response
  })
}
