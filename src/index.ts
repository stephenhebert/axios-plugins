import * as allow404 from './allow404'
import * as getAllPages from './getAllPages'
import * as inflightCache from './inflightCache'

declare module 'axios' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AxiosRequestConfigPlugins {}
  interface AxiosRequestConfig {
    // Extend AxiosRequestConfig to include plugins
    plugins?: AxiosRequestConfigPlugins
  }
}

/**
 * Entry point for the Axios plugins library.
 * Exports all available plugins for use.
 */
export {
  allow404,
  getAllPages,
  inflightCache
}

