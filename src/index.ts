import * as allow404 from './plugins/allow404'
import * as getAllPages from './plugins/getAllPages'
import * as inflightCache from './plugins/inflightCache'
import { withAbortController } from './utils/withAbortController'

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
  inflightCache,
  withAbortController
}

