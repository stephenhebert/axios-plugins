import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

declare module 'axios' {
  interface AxiosRequestConfigPlugins {
    allow404?: boolean
  }
  interface AxiosRequestConfig {
    plugins?: AxiosRequestConfigPlugins
  }
}

/**
 * Validates the HTTP status code, allowing 404 responses if the plugin is enabled.
 * @param status - HTTP status code.
 * @returns `true` if the status is valid, otherwise `false`.
 */
function validateStatusAllow404(status: number): boolean {
  // Allow 404 status code if the plugin is enabled
  return status === 404 || (status >= 200 && status < 300)
}

/**
 * Installs the allow404 plugin into an Axios instance.
 * Enables handling of 404 responses gracefully without throwing errors.
 * @param client - Axios instance to install the plugin on.
 */
export function install(client: AxiosInstance): void {
  client.interceptors.request.use(
    (request: InternalAxiosRequestConfig) => {
      if (request.plugins?.allow404 === true) {
        request.validateStatus = validateStatusAllow404
      }
      return request
    },
  )
}
